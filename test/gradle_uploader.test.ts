import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib/core';
import { GradleDistribution, GradleUploader } from '../src/gradle_uploader';

test('S3 bucket is encrypted and not public accessible ', () => {
  // Given
  const stack = new Stack();
  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });
  const template = Template.fromStack(stack);

  // Then
  template.hasResourceProperties('AWS::S3::Bucket', {
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
  },
  );
});

test('SNS topic is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });
  const template = Template.fromStack(stack);
  template.hasResource('AWS::SNS::Topic', {});

});

test('SNS subscription is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyTestStack', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SNS::Subscription', {
    Protocol: 'email',
    Endpoint: 'john.doe@foobar.com',
  },
  );
});

test('Lambda function is setup ', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyTestStack', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'python3.12',
  },
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

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        WEBHOOK_URL:
            'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        GRADLE_DISTRIBUTION: 'BIN',
      },
    },
  },
  );

  template.hasResourceProperties('AWS::SNS::Subscription', {
    Endpoint: 'john.doe@foobar.com',
    Protocol: 'email',
  },
  );
});

test('Gradle Distribution selection forwarded to Lambda', () => {
  const stack = new Stack();

  new GradleUploader(stack, 'MyConstruct', {
    mailProperties: { subscribers: ['john.doe@foobar.com'] },
    whitelist: ['87.122.220.125/32', '87.122.210.146/32'],
    distribution: GradleDistribution.ALL,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        GRADLE_DISTRIBUTION: 'ALL',
      },
    },
  },
  );
});
