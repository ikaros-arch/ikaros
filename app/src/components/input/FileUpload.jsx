import React, { useState, useCallback  } from 'react';
import { useDropzone } from 'react-dropzone';
import Typography from '@mui/material/Typography';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from 'services/store';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';


const UploadForm = ({ currData, setCurrData }) => {
  const [loading, setLoading] = useState(false);
  const mediaTypes = useStore(state => state.mediaTypes);  
  const domain = useStore(state => state.env.domainName);  
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);

  const onDrop = useCallback(acceptedFiles => {
    setLoading(true);
    console.log('Files for upload:')
    console.log(acceptedFiles);
    // Take the first file if multiple files are dropped (if allowing multiple files, then iterate over them)
    const file = acceptedFiles[0];
    let newUuid = currData?.uuid
    // Map media_type on mediaTypes to get label for uuid.

    const formData = new FormData();
    formData.append('file', file);

    // Add additional metadata if needed
    if(!newUuid) {
      newUuid = uuidv4();
    }
    
    // Find the label for the corresponding media_type UUID
    const mediaTypeLabel = mediaTypes.find(type => type.uuid === currData?.media_type)?.label;

    formData.append('uuid', newUuid);
    formData.append('media_type', mediaTypeLabel);
    formData.append('media_type_uuid', currData?.media_type);
    formData.append('creator', currData?.creator);
    formData.append('captured_at', currData?.captured_at);
    formData.append('license', currData?.copyright);
    formData.append('description', currData?.description);
    formData.append('parent_type', currData?.parent_type);
    formData.append('parent', currData?.parent);
    
    // Post the form data to the server endpoint
    axios.post(`https://${domain}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      console.log('File uploaded successfully');
      console.log(response);
      if (response?.data?.file_path){
        setCurrData({ 
          ...currData,
          'uuid': newUuid,
          'url': `${response.data.file_path}`,
          'filename': response.data.file_originalname
        })
      }
      setSnackbarData ({
        "actionType": "upload",
        "messageType": "success",
        "messageText": `${response.data.message} ${response.data.file_originalname} --> ${response.data.file_filename}`
      });      
      setLoading(false);
      setSnackbarOpen(true)  
    })
    .catch(error => {
      console.error('Error uploading file', error);
      setSnackbarData ({
        "actionType": "upload",
        "messageType": "error",
        "messageText": `Upload failed: ${error}`
      });
      setLoading(false);
      setSnackbarOpen(true)  
    });
  }, [currData]);

  // Instantiate the hook
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
      accept: {
        "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        "application/pdf": [".pdf"]
        // Add nxz and nxs file types
      },       
  });

  if (loading)  {
    return <CircularProgress />;
  }
  if (!currData?.media_type) {
    return (
      <Typography variant="subtitle1" style={{ padding: '20px' }}>
        Please select a media type before uploading a file.
      </Typography>
    )
  }
  return (
    <div {...getRootProps()} style={{border: '2px dashed #000', padding: '20px', cursor: 'pointer'}}>
      <input {...getInputProps()} />
      <p>Drag, or click to select a file</p>
    </div>
  );
};

export default UploadForm;
