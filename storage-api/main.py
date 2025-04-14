"""
File Storage API

This module provides a FastAPI application for handling file data storage.
It includes endpoints for uploading files, downloading files, and retrieving metadata.
Files are stored in an S3 bucket, and metadata is managed using RO-Crate.

Endpoints:
- POST /upload: Upload a file to the S3 bucket and update the RO-Crate metadata.
- GET /download/{type}/{file_id}: Download a file from the S3 bucket.
- GET /metadata/{type}: Get metadata for all files in a group.
"""

import os
import logging
from uuid import uuid4
from datetime import datetime, timezone
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
from rocrate.rocrate import ROCrate

# Import the create_ro_crate and get_ro_crate functions from the utils module
from utils import create_ro_crate, get_ro_crate
# Import the S3 client and bucket name
from config.aws_config import s3, BUCKET_NAME


app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "S3")
STORAGE_PATH = os.getenv("STORAGE_PATH", "/files")

logger.info(f"Storage type is set to {STORAGE_TYPE}, with path {STORAGE_PATH}.")


@app.post("/")
async def upload_file(
    file: UploadFile = File(...), 
    uuid: str = Form(None), 
    media_type: str = Form(None), 
    media_type_uuid: str = Form(None),
    creator: str = Form(None), 
    captured_at: str = Form(None),
    license: str = Form(None),
    description: str = Form(None), 
    parent_type: str = Form(None),
    parent: str = Form(None),
):
    """
    Upload a file to the S3 bucket or local storage and update the RO-Crate metadata.

    Args:
        uuid (str, optional): The UUID of the file. If not provided, a new UUID will be generated.
        file (UploadFile): The file to upload.
        media_type (str, optional): The type of the file.
        fileName (str, optional): The name of the file.
        file_description (str, optional): A description of the file.
        file_author (str, optional): The author of the file.

    Returns:
        dict: A message indicating the file was uploaded successfully and the file ID.
    """
    logger.info(f"Received file upload request for file {file.filename}.")
    file_id = uuid or str(uuid4())
    file_version = 1
    file_extension = os.path.splitext(file.filename)[1]
    file_metadata = {
        "media_type": media_type,
        "media_type_uuid": media_type_uuid,
        "file_id": file_id,
        "file_name": file.filename,
        "file_encoding": file.content_type,
        "media_description": description,
        "media_author": {"author_id": creator, "author_name": creator},
        "file_version": file_version,
        "media_license": license,
        "media_parent_type": parent_type,
        "media_parent": parent,
        "media_captured_at": captured_at,
        "file_upload_date": str(datetime.now(timezone.utc))
    }
    logger.info(f"File metadata: {file_metadata}")
    try:
        # Pass the file metadata to create_ro_crate
        #create_ro_crate(type, file_metadata)
        #logger.info(f"RO-Crate metadata created for file {file_id}.")


        if STORAGE_TYPE == "local":
            # Save the file to local storage
            file_path = f"{media_type}/{file_id}{file_extension}"
            local_file_path = os.path.join(STORAGE_PATH, file_path)
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            with open(local_file_path, "wb") as f:
                f.write(await file.read())
            logger.info(f"File saved to local storage at {local_file_path}.")
        elif STORAGE_TYPE == "S3":
            # Upload the file to the S3 bucket
            s3.upload_fileobj(file.file, BUCKET_NAME, f"{media_type}/{file_id}{file_extension}", ExtraArgs={"ContentType": file.content_type})
            logger.info(f"File uploaded to S3 bucket {BUCKET_NAME} with key {media_type}/{file_id}{file_extension}.")
            file_path = f"s3://{BUCKET_NAME}/{media_type}/{file_id}{file_extension}"
        else:
            raise HTTPException(status_code=500, detail="Invalid STORAGE_TYPE")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "File uploaded successfully",
        "file_id": file_id,
        "file_path": file_path,
        "file_originalname": file.filename,
        "file_filename": f"{file_id}{file_extension}",
        "file_metadata": file_metadata
    }

@app.get("/download/{type}/{file_id}")
async def download_file(type: str, file_id: str):
    """
    Download a file from the S3 bucket.

    Args:
        type (str): The ID of the group to which the file belongs.
        file_id (str): The ID of the file to download.

    Returns:
        StreamingResponse: The file content.
    """
    logger.info(f"Received download request for file {file_id} in group {type}.")
    crate_file_key = f"{type}/ro-crate-metadata.json"
    try:    
        #crate = get_ro_crate(crate_file_key)
        #if crate is None:
            #logger.warning(f"No metadata found for group {type}.")
            #raise HTTPException(status_code=404, detail="No metadata found for this group")
        
        #print(f"Crate metadata: {crate.metadata.generate()}")        
        #file_metadata = crate.dereference(file_id)
        #if not file_metadata:
            #logger.warning(f"File metadata not found for file {file_id}.")
            #raise HTTPException(status_code=404, detail="File metadata not found")

        #print(f"File properties: {file_metadata.properties()}")
        #file_name = file_metadata.get("@id")

        if STORAGE_TYPE == "local":
            # Read the file from local storage
            local_file_path = os.path.join(STORAGE_PATH, f"{type}/{file_id}")
            if not os.path.exists(local_file_path):
                logger.warning(f"File not found at {local_file_path}.")
                raise HTTPException(status_code=404, detail="File not found")
            logger.info(f"File found at {local_file_path}.")
            return StreamingResponse(open(local_file_path, "rb"), media_type="application/octet-stream")
        elif STORAGE_TYPE == "S3":
            # Download the file from the S3 bucket
            file_key = f"{type}/{file_id}"
            print(f"File key: {file_key}")
            file_obj = s3.get_object(Bucket=BUCKET_NAME, Key=file_key)
            logger.info(f"File downloaded from S3 bucket {BUCKET_NAME} with key {file_key}.")
            return StreamingResponse(file_obj['Body'], media_type=file_obj['ContentType'], headers={
                "Content-Disposition": f'attachment; filename="{file_id}"'
            })
        else:
            raise HTTPException(status_code=500, detail="Invalid STORAGE_TYPE")

    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metadata/{type}")
async def get_metadata(type: str):
    """
    Get metadata for all files in a group.

    Args:
        type (str): The ID of the group.

    Returns:
        list: A list of file metadata.
    """
    logger.info(f"Received metadata request for group {type}.")
    crate_file_key = f"{type}/ro-crate-metadata.json"
    try:
        crate = get_ro_crate(crate_file_key)
        if crate is None:
            logger.warning(f"No metadata found for group {type}.")
            raise HTTPException(status_code=404, detail="No metadata found for this group")
        data = crate.metadata.generate()
        logger.info(f"Metadata retrieved for group {type}.")
        return JSONResponse(content = data)
    except HTTPException as e:
        logger.error(f"HTTP error retrieving metadata: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Error retrieving metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)
