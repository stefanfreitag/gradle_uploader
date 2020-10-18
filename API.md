# API Reference

**Classes**

Name|Description
----|-----------
[GradleUploader](#gradle-s3-uploader-gradleuploader)|*No description*


**Structs**

Name|Description
----|-----------
[GradleUploaderProps](#gradle-s3-uploader-gradleuploaderprops)|*No description*



## class GradleUploader  <a id="gradle-s3-uploader-gradleuploader"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new GradleUploader(scope: Construct, id: string, uploaderProperties: GradleUploaderProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **uploaderProperties** (<code>[GradleUploaderProps](#gradle-s3-uploader-gradleuploaderprops)</code>)  *No description*
  * **subscribers** (<code>Array<string></code>)  *No description* 
  * **whitelist** (<code>Array<string></code>)  *No description* 
  * **schedule** (<code>[Schedule](#aws-cdk-aws-events-schedule)</code>)  *No description* __*Optional*__


### Methods


#### createBucket(whitelist) <a id="gradle-s3-uploader-gradleuploader-createbucket"></a>



```ts
createBucket(whitelist: Array<string>): Bucket
```

* **whitelist** (<code>Array<string></code>)  *No description*

__Returns__:
* <code>[Bucket](#aws-cdk-aws-s3-bucket)</code>



## struct GradleUploaderProps  <a id="gradle-s3-uploader-gradleuploaderprops"></a>






Name | Type | Description 
-----|------|-------------
**subscribers** | <code>Array<string></code> | <span></span>
**whitelist** | <code>Array<string></code> | <span></span>
**schedule**? | <code>[Schedule](#aws-cdk-aws-events-schedule)</code> | __*Optional*__



