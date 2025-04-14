"""
Cloudian S3 Configuration

If the app is configured with S3 as the storage type, 
this module configures the boto3 client for accessing the Cloudian S3 bucket.
It reads the S3 credentials, region, and endpoint URL from environment variables.
"""

import boto3
import os
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if STORAGE_TYPE is set to 'S3'
if os.getenv('STORAGE_TYPE') != 'S3':
    logger.warning('The current instance is not set up with an S3 storage bucket.')
    s3 = None
    BUCKET_NAME = None
    ENDPOINT_URL = None
else:
    # Read environment variables
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION')
    cloudian_endpoint_url = os.getenv('CLOUDIAN_ENDPOINT_URL')
    bucket_name = os.getenv('S3_BUCKET_NAME', 'no-bucket-name')

    # Check for missing environment variables
    missing_vars = []
    if not aws_access_key_id:
        missing_vars.append('AWS_ACCESS_KEY_ID')
    if not aws_secret_access_key:
        missing_vars.append('AWS_SECRET_ACCESS_KEY')
    if not aws_region:
        missing_vars.append('AWS_REGION')
    if not cloudian_endpoint_url:
        missing_vars.append('CLOUDIAN_ENDPOINT_URL')

    if missing_vars:
        logger.error(f'Missing required environment variables: {", ".join(missing_vars)}')
    else:
        # Configure the boto3 client
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=aws_region,
                endpoint_url=cloudian_endpoint_url
            )
            BUCKET_NAME = bucket_name
            ENDPOINT_URL = cloudian_endpoint_url
            logger.info('S3 client configured successfully.')
        except Exception as e:
            logger.error(f'Failed to configure S3 client: {str(e)}')
            s3 = None
            BUCKET_NAME = None
            ENDPOINT_URL = None