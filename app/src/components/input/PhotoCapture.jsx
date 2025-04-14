import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from 'services/store';


const UploadForm = ({ currData, setCurrData }) => {
  const [file, setFile] = useState(null);
  const domain = useStore(state => state.env.domainName);
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setCurrData({ 
        ...currData,
        'filename': selectedFile.name, 
        'captured_at': new Date().toISOString() 
      })
      setFile(selectedFile);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional metadata if needed
    formData.append('capturedAt', new Date().toISOString());
    formData.append('fileName', file.name);
    
    axios.post(`https://${domain}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      console.log('File uploaded successfully');
    })
    .catch(error => {
      console.error('Error uploading file', error);
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="file" accept="image/*; capture=camera" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
