"""
Configuration for pytest.

This module provides fixtures for the test suite, including a test client for the FastAPI application
and a fixture to check the S3 connection.
"""

import pytest
import os
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from main import app
from config.aws_config import s3, BUCKET_NAME

# Define global variables
GROUP_ID = "test-group"
FILE_ID = "test-file"
FILE_NAME = f"{FILE_ID}.txt"
FILE_PATH = f"tests/{FILE_NAME}"
FILE_METADATA = {
    "group_id": GROUP_ID,
    "file_id": FILE_ID,
    "file_name": FILE_NAME,
    "file_encoding": "text/plain",
    "file_description": "This is a test file.",
    "file_author": {"author_id": "test-author-id", "author_name": "Test Author"},
    "file_version": 1,
    "file_upload_date": str(datetime.now(timezone.utc))
}

@pytest.fixture(scope="module")
def setup_test_file():
    # Create a temporary file to use in the test
    with open(FILE_PATH, "w") as f:
        f.write("This is a test file.")
    yield
    # Clean up the temporary file after the test
    os.remove(FILE_PATH)

@pytest.fixture(scope="module")
def test_client():
    """
    Fixture to provide a test client for the FastAPI application.
    """
    client = TestClient(app)
    yield client


@pytest.fixture(scope="module")
def s3_client():
    """
    Fixture to provide an S3 client.

    This fixture creates an instance of the boto3 S3 client configured with the
    credentials, region, and endpoint URL specified in the environment variables.
    It can be used in tests to interact with the S3 bucket.
    """
    yield s3


@pytest.fixture(scope="module")
def check_s3_connection(s3_client):
    """
    Fixture to check the S3 connection before running tests.

    This fixture ensures that the S3 connection is working correctly before any tests are executed.
    """
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        assert response['ResponseMetadata']['HTTPStatusCode'] == 200
        print("S3 connection successful.")
        print(f"Bucket: {BUCKET_NAME}")
        print(f"Region: {s3_client.meta.region_name}")
        print(f"Endpoint URL: {s3_client.meta.endpoint_url}")
    except Exception as e:
        pytest.fail(f"Failed to connect to S3 bucket: {e}")
