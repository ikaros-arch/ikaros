"""
Utility functions for the File Storage API.

This module provides utility functions for creating and updating RO-Crate metadata files.
"""

import json
import io
from rocrate.rocrate import ROCrate
from rocrate.model.person import Person
from config.aws_config import s3, BUCKET_NAME, ENDPOINT_URL
from botocore.exceptions import ClientError


def get_ro_crate(crate_file_key):
    """
    Retrieve the RO-Crate metadata from S3.

    Args:
        crate_file_key (str): The S3 key for the RO-Crate metadata file.

    Returns:
        ROCrate: The RO-Crate object, or None if the object is not found.
    """
    try:
        existing_crate_obj = s3.get_object(Bucket=BUCKET_NAME, Key=crate_file_key)
        existing_crate_data = existing_crate_obj['Body'].read().decode('utf-8')
        crate = ROCrate(json.loads(existing_crate_data))
        return crate
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            return None
        else:
            raise


def create_ro_crate(group_id: str, file_metadata: dict):
    """
    Create or update an RO-Crate metadata file for a group.

    This function checks if an RO-Crate metadata file already exists for the given group in an S3 bucket.
    If it exists, it updates the metadata with the provided file information. If it does not exist, it creates a new RO-Crate metadata file.
    The updated or newly created RO-Crate metadata file is then uploaded to the S3 bucket.

    Args:
        group_id (str): The ID of the group.
        file_metadata (dict): A dictionary containing metadata about the file. Expected keys are:
            - file_id (str): The unique identifier of the file.
            - file_name (str): The name of the file.
            - file_encoding (str): The encoding format of the file.
            - file_description (str): A description of the file.
            - file_version (str): The version of the file.
            - file_upload_date (str): The upload date of the file.
            - file_author (dict, optional): A dictionary containing author information. Expected keys are:
                - author_id (str): The unique identifier of the author.
                - author_name (str): The name of the author.
        file (str): The path to the file to be added to the RO-Crate.
    Returns:
        None
    """
    crate_file_key = f"{group_id}/ro-crate-metadata.json"
    group_uri = f"{ENDPOINT_URL}/{BUCKET_NAME}/{group_id}"
    file_uri = f"{group_uri}%{file_metadata['file_id']}"
    

    # Check if RO-Crate file already exists in S3
    crate = get_ro_crate(crate_file_key)
    if crate is None:
        # If no existing RO-Crate file, create a new one
        crate = ROCrate()
        root_metadata = {
            "@id": "./",
            "identifier": group_id,
            "name": f"Group {group_id}",
            "description": f"RO-Crate for VTM object {group_id}",
            "version": file_metadata['file_version'],
            "url": group_uri,
            "datePublished": file_metadata['file_upload_date']
        }
        crate.update_jsonld(root_metadata)

    # Add or update file metadata in the RO-Crate
    new_metadata = {
        "name": file_metadata['file_name'],
        "identifier": file_uri,
        "encodingFormat": file_metadata['file_encoding'],
        "description": file_metadata['file_description'],
        "version": file_metadata['file_version'],
        "datePublished": file_metadata['file_upload_date']
    }
    new_file = crate.add_file(new_metadata['name'], properties=new_metadata)
    if file_metadata["file_author"]:
        author_properties = {
            "name": file_metadata["file_author"]["author_name"]
        }
        new_author = crate.add(Person(crate, file_metadata["file_author"]["author_id"], properties=author_properties))
        new_file["author"] = new_author
    
    # print(f"Crate properties: {new_file.properties()}")


    # Generate the RO-Crate metadata
    crate_metadata = json.dumps(crate.metadata.generate())
    print(f"Crate metadata: {crate_metadata}")

    # Create an in-memory file-like object
    crate_file_obj = io.BytesIO(crate_metadata.encode('utf-8'))

    # Define the S3 key for the RO-Crate metadata file
    crate_file_key = f"{group_id}/ro-crate-metadata.json"

    # Upload the in-memory file-like object to S3
    s3.upload_fileobj(crate_file_obj, BUCKET_NAME, crate_file_key)

