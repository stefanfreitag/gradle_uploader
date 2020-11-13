import { Schedule } from '@aws-cdk/aws-events';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
export interface SlackProperties {
    /** The Slack webhook used to send messages.
     * Details on setting up a webhook can be found at https://api.slack.com/messaging/webhooks
    */
    readonly webhook: string;
}
export interface MailProperties {
    readonly subscribers: Array<string>;
}
export interface GradleUploaderProps {
    readonly slackProperties?: SlackProperties;
    readonly mailProperties?: MailProperties;
    readonly whitelist: Array<string>;
    readonly schedule?: Schedule;
}
export declare class GradleUploader extends Construct {
    constructor(scope: Construct, id: string, uploaderProperties: GradleUploaderProps);
    private createTrigger;
    private createFunction;
    private createLambdaLayer;
    /**
     * Add mail subscriptions to the SNS topic.
     * @param subscriber The mail addresses to add to the SNS topic as subscriber.
     */
    private createTopic;
    createBucket(whitelist: Array<string>): Bucket;
}
