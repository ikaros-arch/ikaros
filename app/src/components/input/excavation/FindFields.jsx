import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatISO } from 'date-fns';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { useStore } from 'services/store';
import {
  InputText,
  ToggleButtons,
  InputTextMulti, 
  SingleSelect,
} from 'components/input/InputFields';
import FindSpecsFields from 'components/input/excavation/FindSpecsFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { TextEditor } from 'components/input/MarkDownEditor'
import { DataSubEntry } from 'components/layout/Sheets';

export const InventoryFields = ({ currData, setCurrData }) => {
  console.log("Render Find InventoryFields")
  const userRole = useStore(state => state.userRole);
  const terms = useStore(state => state.terms);

  return (
    <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}>
      <Grid size={{ xs: 4, sm: 3, md: 3 }}>
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
      <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}>
        <TextEditor
          id='description'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const FindFields = ({ currData, setCurrData }) => {  
  console.log("Render FindFields")
  const navigate = useNavigate();  
  const contexts = useStore(state => state.contexts);
  const trenches = useStore(state => state.trenches);
  const phases = useStore(state => state.phases);
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 12, sm: 6, md: 12, xl: 6 }}>
        <SingleSelect
          name="artefact_category"
          label="Category"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.artefact_category}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 12, xl: 6 }}>
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
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }}>
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
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }}>
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

export const FindDimensionsFields = ({ currData, setCurrData }) => {
  console.log("Render FindDimensionsFields")
  return (
    <DataSubEntry heading={"Dimensions"}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_length"
          label="Length"
          value={currData?.artefact_length}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Maximum length of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_height"
          label="Height"
          value={currData?.artefact_height}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Maximum height of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_width"
          label="Width"
          value={currData?.artefact_width}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Maximum width of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_thickness"
          label="Thickness"
          value={currData?.artefact_thickness}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Maximum thickness of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_diameter_est"
          label="Est. diameter"
          value={currData?.artefact_diameter_est}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Estimated diameter of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_diameter_max"
          label="Diameter"
          value={currData?.artefact_diameter_max}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          toolTip='Maximum diameter of artefact (metres).'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="artefact_weight"
          label="Weight"
          value={currData?.artefact_weight}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
            endAdornment: <InputAdornment position="end">g</InputAdornment>,
          }}
          toolTip='Weight of artefact (grams).'
        />
      </Grid>
    </DataSubEntry>
  );
};

export const SpecialistFields = ({ currData, setCurrData }) => {
  console.log("Render SpecialistFields")
  const terms = useStore(state => state.terms);
  const activeActor = useStore(state => state.activeActor);

  if (!currData.specialist_evaluation) {
    // Initialize object if not already
    currData.specialist_evaluation = {};
  }

  const handleAddObject = () => {
    const timestamp = formatISO(new Date());
    let updatedData = { 
      ...currData, 
      specialist_evaluation: {
          ...currData.specialist_evaluation,
          [timestamp]: {"specialist": activeActor.uuid}
      }
    };
    setCurrData(updatedData);
  };

  const handleDelete = (key) => {
    let updatedData = { 
      ...currData, 
      specialist_evaluation: {
        ...currData.specialist_evaluation
      }
    };
    delete updatedData.specialist_evaluation[key];
    setCurrData(updatedData);
  };

  return (
    <DataSubEntry heading={"Specialist Evaluation"}>
      <Grid size={{ xs: 12 }}>
        {Object.entries(currData.specialist_evaluation).map(([key, data], index) => {
          return (
            <Paper elevation={1} key={index} sx={{ mb: 1, p: 1 }}>
              <FindSpecsFields
                key={index}
                name={key}
                terms={terms}
                label={key}
                currData={currData}
                setCurrData={setCurrData}
                handleDelete={handleDelete}
              />
            </Paper>
          );
        })}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, xl: 6 }}>
        <Button variant="contained" onClick={handleAddObject}>Add Specialist Evaluation</Button>
      </Grid>
    </DataSubEntry>
  );
};