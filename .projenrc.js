const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');

const project = new awscdk.AwsCdkConstructLibrary({
  authorAddress: 'stefan.freitag@udo.edu',
  authorName: 'Stefan Freitag',
  name: 'gradle_s3_uploader',
  description: 'Uploads new Gradle versions to an S3 bucket',
  repository: 'https://github.com/stefan.freitag/projen_gradle_uploader.git',
  cdkVersion: '2.55.1',
  codeCov: true,
  defaultReleaseBranch: 'master',
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
  keywords: [
    'cdk', 'gradle', 's3',
  ],
  antitamper: false,
  catalog: {
    twitter: 'stefanfreitag',
    announce: false,
  },
  stability: Stability.STABLE,
  scripts: {
    build_layer: 'cd layer-code;./install.sh; cd ..; yarn run test && yarn run compile && yarn run package',
    install_layer: 'cd layer-code;./install.sh',
  },
  publishToPypi: {
    distName: 'cdk-gradle-uploader',
    module: 'cdk_gradle_uploader',
  },
  publishToMaven: {
    javaPackage: 'io.github.stefanfreitag.cdk.gradleuploader',
    mavenGroupId: 'io.github.stefanfreitag',
    mavenArtifactId: 'cdkGradleUploader',
  },


});

const common_exclude = ['.history/', '__pycache__/', 'layer-code/python/'];

project.gitignore.exclude(...common_exclude);
project.npmignore.exclude(...common_exclude);

project.synth();
