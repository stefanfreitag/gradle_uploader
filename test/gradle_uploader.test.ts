import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as GradleUploader from '../lib/gradle_uploader-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GradleUploader.GradleUploaderStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
