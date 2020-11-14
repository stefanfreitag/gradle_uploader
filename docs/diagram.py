# diagram.py
from diagrams import Cluster, Diagram, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.storage import S3
from diagrams.aws.management import Cloudwatch
from diagrams.aws.network import ELB
from diagrams.onprem.database import Oracle
from diagrams.elastic.elasticsearch import Beats, Elasticsearch, Kibana, Logstash
from diagrams.saas.alerting import Opsgenie
from diagrams.saas.chat import Slack
from diagrams.generic.device import Mobile
from diagrams.aws.integration import SNS

graph_attr={
    "bgcolor": "transparent"
}
with Diagram("Gradle Uploader", show=False, outformat="png", filename="overview", graph_attr=graph_attr):

    s3_bucket = S3(label="S3 Bucket")
    lambda_function = Lambda("Lambda function")
    cloudwatch = Cloudwatch("CloudWatch")
    slack = Slack("Slack")
    mail = Mobile("E-Mail")
    sns = SNS("SNS")

    cloudwatch >> Edge(label="cron") >> lambda_function
    lambda_function >> Edge(label="Upload new Gradle release") >> s3_bucket
    lambda_function >> Edge(label="Webhook") >> slack
    lambda_function >> sns
    sns >> mail
