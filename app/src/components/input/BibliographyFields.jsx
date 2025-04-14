import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import TransformIcon from '@mui/icons-material/Transform';
import InputAdornment from '@mui/material/InputAdornment';
import { 
  InputText, 
  InputTextMulti,
} from 'components/input/InputFields';

export const DoiInput = ({ fetchBiblio }) => {
  console.log("Render DoiInput")

  const lookup = () => {
    console.log('lookup')
  };

  return (
    <InputText
      name="doi"
      label="Lookup DOI"
      value={''}
      onBlur={(data) => fetchBiblio(data.target.value)}
      inputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => lookup()} edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}            
    />           
  );
};

export const LookupInput = ({ newData, fetchBiblio }) => {
  console.log("Render IsbnInput")

  const lookup = () => {
    console.log('lookup')
  };

  return (
      <Grid container spacing={1} padding={1} size={{ xs:12, xl:12 }}> 
        <Grid size={{ xs: 12 }}>
          <InputText
            name="identifierLookup"
            label="Lookup identifier"
            value={''}
            onBlur={(data) => fetchBiblio(data.target.value)}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => lookup()} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            toolTip="Enter an ISBN, DOI, Wikidata QID, or other identifier to look up bibliographic information."
          />           
        </Grid>
        <Grid size={{ xs: 12 }}>
          <InputTextMulti
            name="formattedLookup"
            label="Add formatted bibliography"
            rows={8}
            value={''}
            onBlur={(data) => fetchBiblio(data.target.value)}
            toolTip="Attempts to extract CSL-JSON information from a formatted bibliographic entry. If not able to parse the text automatically, it defaults to type 'book', but manual editing of the CSL-JSON preview below will be necessary.

The function uses the Citation.js library by Lars Willighagen. See Willighagen, L. G. (2019). Citation.js: a format-independent, modular bibliography tool for the browser and command line. PeerJ Computer Science, 5, e214. 
https://doi.org/10.7717/peerj-cs.214"
          />            
        </Grid>                                        
      </Grid>  
  );
};

export const CslInput = ({ newData, fetchBiblio }) => {
  console.log("Render CslInput")
  const [jsonEntry, setJsonEntry] = useState([]);

  const minimalJson = [{
    "id": uuidv4(),
    "type": "book",
    "title": "",
    "author": [{
      "family": "",
      "given": ""
    }],
    "publisher": ""
  }]

  const lookup = () => {
    console.log('lookup')
  };

  useEffect(() => {
    const cslData = newData.format('data');
    console.log(cslData)
    if (cslData.length > 0) {
      setJsonEntry(cslData);
    } else {
      setJsonEntry(minimalJson);
    }
  }, [newData]);

  return (
      <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}> 
        <Grid size={{ xs: 12 }}>
          <InputTextMulti
            name="cslJson"
            label="CSL-JSON"
            rows={8}
            value={jsonEntry}
            onBlur={(data) => fetchBiblio(data.target.value)}
          />            
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Card >
            <CardActionArea>
              <CardContent onClick={() => { lookup() }}>
                <TransformIcon />
                <Typography gutterBottom variant="b" component="p">
                  Render data
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>                                         
      </Grid>  
  );
};

export const JsonInput = ({ newData, fetchBiblio }) => {
  console.log("Render JsonInput")
  const [jsonEntry, setJsonEntry] = useState([]);

  const minimalJson = [{
    "id": uuidv4(),
    "type": "book",
    "title": "",
    "author": [{
      "family": "",
      "given": ""
    }],
    "publisher": "",
    "issued": {
      "date-parts": [[ 2000 ]]
    }    
  }]

  useEffect(() => {
    const cslData = newData.format('data');
    console.log(cslData)
    if ( cslData !== '[]') {
      setJsonEntry(cslData);
    } else {
      setJsonEntry(JSON.stringify(minimalJson, null, 4));
    }
  }, [newData]);

  return (
    <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}> 
      <Grid size={{ xs: 12 }}>    
        <InputTextMulti
          name="json"
          label="CSL-JSON formatted record"
          rows={14}
          value={jsonEntry}
          onBlur={(data) => fetchBiblio(data.target.value)}
        /> 
      </Grid>                                         
    </Grid>  
  );
};

