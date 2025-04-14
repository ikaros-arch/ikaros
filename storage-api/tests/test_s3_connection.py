"""
This module contains a test for checking the connection to an S3 bucket and access to the bucket.
"""

import pytest
from config.aws_config import s3, BUCKET_NAME


def test_s3_connection():
    """
    Test the connection to the S3 bucket and access to the bucket.
    """
    try:
        # List objects in the bucket to check access
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        assert response['ResponseMetadata']['HTTPStatusCode'] == 200
    except Exception as e:
        pytest.fail(f"Failed to connect to S3 bucket: {e}")
