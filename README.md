# Gradle Uploader

This CDK stack monitors the releases of the [Gradle](https://gradle.org/) build software. Each new release will be made available as copy in an S3 bucket. Internally the stack uses

* an [S3](https://aws.amazon.com/s3/) bucket for storing the Gradle software
* a [Lambda](https://aws.amazon.com/lambda/) function and one Lambda layer to 
    * check for the latest Gradle release
    * upload if required and notify users via [SNS](https://aws.amazon.com/sns/) and e-Mail
* a [Cloudwatch](https://aws.amazon.com/cloudwatch/) event rule to trigger the Lambda function

## Setup of the components

### The S3 Bucket

By default, public access to the S3 bucket is disabled. Only the access from a specific IP address (the one I got from my ISP) is allowed and ensured via [bucket policies](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-policy.html).
```javascript
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
 ```

## The Lambda function

The Lambda function is written in Python 3. The execution time is limited to five
minutes and the memory consumption to 512 MByte.

Additionally the function gets read/ write access to the S3 bucket.

```javascript
const fn = new Function(this, "fnUpload", {
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

bucket.grantReadWrite(fn);
```

In the additional layer modules like boto3 are included.

```javascript
const layer = new LayerVersion(this, "GradleUploaderLayer", {
  code: Code.fromAsset(path.join(__dirname, "../layer-code")),
  compatibleRuntimes: [Runtime.PYTHON_3_8],
  license: "Apache-2.0",
  description: "A layer containing dependencies for thr Gradle Uploader",
});
```

## The Cloudwatch event rule

Every first of a month the Lambda function `fn` will be triggered automatically. That seems to be a reasonable period for the update check.

```javascript
const target = new LambdaFunction(fn);
new Rule(this, "ScheduleRule", {
  schedule: Schedule.cron({ minute: "0", hour: "0", day: "1", month: "*" }),
   targets: [target],
});
```

## Notifying about new releases

Whenever the release of a new Gradle version is detected, the stack will sent an e-mail to the list of subscriber. 

```javascript
const topic = new Topic(this, "Topic", {
  displayName: "Gradle uploader topic",
});
topic.addSubscription(new EmailSubscription("foo@bar.com"));
```

## Testing the Python code
```shell
docker run --rm -v "$PWD":/var/task:ro,delegated   -v /home/stefan/Private/programmieren/aws/cdk/gradle_uploader/layer-code:/opt:ro,delegated  -e AWS_ACCESS_KEY_ID=XXXXXXXXXX -e AWS_SECRET_ACCESS_KEY=XXXXXXXXXX lambci/lambda:python3.8 gradleUploader.main
```

## Links

- [AWS Cloud Development Kit](https://github.com/aws/aws-cdk)