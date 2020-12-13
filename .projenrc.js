const { AwsCdkConstructLibrary, Stability } = require('projen');

const project = new AwsCdkConstructLibrary({
  authorAddress: "stefan.freitag@udo.edu",
  authorName: "Stefan Freitag",
  name: "gradle_s3_uploader",
  description:"Uploads new Gradle versions to an S3 bucket",
  repository: "https://github.com/stefan.freitag/projen_gradle_uploader.git",
  cdkVersion: "1.78.0",
  codeCov: true,
  keywords: [
    "cdk", "gradle", "s3"
  ],
  antitamper: false,
  catalog:{
    twitter: 'stefanfreitag',
    announce: false
  },
  dependabot: false,
  cdkDependencies: [
    "@aws-cdk/aws-events",
    "@aws-cdk/aws-events-targets",
    "@aws-cdk/aws-iam",
    "@aws-cdk/aws-lambda",
    "@aws-cdk/aws-lambda-python",
    "@aws-cdk/aws-logs",
    "@aws-cdk/aws-s3",
    "@aws-cdk/aws-sns",
    "@aws-cdk/aws-sns-subscriptions",
    "@aws-cdk/core"
  ],
  stability: Stability.STABLE,
  scripts:{
    "build": "cd layer-code;./install.sh; cd ..; yarn run test && yarn run compile && yarn run package",
    "install_layer": "cd layer-code;./install.sh"
  },
  python: {
    distName:'cdk-gradle-uploader',
    module: 'cdk_gradle_uploader',
  },
  java:{
    javaPackage: 'io.github.stefanfreitag.cdk.gradleuploader',
    mavenGroupId: 'io.github.stefanfreitag',
    mavenArtifactId: 'cdkGradleUploader'
  },
  //dotnet:{
  // dotNetNamespace: "De.Freitag.Stefan.Aws.Cdk",
  //  packageId: "CdkGradleUploader"
  //}


});

project.gitignore.exclude("__pycache__/", "layer-code/python/");
project.synth();
