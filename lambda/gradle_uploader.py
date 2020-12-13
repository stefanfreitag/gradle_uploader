from collections.abc import Set
import json
import logging
import os
from logging import INFO, error, getLogger
from urllib.request import Request, urlopen

import boto3
import jsonpickle
import requests
from botocore.exceptions import ClientError
from requests.exceptions import HTTPError

from enum import Enum, auto, unique

logger = getLogger()
logger.setLevel(INFO)


S3_BUCKET = "<undefined>"

GRADLE_CURRENT_VERSION_METAINFO_URL = "https://services.gradle.org/versions/current"


@unique
class GradleDistribution(Enum):
    """
    The different types of Gradle distributions that can be downloaded.
    """

    BIN = (auto(), "Binary only")
    ALL = (auto(), "Binary, Sources, Docs")
    BOTH = (auto(), "Both distributions")


class MetaInfo:
    def __init__(self, dictionary: dict):
        setattr(self, "version", dictionary["version"])
        setattr(self, "download_url", dictionary["downloadUrl"])
        setattr(self, "checksum_url", dictionary["checksumUrl"])
        setattr(self, "wrapper_checksum_url", dictionary["wrapperChecksumUrl"])

    def __str__(self):
        return "MetaInformation: " + jsonpickle.dumps(self, indent=4)


def get_meta_info() -> MetaInfo:
    """
    Download the information about the current Gradle version from the Internet.
    """
    result = requests.get(GRADLE_CURRENT_VERSION_METAINFO_URL)
    json_data = json.loads(result.text)
    return MetaInfo(json_data)


def download_file(url: str):
    """
    Download a remote file to the tmp folder.
    :param url:  The URL of the remote file.
    :param target: The target (filename and path) on the local filesystem.
    
    """

    file_name = os.path.basename(url)
    target = "/tmp/" + file_name
    try:
        result = requests.get(url, timeout=5)
        logging.info("Writing " + url + " to " + target)
        open(target, "wb").write(result.content)
    except requests.exceptions.Timeout:
        print("Timeout")
    except requests.exceptions.TooManyRedirects:
        print("Too many redirects")
    except requests.exceptions.RequestException:
        print("Other error")


def upload_version(url: str, bucket_name: str) -> bool:
    """
    Upload a file to a S3 bucket. The file name is taken from the provided url.
    :param url:  The URL of the remote file.
    :param bucket_name: The name of the S3 bucket
    """

    session = boto3.Session()
    s3_client = session.client("s3")
    try:
        file_name = os.path.basename(url)
        print("Uploading " + file_name + " ...")
        s3_client.upload_file("/tmp/" + file_name, bucket_name, file_name)
        print("Upload done")
    except ClientError as e:
        print(e)
        return False
    return True


def check_existence(meta_info: MetaInfo, bucket_name: str) -> bool:
    session = boto3.Session()
    s3_client = session.client("s3")
    try:
        s3_client.head_bucket(Bucket=bucket_name)
    except ClientError as error:
        logging.error(error)
    try:
        logging.info("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        print("Checking for Gradle version in S3 bucket " + S3_BUCKET)
        file_name = os.path.basename(meta_info.download_url)
        response = s3_client.head_object(Key=file_name, Bucket=S3_BUCKET)
        logging.info(response)
        return True
    except ClientError:
        logging.error("Not found")
        print("Not found")
        return False


def create_slack_message(meta_info: MetaInfo) -> str:
    """Slack message formatting"""

    header: str = """{"type": "header", "text": { "type": "plain_text",  "text": "Gradle Uploader" }}"""

    body: str = (
        f"{{"
        f"  'type': 'section',"
        f"  'text': {{"
        f"      'type': 'mrkdwn',"
        f"      'text': 'The release of a new Gradle version was detected.\n New release version: {meta_info.version}\n Download URL: {meta_info.download_url}\nChecksum URL: {meta_info.checksum_url}'"
        f"}}"
        f"}}"
    )

    basic_block: str = (f"""{{ "text": "A new Gradle version is available.", "blocks": [ {header}, {body} ] }}""")
    return basic_block


def send_slack_message(message: str, webhook_url: str):
    print(message)
    req = Request(webhook_url, message.encode("utf-8"))
    try:
        with urlopen(req) as res:
            res.read()
            print(res)
            logger.info("Message posted.")
    except HTTPError as err:
        print(err)
        logger.error("Request failed: %d %s", err.code, err.reason)


def distribution_to_urls(meta_info: MetaInfo, distribution: str) -> Set:
    urls = set()
    if (distribution == GradleDistribution.BIN.name) or (
        distribution == GradleDistribution.BOTH.name
    ):
        urls.add(meta_info.download_url)
    if (distribution == GradleDistribution.ALL.name) or (
        distribution == GradleDistribution.BOTH.name
    ):
        url = meta_info.download_url.replace("-bin.zip", "-all.zip")
        urls.add(url)
    return urls


def main(event, context):
    global S3_BUCKET
    try:
        S3_BUCKET = os.environ["BUCKET_NAME"]
        TOPIC_ARN = os.environ["TOPIC_ARN"]
        GRADLE_DISTRIBUTION = os.environ["GRADLE_DISTRIBUTION"]

        logging.info("S3 Bucket used as target: " + S3_BUCKET)
        meta_info = get_meta_info()

        logging.info("Current Gradle Version:" + meta_info.version)

        # Check based on distribution type
        if check_existence(meta_info, S3_BUCKET):
            logging.info(
                "No action required. Latest Gradle version "
                + meta_info.version
                + " available in S3."
            )
        else:
            download_urls = distribution_to_urls(
                meta_info=meta_info, distribution=GRADLE_DISTRIBUTION
            )
            for entry in download_urls:
                download_file(entry)
                upload_version(entry, bucket_name=S3_BUCKET)
            ##Send mail
            sns = boto3.client("sns")
            response = (
                sns.publish(
                    TopicArn=TOPIC_ARN,
                    Message="New Gradle version available: " + str(meta_info.version),
                ),
            )
            print("Sent mail")

            slack_message = create_slack_message(meta_info)
            send_slack_message(slack_message, os.environ["WEBHOOK_URL"])

    except KeyError as identifier:
        print("Key error for " + str(identifier))


if __name__ == "__main__":
    logging.basicConfig(filename="gradleUploader.log", level=logging.INFO)
    main(None, None)
