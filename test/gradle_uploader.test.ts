import {
  expect as expectCDK,
  haveResource,
  haveResourceLike,
} from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { GradleDistribution, GradleUploader } from '../src/gradle_uploader';

test('S3 bucket is encrypted and not public accessible ', () => {
  // Given
  const stack = new Stack();
  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  // Then
  expectCDK(stack).to(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    }),
  );
});

test('SNS topic is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
});

test('SNS subscription is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyTestStack', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expectCDK(stack).to(
    haveResource('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'john.doe@foobar.com',
    }),
  );
});

test('Lambda function is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyTestStack', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      Runtime: 'python3.8',
    }),
  );
});

test('Slack Webhook defined as Lambda environment variable', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
    slackProperties: {
      webhook:
        'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    },
  });

  expectCDK(stack).to(
    haveResourceLike('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          WEBHOOK_URL:
            'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          GRADLE_DISTRIBUTION: 'BIN',
        },
      },
    }),
  );
  expectCDK(stack).to(
    haveResourceLike('AWS::SNS::Subscription', {
      Endpoint: 'john.doe@foobar.com',
      Protocol: 'email',
    }),
  );
});

test('Gradle Distribution selection forwarded to Lambda', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
    distribution: GradleDistribution.ALL,
  });

  expectCDK(stack).to(
    haveResourceLike('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          GRADLE_DISTRIBUTION: 'ALL',
        },
      },
    }),
  );
});
