# File Storage API

## Endpoints

### Upload File
- **URL:** `/upload`
- **Method:** `POST`
- **Form Data:**
  - `file`: File to upload
  - `group_id`: (Optional) Group ID
  - `file_description`: File description
  - `file_author`: File author

### Download File
- **URL:** `/download/{group_id}/{file_id}`
- **Method:** `GET`

### Get Metadata
- **URL:** `/metadata/{group_id}`
- **Method:** `GET`
