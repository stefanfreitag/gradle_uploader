# API Reference

**Classes**

Name|Description
----|-----------
[GradleUploader](#gradle-s3-uploader-gradleuploader)|*No description*


**Structs**

Name|Description
----|-----------
[MailProperties](#gradle-s3-uploader-mailproperties)|Properties related to forwarding messages via mail.
[SlackProperties](#gradle-s3-uploader-slackproperties)|Properties related to forwarding messages to Slack.
[UploaderProperties](#gradle-s3-uploader-uploaderproperties)|*No description*


**Enums**

Name|Description
----|-----------
[GradleDistribution](#gradle-s3-uploader-gradledistribution)|Types of available Gradle distributions.



## class GradleUploader  <a id="gradle-s3-uploader-gradleuploader"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IDependable](#constructs-idependable)
__Extends__: [Construct](#constructs-construct)

### Initializer




```ts
new GradleUploader(scope: Construct, id: string, uploaderProperties: UploaderProperties)
```

* **scope** (<code>[Construct](#constructs-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **uploaderProperties** (<code>[UploaderProperties](#gradle-s3-uploader-uploaderproperties)</code>)  *No description*
  * **whitelist** (<code>Array<string></code>)  *No description* 
  * **distribution** (<code>[GradleDistribution](#gradle-s3-uploader-gradledistribution)</code>)  The {@link GradleDistribution | Gradle distribution} type to download. __*Optional*__
  * **mailProperties** (<code>[MailProperties](#gradle-s3-uploader-mailproperties)</code>)  Optional properties required for sending messages via mail. __*Optional*__
  * **schedule** (<code>[aws_events.Schedule](#aws-cdk-lib-aws-events-schedule)</code>)  *No description* __*Optional*__
  * **slackProperties** (<code>[SlackProperties](#gradle-s3-uploader-slackproperties)</code>)  Optional properties required for sending messages via Slack. __*Optional*__


### Methods


#### createBucket(whitelist) <a id="gradle-s3-uploader-gradleuploader-createbucket"></a>



```ts
createBucket(whitelist: Array<string>): Bucket
```

* **whitelist** (<code>Array<string></code>)  *No description*

__Returns__:
* <code>[aws_s3.Bucket](#aws-cdk-lib-aws-s3-bucket)</code>



## struct MailProperties  <a id="gradle-s3-uploader-mailproperties"></a>


Properties related to forwarding messages via mail.



Name | Type | Description 
-----|------|-------------
**subscribers** | <code>Array<string></code> | <span></span>



## struct SlackProperties  <a id="gradle-s3-uploader-slackproperties"></a>


Properties related to forwarding messages to Slack.



Name | Type | Description 
-----|------|-------------
**webhook**🔹 | <code>string</code> | The Slack webhook used to send messages.



## struct UploaderProperties  <a id="gradle-s3-uploader-uploaderproperties"></a>






Name | Type | Description 
-----|------|-------------
**whitelist** | <code>Array<string></code> | <span></span>
**distribution**? | <code>[GradleDistribution](#gradle-s3-uploader-gradledistribution)</code> | The {@link GradleDistribution | Gradle distribution} type to download.<br/>__*Optional*__
**mailProperties**? | <code>[MailProperties](#gradle-s3-uploader-mailproperties)</code> | Optional properties required for sending messages via mail.<br/>__*Optional*__
**schedule**? | <code>[aws_events.Schedule](#aws-cdk-lib-aws-events-schedule)</code> | __*Optional*__
**slackProperties**? | <code>[SlackProperties](#gradle-s3-uploader-slackproperties)</code> | Optional properties required for sending messages via Slack.<br/>__*Optional*__



## enum GradleDistribution  <a id="gradle-s3-uploader-gradledistribution"></a>

Types of available Gradle distributions.

Name | Description
-----|-----
**BIN** |Binaries only.
**ALL** |Binaries, sources and documentation.
**BOTH** |BINARY and ALL.


