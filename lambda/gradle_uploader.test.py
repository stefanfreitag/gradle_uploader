from gradle_uploader import (
    get_meta_info,
    MetaInfo,
    send_slack_message,
    create_slack_message,
)
from unittest.mock import patch


import unittest

downloaded_info: dict = {
    "version": "6.7",
    "downloadUrl": "https://services.gradle.org/distributions/gradle-6.7-bin.zip",
    "checksumUrl": "https://services.gradle.org/distributions/gradle-6.7-bin.zip.sha256",
    "wrapperChecksumUrl": "https://services.gradle.org/distributions/gradle-6.7-wrapper.jar.sha256",
}


class TestStringMethods(unittest.TestCase):
    def test_meta_info_init(self):
        """ Test the initialization of the MetaInfo """
        meta_info = MetaInfo(downloaded_info)

        self.assertEqual(meta_info.version, "6.7")
        self.assertEqual(
            meta_info.download_url,
            "https://services.gradle.org/distributions/gradle-6.7-bin.zip",
        )
        self.assertEqual(
            meta_info.checksum_url,
            "https://services.gradle.org/distributions/gradle-6.7-bin.zip.sha256",
        )
        self.assertEqual(
            meta_info.wrapper_checksum_url,
            "https://services.gradle.org/distributions/gradle-6.7-wrapper.jar.sha256",
        )

    def test_create_slack_message(self):

        meta_info = MetaInfo(downloaded_info)
        message = create_slack_message(meta_info)
        self.assertIn("New release version: 6.7", message)
        self.assertIn(
            "Download URL: https://services.gradle.org/distributions/gradle-6.7-bin.zip",
            message,
        )
        self.assertIn(
            "Checksum URL: https://services.gradle.org/distributions/gradle-6.7-bin.zip.sha256",
            message,
        )

    # @unittest.skip("Can be used for sending test messages to Slack")
    def test_send_slack_message(self):

        meta_info = MetaInfo(downloaded_info)
        message = create_slack_message(meta_info)
        send_slack_message(
            message,
            "https://hooks.slack.com/services/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",
        )

    def test_get_meta_info(self):
        with patch("requests.get") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.text = """{
            "version": "6.7",
            "downloadUrl": "https://services.gradle.org/distributions/gradle-6.7-bin.zip",
            "checksumUrl": "https://services.gradle.org/distributions/gradle-6.7-bin.zip.sha256",
            "wrapperChecksumUrl": "https://services.gradle.org/distributions/gradle-6.7-wrapper.jar.sha256"
            }"""
            meta_info = get_meta_info()
            self.assertEqual(meta_info.version, "6.7")
            self.assertEqual(
                meta_info.download_url,
                "https://services.gradle.org/distributions/gradle-6.7-bin.zip",
            )
        self.assertEqual(
            meta_info.checksum_url,
            "https://services.gradle.org/distributions/gradle-6.7-bin.zip.sha256",
        )


if __name__ == "__main__":
    unittest.main()
