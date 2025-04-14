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
  DateRange
} from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

export const InventoryFields = ({ currData, setCurrData }) => {
  console.log("Render Find InventoryFields")
  const userRole = useStore(state => state.userRole);
  const terms = useStore(state => state.terms);

  return (
    <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}>
      <Grid size={{ xs: 6, sm: 3, md: 3 }}>
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
          toolTip='Target or point number: an integer number.'
        />
      </Grid>
      <Grid 
        size="grow"
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
          options={terms.topo_status}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
    </Grid>
  );
};

export const TopoFields = ({ currData, setCurrData }) => {  
  console.log("Render TopoFields")
  const navigate = useNavigate();  
  const areas = useStore(state => state.areas);
  const trenches = useStore(state => state.trenches);
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 12, sm: 12, md: 8, xl: 6 }}>
        <SingleSelect
          name="topo_point_type"
          label="Point Type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.topo_point_type}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="area"
          label="Area"
          currData={currData}
          setCurrData={setCurrData}
          options={areas}
          optionLabel="label"
          optionValue="value"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => currData?.area && navigate(`../Area/${currData.area}`)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8, xl: 6 }}>
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
      <Grid size={{ xs: 12, sm: 12, md: 4, xl: 6 }}>
        <DateRange
          name="active_period"
          startLabel="Active from"
          endLabel="Active to"
          currData={currData}
          setCurrData={setCurrData}
          toolTip="The first and the last date the point is in operation. If currently active, leave end date empty." 
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