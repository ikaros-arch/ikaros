import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError
from utils import create_ro_crate
from config.aws_config import BUCKET_NAME
from tests.conftest import GROUP_ID, FILE_METADATA

@patch('utils.s3')
def test_create_ro_crate(mock_s3, setup_test_file):
    """
    Test the create_ro_crate function.
    """
    crate_file_key = f"{GROUP_ID}/ro-crate-metadata.json"

    # Mock the S3 get_object and upload_fileobj methods
    mock_s3.get_object = MagicMock(side_effect=ClientError(
        {"Error": {"Code": "NoSuchKey", "Message": "The specified key does not exist."}},
        "GetObject"
    ))
    mock_s3.upload_fileobj = MagicMock()

    create_ro_crate(GROUP_ID, FILE_METADATA)   

    # Check that the get_object method was called with the correct parameters
    mock_s3.get_object.assert_called_with(Bucket=BUCKET_NAME, Key=crate_file_key)

    # Check that the upload_fileobj method was called
    assert mock_s3.upload_fileobj.called

    # Check that the RO-Crate file was created and uploaded
    args, kwargs = mock_s3.upload_fileobj.call_args
    assert args[1] == BUCKET_NAME
    assert args[2] == crate_file_key
