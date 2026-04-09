import boto3

from halyoontok.configs.app_configs import S3_ACCESS_KEY
from halyoontok.configs.app_configs import S3_BUCKET
from halyoontok.configs.app_configs import S3_ENDPOINT
from halyoontok.configs.app_configs import S3_REGION
from halyoontok.configs.app_configs import S3_SECRET_KEY


def get_s3_client():
    kwargs = {
        "region_name": S3_REGION,
    }
    if S3_ENDPOINT:
        kwargs["endpoint_url"] = S3_ENDPOINT
    if S3_ACCESS_KEY and S3_SECRET_KEY:
        kwargs["aws_access_key_id"] = S3_ACCESS_KEY
        kwargs["aws_secret_access_key"] = S3_SECRET_KEY
    return boto3.client("s3", **kwargs)


def upload_file(file_bytes: bytes, key: str, content_type: str) -> str:
    client = get_s3_client()
    client.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"s3://{S3_BUCKET}/{key}"


def get_presigned_url(key: str, expiration: int = 3600) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=expiration,
    )
