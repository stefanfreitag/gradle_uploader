import requests
import os
import jsonpickle
import logging
import json
import boto3
from botocore.exceptions import ClientError

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
    file_name = os.path.basename(meta_info.downloadUrl)
    print("Downloading " + meta_info.downloadUrl + " to " + file_name)
    try:
        result = requests.get(meta_info.downloadUrl, timeout=5)
        #logging.info("Writing file")
        print("Writing file")
        open('/tmp/' + file_name, 'wb').write(result.content)
        print("Finished downloading data")
    except requests.exceptions.Timeout:
        print("Timeout")
    except requests.exceptions.TooManyRedirects:
        print("Too many redirects")
    except requests.exceptions.RequestException:
        print("Other error")

def uploadVersion(meta_info: MetaInfo, bucket_name: str) -> bool:
    session = boto3.Session()
    s3_client = session.client('s3')
    try:
        print("Uploading...")
        file_name =  os.path.basename(meta_info.downloadUrl)
        s3_client.upload_file('/tmp/' + file_name, bucket_name, file_name)
        print("Upload done")
    except ClientError as e:
        print(e)
        return False
    return True


def check_existence(meta_info: MetaInfo, bucket_name: str) -> bool:
    session = boto3.Session()
    s3_client = session.client('s3')
    try:
        s3_client.head_bucket(Bucket=bucket_name)
    except ClientError as error:
        logging.error(error)
    try:
        logging.info("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        print("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        file_name =  os.path.basename(meta_info.downloadUrl)
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
        TOPIC_ARN = os.environ["TOPIC_ARN"]
        logging.info("S3 Bucket used as target: " + S3_BUCKET)
        metaInfo = getMetaInfo()
        logging.info("Current Gradle Version:" + metaInfo.version)
        if check_existence(metaInfo, S3_BUCKET):
           logging.info("No action required. Latest Gradle version " + metaInfo.version + " available in S3.")
        else:
            downloadVersion(metaInfo)
            uploadVersion(meta_info=metaInfo, bucket_name=S3_BUCKET)
            sns = boto3.client("sns")
            response = sns.publish(
            TopicArn=TOPIC_ARN,
            Message="New Gradle version available: " + str(metaInfo.version)),
            Subject="Gradle Uploader Lambda"
            print("Sent mail")
    except KeyError as identifier:
        print("S3 Bucket name not specified " + identifier)


if __name__ == "__main__":
    logging.basicConfig(filename='gradleUploader.log', level=logging.INFO)
    main(None, None)

