import React,  { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography'; 
import Link from '@mui/material/Link';
import { useStore } from 'services/store';

const MediaViewer = ({ currData, parent }) => {
  console.log("Render MediaViewer")
  const [url, setUrl] = useState(null);  
  const [resourceType, setResourceType] = useState(null);
  const domain = useStore(state => state.env.domainName);
  const mediaTypes = useStore(state => state.mediaTypes);
  
  // Find the label for the corresponding media_type UUID
  const mediaTypeLabel = mediaTypes.find(type => type.uuid === currData?.media_type)?.label;

  useEffect(() => {
    if (currData) {
      if (currData.resource_type){
        setResourceType(currData.resource_type);
      } else {
        setResourceType(currData.media_type);
      }
      if (currData.link) {
        setUrl(`https://${domain}/resources/redirect?url=${currData.url}`);
        console.log(currData.url)
      } else {
        setUrl(`https://${domain}/resources/${currData.url}`);
        console.log(`https://${domain}/resources/${currData.url}`)
      }
    }
  }, [currData]);

  if (!url) {
    return (
        <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
          No link in record.
        </Typography>
    );
  }

  return (
    <Paper elevation={1} sx={{  height: '98%' }}>
      <Card variant="outlined" sx={{ marginBottom: 2, width: '100%',}}>
        <CardContent>
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {currData?.filename ? currData.filename : url}
            </Link>
          </Typography>
        </CardContent>
        {(resourceType === '2ed3c20f-e7b6-4046-8fd1-9292c1604b0b' || resourceType === 'f43e4fd9-10b7-4432-b947-19273be90815') && ( // image or photo 
          <CardMedia
            component="img"
            height="500px"
            width="100%"
            image={url}
            alt="Image preview"
            sx={{ objectFit: 'contain' }} // Adjust the fit as needed
          />
        )}
        {resourceType === '54bf7600-e772-4775-b729-79f92821e74a' && ( //pdf
          <iframe
            //src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`}
            src={encodeURIComponent(url)}
            width="100%"
            height="100%"
            frameBorder="0"
            title={`PDF Preview - ${currData.filename}`}
          ></iframe>
        )}
        {resourceType === '08c7962d-283f-4ff7-91fe-23e28c08d344' && ( // website
          <iframe
            src={url}
            width="100%"
            height="100%"
            frameBorder="0"
            title={`Web Preview`}
          ></iframe>
        )}    
      </Card>
    </Paper>
  );
};

export default MediaViewer;