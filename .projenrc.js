const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  authorAddress: "stefan.freitag@udo.edu",
  authorName: "Stefan Freitag",
  name: "Gradle_S3_Uploader",
  repository: "https://github.com/stefan.freitag/projen_gradle_uploader.git",
  cdkVersion: "1.68.0",
  cdkDependencies: [
    "@aws-cdk/aws-events",
    "@aws-cdk/aws-events-targets",
    "@aws-cdk/aws-iam",
    "@aws-cdk/aws-lambda",
    "@aws-cdk/aws-lambda-python",
    "@aws-cdk/aws-s3",
    "@aws-cdk/aws-sns",
    "@aws-cdk/aws-sns-subscriptions",
    "@aws-cdk/core"
  ],
  python: {
    distName:'cdk-gradle-uploader',
    module: 'cdk_gradle_uploader',
  },
  java:{
    javaPackage: 'io.github.stefanfreitag.cdk.gradleuploader',
    mavenGroupId: 'io.github.stefanfreitag',
    mavenArtifactId: 'cdkGradleUploader'
  },
  dotnet:{
    dotNetNamespace: "De.Freitag.Stefan.Aws.Cdk",
    packageId: "CdkGradleUploader"
  }


});

project.synth();
