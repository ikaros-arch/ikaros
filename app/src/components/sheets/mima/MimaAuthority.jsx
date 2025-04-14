import React, { useState } from 'react';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography'; 
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ExpandMore from '@mui/icons-material/ExpandMore';

const ResourceCard = ({ resourceType, link, index }) => {
  const [expanded, setExpanded] = useState(false);

  const handleEdit = (resourceType, index) => {
    console.log(`Edit ${resourceType} at index ${index}`);
    // Implement logic to edit a selected resource
  };
  
  const handleDelete = (resourceType, index) => {
    console.log(`Delete ${resourceType} at index ${index}`);
    // Implement logic to delete a selected resource
  };

  const handleExpandClick = () => {
    setExpanded(!expanded); // Toggle expanded state
  };

  return (
    <Grid size={{ xs:12, sm: expanded ? 12 : 6, md: expanded ? 12 : 4 }} key={index}>    
      <Card variant="outlined" sx={{ marginBottom: 2, width: '100%', gridRowEnd: expanded ? 'span 2' : undefined }}>
        <CardContent>
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            <Link href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </Link>
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMore />
          </IconButton>
          <IconButton aria-label="edit" size="small" onClick={() => handleEdit(resourceType, index)}>
            <Edit />
          </IconButton>
          <IconButton aria-label="delete" size="small" onClick={() => handleDelete(resourceType, index)}>
            <Delete />
          </IconButton>        
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
                      {resourceType === 'images' && (
                        <CardMedia
                          component="img"
                          height="500"
                          image={link}
                          alt="Image preview"
                          sx={{ objectFit: 'cover' }} // Adjust the fit as needed
                        />
                      )}
                      {link.toLowerCase().endsWith('.pdf') && (
                        <iframe
                          src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(link)}`}
                          width="100%"
                          height="500"
                          frameBorder="0"
                          title={`PDF Preview - ${index}`}
                        ></iframe>
                      )}
                      {!(resourceType === 'images' || link.toLowerCase().endsWith('.pdf')) && (
                        <iframe
                          src={link}
                          width="100%"
                          height="500"
                          frameBorder="0"
                          title={`Web Preview - ${index}`}
                        ></iframe>
                      )}    
          {/* Potentially other content types could be handled here */}
        </Collapse>
      </Card>
    </Grid>
  );
};

const Authorities = ({ currData, setCurrData, parent }) => {
  console.log("Render Links")
  console.log(currData?.links)

  const resources = currData?.links;

  const handleAdd = resourceType => {
    console.log(`Add new ${resourceType}`);
    // Implement logic to add a new resource
  };
  

  if (!resources) {
    return (
        <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
          No entry loaded.
        </Typography>      
    );
  }  

  return (
    <Grid container spacing={2}>
      {Object.entries(resources).map(([resourceType, links]) => (
        <Grid size={{ xs: 12 }} key={resourceType}>
          <Paper elevation={1}>
            <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
              {resourceType.replace('_', ' ')}
            </Typography>
            {/* Map through the links array to generate the list of Paper Cards */}
            <Grid container spacing={2}>
              {links?.map((link, index) => (
                  <ResourceCard
                    resourceType={resourceType}
                    link={link}
                    index={index} />
              ))}
            </Grid>
            {/* Add new button for each category */}
            <IconButton aria-label="add" size="small" onClick={() => handleAdd(resourceType)}>
              <AddCircleOutline />
            </IconButton>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default Authorities;