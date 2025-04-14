import React from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useStore } from 'services/store';
import { 
  InputTextMulti, 
  SingleSelect,
  MultiSelect,
  DateRange
} from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

const TrenchFields = ({ currData, setCurrData }) => {  
  console.log("Render TrenchFields")
  const navigate = useNavigate();  
  const areas = useStore(state => state.areas);
  const projects = useStore(state => state.projects);
  const phases = useStore(state => state.phases);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 8, sm: 3, md: 8, xl: 6 }}>
        <SingleSelect
          name="project"
          label="Project"
          currData={currData}
          setCurrData={setCurrData}
          options={projects}
          optionLabel="title"
          optionValue="uuid"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => currData?.project && navigate(`../Project/${currData.project}`)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 3, md: 4, xl: 6 }}>
        <SingleSelect
          name="area"
          label="Area"
          currData={currData}
          setCurrData={setCurrData}
          options={areas}
          optionLabel="title"
          optionValue="uuid"
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
      <Grid size={{ xs: 8, sm: 9, md: 8, xl: 6 }}>
        <DateRange
          name="excavation_period"
          startLabel="Opened"
          endLabel="Closed"
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 3, md: 4, xl: 6 }}>
        <MultiSelect
          name="phase"
          label="Phases"
          currData={currData}
          setCurrData={setCurrData}
          options={phases}
          optionLabel="label" 
          optionValue="uuid" 
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

export default TrenchFields;