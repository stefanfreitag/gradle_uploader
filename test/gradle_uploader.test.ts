import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { GradleUploader } from '../src/gradle_uploader';

test('S3 bucket is encrypted and not public accessible ', () => {
  // Given
  const stack = new Stack();
  new GradleUploader(stack, 'MyConstruct', {
    subscribers: ['john.doe@foobar.com'],
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

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
    subscribers: ['john.doe@foobar.com'],
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
});

test('SNS subscription is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyTestStack', {
    subscribers: ['john.doe@foobar.com'],
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
    subscribers: ['john.doe@foobar.com'],
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      Runtime: 'python3.8',
    }),
  );
});
