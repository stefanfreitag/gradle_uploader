import * as cdk from "@aws-cdk/core";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketPolicy,
} from "@aws-cdk/aws-s3";
import {
  Function,
  Runtime,
  Code,
  LogRetention,
  LayerVersion,
} from "@aws-cdk/aws-lambda";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { Duration, CfnOutput, RemovalPolicy } from "@aws-cdk/core";
import { AnyPrincipal, PolicyStatement, Effect } from "@aws-cdk/aws-iam";
import { Schedule, Rule } from "@aws-cdk/aws-events";
import { Topic } from "@aws-cdk/aws-sns";
import { EmailSubscription } from "@aws-cdk/aws-sns-subscriptions";
import path = require("path");

export interface GradleUploaderStackProps {
  readonly subscribers: Array<string>;
  readonly whitelist: Array<string>;
  readonly schedule?: Schedule;
}

export class GradleUploaderStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    uploaderProperties: GradleUploaderStackProps,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const topic = this.createTopic(uploaderProperties);
    const bucket = this.createBucket(uploaderProperties.whitelist);
    const layer = this.createLambdaLayer();
    const fn = this.createFunction(layer, bucket, topic);
    bucket.grantReadWrite(fn);
    topic.grantPublish(fn);

    const schedule =
      uploaderProperties.schedule != null
        ? uploaderProperties.schedule
        : Schedule.cron({ minute: "0", hour: "0", day: "*" });
    this.createTrigger(fn, schedule);

    new CfnOutput(this, "bucketArnOutput", {
      value: bucket.bucketArn,
      description: "Bucket ARN",
    });
  }

  private createTrigger(fn: Function, schedule: Schedule) {
    const target = new LambdaFunction(fn);
    new Rule(this, "ScheduleRule", {
      schedule: schedule,
      targets: [target],
    });
  }

  private createFunction(layer: LayerVersion, bucket: Bucket, topic: Topic) {
    return new Function(this, "fnUpload", {
      runtime: Runtime.PYTHON_3_8,
      description: "Download Gradle distribution to S3 bucket",
      handler: "gradleUploader.main",
      code: Code.fromAsset("./lambda/"),
      timeout: Duration.minutes(5),
      memorySize: 512,
      layers: [layer],
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TOPIC_ARN: topic.topicArn,
      },
    });
  }

  private createLambdaLayer() {
    return new LayerVersion(this, "GradleUploaderLayer", {
      code: Code.fromAsset(path.join(__dirname, "../layer-code")),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: "Apache-2.0",
      description: "A layer containing dependencies for thr Gradle Uploader",
    });
  }

  private createTopic(uploaderProperties: GradleUploaderStackProps) {
    const topic = new Topic(this, "NotificationTopic", {});
    for (var subscriber of uploaderProperties.subscribers) {
      topic.addSubscription(new EmailSubscription(subscriber));
    }
    return topic;
  }

  createBucket(whitelist: Array<string>): Bucket {
    const bucket = new Bucket(this, "bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn + "/*"],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          "aws:SourceIp": whitelist
        },
      },
    });
    //TODO Iterate over array

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          "aws:SourceIp": whitelist
        },
      },
    });

    const bucketPolicy = new BucketPolicy(this, "bucketPolicy", {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement
    );
    return bucket;
  }
}
