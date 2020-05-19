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
import path = require("path");

export class GradleUploaderStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = this.createBucket();

    const layer = new LayerVersion(this, "GradleUploaderLayer", {
      code: Code.fromAsset(path.join(__dirname, "../layer-code")),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: "Apache-2.0",
      description: "A layer containing dependencies for thr Gradle Uploader",
    });

    const fn = new Function(this, "fnUpload", {
      runtime: Runtime.PYTHON_3_7,
      description: "Download Gradle distribution to S3 bucket",
      handler: "gradleUploader.main",
      code: Code.fromAsset("./lambda/"),
      timeout: Duration.minutes(5),
      layers: [layer],
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });
    bucket.grantReadWrite(fn);

    const target = new LambdaFunction(fn);
    new Rule(this, "ScheduleRule", {
      schedule: Schedule.cron({ minute: "0", hour: "0", day: "1", month: "*" }),
      targets: [target],
    });

    new CfnOutput(this, "bucketArnOutput", {
      value: bucket.bucketArn,
      description: "Bucket ARN",
    });
  }

  createBucket(): Bucket {
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
    });
    bucketContentStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32",
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket", "s3:GetBucketLocation"],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
    });
    bucketStatement.addCondition("IpAddress", {
      "aws:SourceIp": "87.122.220.125/32",
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
