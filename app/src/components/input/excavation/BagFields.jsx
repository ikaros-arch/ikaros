import React from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useStore } from 'services/store';
import {
  InputText,
  ToggleButtons,
  InputTextMulti, 
  SingleSelect,
} from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { TextEditor } from 'components/input/MarkDownEditor';
import { DataSubEntry } from 'components/layout/Sheets';

export const InventoryFields = ({ currData, setCurrData }) => {
  console.log("Render Find InventoryFields")
  const userRole = useStore(state => state.userRole);
  const terms = useStore(state => state.terms);

  return (
    <Grid container spacing={1} padding={1} size={{ xs: 12 }}>
      <Grid size={{ xs: 4, sm: 3, md: 3 }} >
        <InputText
          name="identifier"
          label="Id"
          value={currData?.identifier}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='integer'
          inputProps={{
            type: 'text',
            pattern: "^[0-9]+$" //integer
          }}
          toolTip='Find number: a numeric (integer) find number.'
        />
      </Grid>
      <Grid 
        size={{ xs: 8, sm: 9 }}
        sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
        }}>
        <ToggleButtons
          name="status"
          label="Status"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.find_status}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
    </Grid>
  );
};

export const DescriptionFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Description"}>
      <Grid size={{ xs: 12 }}>
        <TextEditor 
          id='description'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const BagFields = ({ currData, setCurrData }) => {  
  console.log("Render BagFields");
  const navigate = useNavigate();
  const contexts = useStore(state => state.contexts);
  const trenches = useStore(state => state.trenches);
  const phases = useStore(state => state.phases);
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 8, sm: 6, md: 12, xl: 6 }}>
        <SingleSelect
          name="bag_category"
          label="Category"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.bag_category}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
      <Grid size={{ xs: 8, sm: 6, md: 6, xl: 6 }}>
        <SingleSelect
          name="trench"
          label="Trench"
          currData={currData}
          setCurrData={setCurrData}
          options={trenches}
          optionLabel="title"
          optionValue="uuid"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => currData?.trench && navigate(`../Trench/${currData.trench}`)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 6, xl: 6 }}>
        <SingleSelect
          name="context"
          label="Context"
          currData={currData}
          setCurrData={setCurrData}
          options={contexts}
          optionLabel="label"
          optionValue="value"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => currData?.context && navigate(`../Context/${currData.context}`)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 3, md: 6, xl: 6 }}>
        <SingleSelect
          name="phase"
          label="Phase"
          currData={currData}
          setCurrData={setCurrData}
          options={phases}
          optionLabel="label" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 3, md: 12, xl: 6 }}>
        <InputText
          name="object_count"
          label="Object Count"
          value={currData?.object_count}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='integer'
          inputProps={{
            type: 'text',
            pattern: "^[0-9]+$" //integer
          }}
          toolTip='This is a temporary placeholder.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputTextMulti
          name="description"
          label="Description"
          value={currData?.description}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
    </DataSubEntry>
  );
};
