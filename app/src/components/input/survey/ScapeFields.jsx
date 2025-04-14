import React from 'react';
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { parseISO } from 'date-fns';
import { useStore } from 'services/store';
import { 
  handleInputChange, 
  handleDateChange, 
  handleAutocompleteChange, 
  handleMultiAutocompleteChange 
} from 'helpers/buttonActions';

const ScapeFields = ({ currData, setCurrData }) => {
  console.log("Render ScapeFields")
  const walkers = useStore(state => state.walker);
  const recTypeField = useStore(state => state.recTypeField);  
  const scapeType = useStore(state => state.scapeType);  
  const natResource = useStore(state => state.natResource);  
  const depositGeom = useStore(state => state.depositGeom);  
  const quarryLayout = useStore(state => state.quarryLayout);  

  const groupedResources = natResource
    .reduce((options, option) => {
    if (option.parent === null) {
      return options;
    }
    return options.concat({
      groupLabel: natResource.find(o => o.value === option.parent).label,
      ...option,
    });
  }, []);

  const groupedDepositGeom = depositGeom
    .reduce((options, option) => {
    if (option.parent === null) {
      return options;
    }
    return options.concat({
      groupLabel: depositGeom.find(o => o.value === option.parent).label,
      ...option,
    });
  }, []);

  return (
    <Grid container spacing={1} padding={1} >
      <Grid size={{ xs: 12, sm: 3, md: 3 }} order={{ xs: 6 }}>
          <TextField
            label="Scape ID"
            variant="outlined"
            id="scape_name"
            name="name"
            fullWidth              
            value={currData?.name || null}
            onChange={(data) => handleInputChange(data, currData, setCurrData)}
          />  
      </Grid>  
      <Grid size={{ xs: 12, sm: 3 }} order={{ xs: 6 }}>
        <Autocomplete
          id="type"
          options={scapeType}
          getOptionLabel={(option) => option.label}
          value={currData ? scapeType.find(option => option.value === currData.type_uuid) || null : null}
          onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'type_uuid', currData, setCurrData)}
          renderInput={(params) => <TextField {...params} label="Scape Type" />}
          renderOption={(props, option) => <li {...props}>{option.label}</li>} 
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </Grid>                                      
      <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 5, sm: 6 }}>
        <DatePicker
          label="Date"
          value={currData?.recorded_date ? parseISO(currData?.recorded_date): new Date()}
          onChange={(date) => handleDateChange(date, 'recorded_date', currData, setCurrData)}
          slots={{
            textField: params => <TextField {...params} />}}
        />
      </Grid>        
      <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 5, sm: 6 }}>
        <Autocomplete
          style={{ flex: 1 }}
          id="recorder"
          options={walkers}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}              
          value={currData ? walkers.find(option => option.value === currData.recorder_uuid) || null : null}
          onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'recorder_uuid', currData, setCurrData)}
          renderInput={(params) => <TextField {...params} label="Recorder" />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
        <Autocomplete
          multiple
          id="natural_resources"
          options={groupedResources}
          groupBy={(option) => option.groupLabel}
          getOptionLabel={(option) => option.label ? option.label : ""}
          isOptionEqualToValue={(option, value) => option.value === value.value}            
          value={ currData?.natural_resources_uuid ? groupedResources.filter(option => currData.natural_resources_uuid.includes(option.value)) : [] }
          onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'natural_resources_uuid', currData, setCurrData)}
          renderInput={(params) => <TextField {...params} label="Natural Resources" />}
        />        
      </Grid>                         
      <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
        <Autocomplete
          disablePortal
          multiple
          id="doc_methods"
          options={recTypeField}
          getOptionLabel={(option) => option.label}
          value={ currData?.doc_methods_uuid ? recTypeField.filter(option => currData.doc_methods_uuid.includes(option.value)) : [] }
          onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'doc_methods_uuid', currData, setCurrData)}
          renderInput={(params) => <TextField {...params} label="Documentation Methods" />}
          renderOption={(props, option) => <li {...props}>{option.label}</li>} 
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </Grid>
      { (currData?.type_uuid === '64be8aee-c8de-41f5-bd8a-93afe301633a') &&
        <>
          <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
            <Autocomplete
              id="deposit_geometry"
              options={groupedDepositGeom}
              groupBy={(option) => option.groupLabel}
              getOptionLabel={(option) => option.label ? option.label : ""}
              isOptionEqualToValue={(option, value) => option.value === value.value}            
              value={ currData ? groupedDepositGeom.find(option => option.value === currData.deposit_geometry_uuid) || null : null }
              onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'deposit_geometry_uuid', currData, setCurrData)}
              renderInput={(params) => <TextField {...params} label="Deposit Geometry" />}
            />        
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
            <Autocomplete
              style={{ flex: 1 }}
              id="quarry_layout"
              options={quarryLayout}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}              
              value={currData ? quarryLayout.find(option => option.value === currData.layout_uuid) || null : null}
              onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'layout_uuid', currData, setCurrData)}
              renderInput={(params) => <TextField {...params} label="Quarry Layout" />}
            />   
          </Grid>          
        </>
      }
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>        
        <TextField
          label="Scape Description"
          variant="outlined"
          id="scape_descr"
          name="description"
          multiline
          fullWidth              
          rows={4}
          value={currData?.description || null} // controlled input value
          onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
        />       
      </Grid>
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>        
        <TextField
          label="Notes"
          variant="outlined"
          id="scape_notes"
          name="notes"
          multiline
          fullWidth              
          rows={4}
          value={currData?.notes || null} // controlled input value
          onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
        />
      </Grid>
    </Grid>    
  );
};

export default ScapeFields;
