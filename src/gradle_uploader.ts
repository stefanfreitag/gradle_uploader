import * as path from 'path';
import {
  Function,
  Runtime,
  LayerVersion,
  Code,
} from 'aws-cdk-lib//aws-lambda';
import { RetentionDays } from 'aws-cdk-lib//aws-logs';
import { Topic } from 'aws-cdk-lib//aws-sns';
import { EmailSubscription } from 'aws-cdk-lib//aws-sns-subscriptions';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketPolicy,
} from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

/**
 * Properties related to forwarding messages to Slack.
 */
export interface SlackProperties{
  /** The Slack webhook used to send messages. Details on setting up a webhook can be found at https://api.slack.com/messaging/webhooks.
   *  @experimental
  */
  readonly webhook: string;
}

/**
 * Properties related to forwarding messages via mail.
 */
export interface MailProperties {

  readonly subscribers: Array<string>;
}

/**
 * Types of available Gradle distributions.
 */
export enum GradleDistribution{
  /**
   * Binaries only.
   */
  BIN,
  /**
   * Binaries, sources and documentation.
   */
  ALL,
  /**
   * BINARY and ALL.
   */
  BOTH
}

export interface UploaderProperties {
  /**
   * Optional properties required for sending messages via Slack.
   */
  readonly slackProperties?: SlackProperties;
  /**
   * Optional properties required for sending messages via mail.
   */
  readonly mailProperties?: MailProperties;
  readonly whitelist: Array<string>;
  readonly schedule?: Schedule;
  /**
   * The {@link GradleDistribution | Gradle distribution} type to download. If no value is specified, only the binaries will be downloaded.
   */
  readonly distribution?: GradleDistribution;
}

export class GradleUploader extends Construct {
  constructor(
    scope: Construct,
    id: string,
    uploaderProperties: UploaderProperties ) {
    super(scope, id);

    const topic = this.createTopic();
    if (uploaderProperties.mailProperties?.subscribers) {
      this.addSubscribers(topic, uploaderProperties.mailProperties?.subscribers );
    }
    const bucket = this.createBucket(uploaderProperties.whitelist);
    const layer = this.createLambdaLayer();
    const fn = this.createFunction(layer, bucket, topic);

    if (uploaderProperties.slackProperties?.webhook) {
      fn.addEnvironment('WEBHOOK_URL', uploaderProperties.slackProperties?.webhook);
    }

    let distribution: GradleDistribution;
    if (uploaderProperties.distribution === undefined) {
      distribution = GradleDistribution.BIN;
    } else {
      distribution = uploaderProperties.distribution;
    }
    fn.addEnvironment('GRADLE_DISTRIBUTION', GradleDistribution[distribution]);


    bucket.grantReadWrite(fn);
    topic.grantPublish(fn);

    const schedule =
      uploaderProperties.schedule != null
        ? uploaderProperties.schedule
        : Schedule.cron({ minute: '0', hour: '0', day: '*' });
    this.createTrigger(fn, schedule);

    new CfnOutput(this, 'bucketArnOutput', {
      value: bucket.bucketArn,
      description: 'Bucket ARN',
    });
  }

  private createTrigger(fn: Function, schedule: Schedule) {
    const target = new LambdaFunction(fn);
    new Rule(this, 'ScheduleRule', {
      schedule: schedule,
      targets: [target],
    });
  }

  private createFunction(layer: LayerVersion, bucket: Bucket, topic: Topic) {

    return new Function(this, 'fnUpload', {
      runtime: Runtime.PYTHON_3_8,
      description: 'Download Gradle distribution to S3 bucket',
      code: Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'gradle_uploader.main',
      timeout: Duration.minutes(5),
      memorySize: 512,
      logRetention: RetentionDays.ONE_WEEK,
      layers: [layer],
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TOPIC_ARN: topic.topicArn,
      },
    });
  }

  private createLambdaLayer(): LayerVersion {
    return new LayerVersion(this, 'GradleUploaderLayer', {
      code: Code.fromAsset(path.join(__dirname, '../layer-code')),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'A layer containing dependencies for the Gradle Uploader',
    });
  }

  /**
   * Add mail subscriptions to the SNS topic.
   * @param subscriber The mail addresses to add to the SNS topic as subscriber.
   */
  private addSubscribers(topic: Topic, subscribers:Array<string>) {
    for (var subscriber of subscribers) {
      topic.addSubscription(new EmailSubscription(subscriber));
    }
  }
  private createTopic() {
    return new Topic(this, 'NotificationTopic', {});
  }

  createBucket(whitelist: Array<string>): Bucket {
    const bucket = new Bucket(this, 'bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucketContentStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [bucket.bucketArn + '/*'],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': whitelist,
        },
      },
    });

    const bucketStatement: PolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:ListBucket', 's3:GetBucketLocation'],
      resources: [bucket.bucketArn],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': whitelist,
        },
      },
    });

    const bucketPolicy = new BucketPolicy(this, 'bucketPolicy', {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      bucketContentStatement,
      bucketStatement,
    );
    return bucket;
  }
}
