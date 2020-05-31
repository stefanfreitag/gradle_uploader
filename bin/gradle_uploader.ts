#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { GradleUploaderStack } from "../lib/gradle_uploader-stack";
import { Schedule } from "@aws-cdk/aws-events";

const app = new cdk.App();
new GradleUploaderStack(app, "GradleUploaderStack", {
  subscribers: ["stefan.freitag@udo.edu"],
  schedule: Schedule.cron({ minute: "0", hour: "0", day: "*"}),
  whitelist: ["87.122.220.125/32", "87.122.210.146/32"],
});
