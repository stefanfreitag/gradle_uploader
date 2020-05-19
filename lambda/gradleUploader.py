import requests
import os
import jsonpickle
import logging
import json
import boto3
from botocore.exceptions import ClientError

from pathlib import Path

S3_BUCKET = "<undefined>"

GRADLE_CURRENT_VERSION_METAINFO_URL = "https://services.gradle.org/versions/current"


class MetaInfo():

    def __init__(self, d: dict):
        self.version = d['version']
        self.downloadUrl = d['downloadUrl']
        self.releaseNightly = d['releaseNightly']
        self.activeRc = d['activeRc']
        self.rcFor = d['rcFor']
        self.milestoneFor = d['milestoneFor']
        self.broken = d['broken']
        self.checksumUrl = d['checksumUrl']
        self.wrapperChecksumUrl = d['wrapperChecksumUrl']

    def __str__(self):
        return "MetaInformation: " + jsonpickle.dumps(self, indent=4)


def getMetaInfo() -> MetaInfo:
    result = requests.get(GRADLE_CURRENT_VERSION_METAINFO_URL)
    json_data = json.loads(result.text)
    return  MetaInfo(json_data)


def downloadVersion(meta_info: MetaInfo):
    file_name = Path(meta_info.downloadUrl).name
    print("Downloading " + meta_info.downloadUrl + " to " + file_name)
    result = requests.get(meta_info.downloadUrl)
    open('/tmp/' + file_name, 'wb').write(result.content)
    logging.info("Finished downloading data")


def uploadVersion(meta_info: MetaInfo, bucket_name: str) -> bool:
    session = boto3.Session(profile_name="cdk")
    s3_client = session.client('s3')
    try:
        logging.info("Uploading...")
        file_name = Path(meta_info.downloadUrl).name
        s3_client.upload_file('/tmp/' + file_name, bucket_name, file_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True


def check_existence(meta_info: MetaInfo, bucket_name: str) -> bool:
    session = boto3.Session(profile_name="cdk")
    s3_client = session.client('s3')
    try:
        s3_client.head_bucket(Bucket=bucket_name)
    except ClientError as error:
        logging.error(error)
    try:
        logging.info("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        print("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        file_name = Path(meta_info.downloadUrl).name
        response = s3_client.head_object(
            Key=file_name,
            Bucket=S3_BUCKET
        )
        logging.info(response)
        return True
    except ClientError as e:
        logging.error("Not found")
        print("Not found")
        return False



def main(event, context):
    global S3_BUCKET
    try:
        S3_BUCKET = os.environ["BUCKET_NAME"]
        logging.info("S3 Bucket used as target: " + S3_BUCKET)
        metaInfo = getMetaInfo()
        logging.info("Current Gradle Version:" + metaInfo.version)
        if check_existence(metaInfo, S3_BUCKET):
            logging.info("No action required. Latest Gradle version " + metaInfo.version + " available in S3.")
        else:
            downloadVersion(metaInfo)
            uploadVersion(meta_info=metaInfo, bucket_name=S3_BUCKET)
    except KeyError as identifier:
        print("S3 Bucket name not specified " + identifier)


if __name__ == "__main__":
    logging.basicConfig(filename='gradleUploader.log', level=logging.INFO)
    main(None, None)

