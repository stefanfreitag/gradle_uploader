#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GradleUploaderStack } from '../lib/gradle_uploader-stack';

const app = new cdk.App();
new GradleUploaderStack(app, 'GradleUploaderStack');
