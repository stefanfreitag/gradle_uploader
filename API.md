# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GradleUploader <a name="GradleUploader" id="gradle_s3_uploader.GradleUploader"></a>

#### Initializers <a name="Initializers" id="gradle_s3_uploader.GradleUploader.Initializer"></a>

```typescript
import { GradleUploader } from 'gradle_s3_uploader'

new GradleUploader(scope: Construct, id: string, uploaderProperties: UploaderProperties)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#gradle_s3_uploader.GradleUploader.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#gradle_s3_uploader.GradleUploader.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#gradle_s3_uploader.GradleUploader.Initializer.parameter.uploaderProperties">uploaderProperties</a></code> | <code><a href="#gradle_s3_uploader.UploaderProperties">UploaderProperties</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="gradle_s3_uploader.GradleUploader.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="gradle_s3_uploader.GradleUploader.Initializer.parameter.id"></a>

- *Type:* string

---

##### `uploaderProperties`<sup>Required</sup> <a name="uploaderProperties" id="gradle_s3_uploader.GradleUploader.Initializer.parameter.uploaderProperties"></a>

- *Type:* <a href="#gradle_s3_uploader.UploaderProperties">UploaderProperties</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#gradle_s3_uploader.GradleUploader.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#gradle_s3_uploader.GradleUploader.with">with</a></code> | Applies one or more mixins to this construct. |
| <code><a href="#gradle_s3_uploader.GradleUploader.createBucket">createBucket</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="gradle_s3_uploader.GradleUploader.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="gradle_s3_uploader.GradleUploader.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="gradle_s3_uploader.GradleUploader.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

##### `createBucket` <a name="createBucket" id="gradle_s3_uploader.GradleUploader.createBucket"></a>

```typescript
public createBucket(whitelist: string[]): Bucket
```

###### `whitelist`<sup>Required</sup> <a name="whitelist" id="gradle_s3_uploader.GradleUploader.createBucket.parameter.whitelist"></a>

- *Type:* string[]

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#gradle_s3_uploader.GradleUploader.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="gradle_s3_uploader.GradleUploader.isConstruct"></a>

```typescript
import { GradleUploader } from 'gradle_s3_uploader'

GradleUploader.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="gradle_s3_uploader.GradleUploader.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#gradle_s3_uploader.GradleUploader.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="gradle_s3_uploader.GradleUploader.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### MailProperties <a name="MailProperties" id="gradle_s3_uploader.MailProperties"></a>

Properties related to forwarding messages via mail.

#### Initializer <a name="Initializer" id="gradle_s3_uploader.MailProperties.Initializer"></a>

```typescript
import { MailProperties } from 'gradle_s3_uploader'

const mailProperties: MailProperties = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#gradle_s3_uploader.MailProperties.property.subscribers">subscribers</a></code> | <code>string[]</code> | *No description.* |

---

##### `subscribers`<sup>Required</sup> <a name="subscribers" id="gradle_s3_uploader.MailProperties.property.subscribers"></a>

```typescript
public readonly subscribers: string[];
```

- *Type:* string[]

---

### SlackProperties <a name="SlackProperties" id="gradle_s3_uploader.SlackProperties"></a>

Properties related to forwarding messages to Slack.

#### Initializer <a name="Initializer" id="gradle_s3_uploader.SlackProperties.Initializer"></a>

```typescript
import { SlackProperties } from 'gradle_s3_uploader'

const slackProperties: SlackProperties = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#gradle_s3_uploader.SlackProperties.property.webhook">webhook</a></code> | <code>string</code> | The Slack webhook used to send messages. |

---

##### `webhook`<sup>Required</sup> <a name="webhook" id="gradle_s3_uploader.SlackProperties.property.webhook"></a>

```typescript
public readonly webhook: string;
```

- *Type:* string

The Slack webhook used to send messages.

Details on setting up a webhook can be found at https://api.slack.com/messaging/webhooks.

---

### UploaderProperties <a name="UploaderProperties" id="gradle_s3_uploader.UploaderProperties"></a>

#### Initializer <a name="Initializer" id="gradle_s3_uploader.UploaderProperties.Initializer"></a>

```typescript
import { UploaderProperties } from 'gradle_s3_uploader'

const uploaderProperties: UploaderProperties = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#gradle_s3_uploader.UploaderProperties.property.whitelist">whitelist</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#gradle_s3_uploader.UploaderProperties.property.distribution">distribution</a></code> | <code><a href="#gradle_s3_uploader.GradleDistribution">GradleDistribution</a></code> | The {@link GradleDistributionGradle distribution} type to download. |
| <code><a href="#gradle_s3_uploader.UploaderProperties.property.mailProperties">mailProperties</a></code> | <code><a href="#gradle_s3_uploader.MailProperties">MailProperties</a></code> | Optional properties required for sending messages via mail. |
| <code><a href="#gradle_s3_uploader.UploaderProperties.property.schedule">schedule</a></code> | <code>aws-cdk-lib.aws_events.Schedule</code> | *No description.* |
| <code><a href="#gradle_s3_uploader.UploaderProperties.property.slackProperties">slackProperties</a></code> | <code><a href="#gradle_s3_uploader.SlackProperties">SlackProperties</a></code> | Optional properties required for sending messages via Slack. |

---

##### `whitelist`<sup>Required</sup> <a name="whitelist" id="gradle_s3_uploader.UploaderProperties.property.whitelist"></a>

```typescript
public readonly whitelist: string[];
```

- *Type:* string[]

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="gradle_s3_uploader.UploaderProperties.property.distribution"></a>

```typescript
public readonly distribution: GradleDistribution;
```

- *Type:* <a href="#gradle_s3_uploader.GradleDistribution">GradleDistribution</a>

The {@link GradleDistributionGradle distribution} type to download.

If no value is specified, only the binaries will be downloaded.

---

##### `mailProperties`<sup>Optional</sup> <a name="mailProperties" id="gradle_s3_uploader.UploaderProperties.property.mailProperties"></a>

```typescript
public readonly mailProperties: MailProperties;
```

- *Type:* <a href="#gradle_s3_uploader.MailProperties">MailProperties</a>

Optional properties required for sending messages via mail.

---

##### `schedule`<sup>Optional</sup> <a name="schedule" id="gradle_s3_uploader.UploaderProperties.property.schedule"></a>

```typescript
public readonly schedule: Schedule;
```

- *Type:* aws-cdk-lib.aws_events.Schedule

---

##### `slackProperties`<sup>Optional</sup> <a name="slackProperties" id="gradle_s3_uploader.UploaderProperties.property.slackProperties"></a>

```typescript
public readonly slackProperties: SlackProperties;
```

- *Type:* <a href="#gradle_s3_uploader.SlackProperties">SlackProperties</a>

Optional properties required for sending messages via Slack.

---



## Enums <a name="Enums" id="Enums"></a>

### GradleDistribution <a name="GradleDistribution" id="gradle_s3_uploader.GradleDistribution"></a>

Types of available Gradle distributions.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#gradle_s3_uploader.GradleDistribution.BIN">BIN</a></code> | Binaries only. |
| <code><a href="#gradle_s3_uploader.GradleDistribution.ALL">ALL</a></code> | Binaries, sources and documentation. |
| <code><a href="#gradle_s3_uploader.GradleDistribution.BOTH">BOTH</a></code> | BINARY and ALL. |

---

##### `BIN` <a name="BIN" id="gradle_s3_uploader.GradleDistribution.BIN"></a>

Binaries only.

---


##### `ALL` <a name="ALL" id="gradle_s3_uploader.GradleDistribution.ALL"></a>

Binaries, sources and documentation.

---


##### `BOTH` <a name="BOTH" id="gradle_s3_uploader.GradleDistribution.BOTH"></a>

BINARY and ALL.

---

