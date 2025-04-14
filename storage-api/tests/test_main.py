import json
from tests.conftest import GROUP_ID, FILE_ID, FILE_NAME, FILE_PATH

def test_upload_file(test_client, check_s3_connection, setup_test_file):
    """
    Test the file upload endpoint.
    """

    with open(FILE_PATH, "rb") as f:
        response = test_client.post(
            "/upload",
            files={"file": (FILE_NAME, f, "text/plain")},
            data={
                "group_id": GROUP_ID, 
                "file_id": FILE_ID, 
                "file_description": "Test file", 
                "file_author": "Test author"
            }
        )

    print(response.json())
    assert response.status_code == 200
    assert response.json()["message"] == "File uploaded successfully"

def test_download_file(test_client, check_s3_connection):
    """
    Test the file download endpoint.
    """
    response = test_client.get(f"/download/{GROUP_ID}/{FILE_NAME}")
    wrong_group = test_client.get(f"/download/idonotexist/{FILE_NAME}")
    wrong_file = test_client.get(f"/download/{GROUP_ID}/idonotexist.pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/plain; charset=utf-8"
    assert response.headers["content-disposition"] == f'attachment; filename="{FILE_NAME}"'

    assert wrong_group.status_code == 404
    assert wrong_group.json()["detail"] == "No metadata found for this group"
    assert wrong_file.status_code == 404
    assert wrong_group.json()["detail"] == "File metadata not found"


def test_get_metadata(test_client, check_s3_connection):
    """
    Test the metadata retrieval endpoint.
    """

    response = test_client.get(f"/metadata/{GROUP_ID}")
    wrong_group = test_client.get(f"/download/idonotexist")

    # Parse the JSON string into a Python dictionary
    response_json = response.json()

    print(response_json)
    
    assert response.status_code == 200
    assert isinstance(response_json, dict)
    assert "@graph" in response_json
    assert isinstance(response_json["@graph"], list)

    assert wrong_group.status_code == 404
    assert wrong_group.json()["detail"] == "No metadata found for this group"    