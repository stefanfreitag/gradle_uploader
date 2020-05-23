import { expect as expectCDK, matchTemplate, MatchStyle, haveResource, HaveResourceAssertion } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as GradleUploader from '../lib/gradle_uploader-stack';

test("S3 buckets are not public accessible ", () => {
  const app = new cdk.App();

  const stack = new GradleUploader.GradleUploaderStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  );
});

test("S3 buckets are encrypted ", () => {
  const app = new cdk.App();

  const stack = new GradleUploader.GradleUploaderStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::S3::Bucket", {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: "AES256",
            },
          },
        ],
      },
    })
  );
});

test("SNS topic is setup ", () => {
  const app = new cdk.App();

  const stack = new GradleUploader.GradleUploaderStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::SNS::Topic", {
      DisplayName: "Gradle uploader topic"
    })
  );
});

test("Lambda function is setup ", () => {
  const app = new cdk.App();

  const stack = new GradleUploader.GradleUploaderStack(app, "MyTestStack");

  expectCDK(stack).to(
    haveResource("AWS::Lambda::Function", {
      Runtime: "python3.8"
    })
  );
});
