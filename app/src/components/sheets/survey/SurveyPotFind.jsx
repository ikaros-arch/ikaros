import React from 'react';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Autocomplete from '@mui/material/Autocomplete';
import { useStore } from 'services/store';
import { 
  handleInputChange, 
  handleAutocompleteChange, 
} from 'helpers/buttonActions';

const SurveyPotFind = ({ currData, setCurrData }) => {
  console.log("Render SurveyPotFind")
  const walkers = useStore(state => state.walker);

  return (
    <>
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 2, sm: 2 }}>        
        <TextField
          label="Tract"
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
      <Grid size={{ xs: 12, sm: 12 }} order={{ xs: 5 }}>
        <FormControl>
          <FormLabel id="type-group-label">Type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="type-group-label"
            name="type"
          >
            <FormControlLabel value="P" control={
              <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
          } label="Pottery" />
            <FormControlLabel value="L" control={
              <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
            } label="Lithic" />
            <FormControlLabel value="A" control={
              <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
            } label="Architecture" />                 
            <FormControlLabel value="S" control={
              <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
            } label="Stone" />
            <FormControlLabel value="O" control={
              <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
            } label="Other" />                            
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 6 }}>
        <Autocomplete
          style={{ flex: 1 }}
          disablePortal
          id="recorder"
          options={walkers}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}              
          value={currData ? walkers.find(option => option.value === currData.recorder_uuid) || null : null}
          onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'recorder_uuid', currData, setCurrData)}
          renderInput={(params) => <TextField {...params} label="Recorder" />}
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

export default SurveyPotFind;
