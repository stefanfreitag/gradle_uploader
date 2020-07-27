import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
  HaveResourceAssertion,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import {
  GradleUploaderStackProps,
  GradleUploaderStack,
} from "../lib/gradle_uploader-stack";

test("S3 buckets are not public accessible ", () => {
  const app = new cdk.App();

  const stack = new GradleUploaderStack(app, "MyTestStack", {
    subscribers: ["john.doe@foobar.com"],
    whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
  });

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

  const stack = new GradleUploaderStack(app, "MyTestStack", {
    subscribers: ["john.doe@foobar.com"],
    whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
  });

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

  const stack = new GradleUploaderStack(app, "MyTestStack", {
    subscribers: ["john.doe@foobar.com"],
    whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
  });

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
});

test("SNS subscription is setup ", () => {
  const app = new cdk.App();

  const stack = new GradleUploaderStack(app, "MyTestStack", {
    subscribers: ["john.doe@foobar.com"],
    whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
  });

  expectCDK(stack).to(
    haveResource("AWS::SNS::Subscription", {
      Protocol: "email",
      Endpoint: "john.doe@foobar.com",
    })
  );
});

test("Lambda function is setup ", () => {
  const app = new cdk.App();

  const stack = new GradleUploaderStack(app, "MyTestStack", {
    subscribers: ["john.doe@foobar.com"],
    whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
  });

  expectCDK(stack).to(
    haveResource("AWS::Lambda::Function", {
      Runtime: "python3.8",
    })
  );
});
