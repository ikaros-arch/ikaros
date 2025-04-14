import React from 'react';
import { useStore } from 'services/store';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { 
  handleInputChange, 
} from 'helpers/buttonActions';

const SurveyQuarryScape = ({ currData, setCurrData }) => {
  console.log("Render SurveyQuarryScape")
  const walkers = useStore(state => state.walker);

  return (
    <>
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 2, sm: 2 }}>        
        <TextField
          label="Stone resource"
          variant="outlined"
          id="photoTract"
          name="photoTract"
          value={walkers} // controlled input value
          onChange={handleInputChange} // input change handler
          placeholder="4-digit number"
        />       
        <TextField
          label="Find ID"
          variant="outlined"
          id="findId"
          name="findId"
          fullWidth            
          value={walkers} // controlled input value
          onChange={handleInputChange} // input change handler
        />   
      </Grid>
        <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            label="Find ID"
            id="doc_methods"
            options={recTypeField}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.doc_methods_uuid ? recTypeField.filter(option => currData.doc_methods_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'doc_methods_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Documentation Methods" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid> 
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>        
        <TextField
          label="Find Description"
          variant="outlined"
          id="tract_descr"
          name="tract_descr"
          multiline
          fullWidth              
          rows={4}
          value={walkers} // controlled input value
          onChange={handleInputChange} // input change handler
        />       
      </Grid>
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>        
        <TextField
          label="Filename"
          variant="outlined"
          id="photoFilename"
          name="photoFilename"
          fullWidth              
          value={walkers} // controlled input value
          onChange={handleInputChange} // input change handler
        />       
      </Grid>                             
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>    
      </Grid>           
    </>
  );
};

export default SurveyQuarryScape;
