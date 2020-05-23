# Gradle Uploader

This CDK stack monitors the releases of the Gradle build software. Each new release will be made available as copy in an S3 bucket. Internally the stack uses

* an S3 bucket for storing the Gradle software
* a Lambda function and one Lambda layer to 
    * check for the latest release
    * upload if required and notify users via SNS and e-Mail
* a Cloudwatch Event rule to trigger the Lambda function

## Setup of the components

### The S3 Bucket

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

## The Cloudwatch event rule

Every first of a month the Lambda function `fn` will be triggered. That seems to be a reasonable
period for the update check.
```javascript
const target = new LambdaFunction(fn);

new Rule(this, "ScheduleRule", {
  schedule: Schedule.cron({ minute: "0", hour: "0", day: "1", month: "*" }),
   targets: [target],
});
```

## Notifying about new releases

Whenever the release of a new Gradle version is detected, the stack will sent an e-mail to the list of subscriber.


## Testing the Python code
```shell
docker run --rm -v "$PWD":/var/task:ro,delegated   -v /home/stefan/Private/programmieren/aws/cdk/gradle_uploader/layer-code:/opt:ro,delegated  -e AWS_ACCESS_KEY_ID=XXXXXXXXXX -e AWS_SECRET_ACCESS_KEY=XXXXXXXXXX lambci/lambda:python3.8 gradleUploader.main
```
