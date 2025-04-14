import React from 'react';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import { 
  InputText, 
  ToggleButtons,
} from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { TextEditor } from 'components/input/MarkDownEditor'
import { DataSubEntry } from 'components/layout/Sheets';


export const InventoryFields = ({ currData, setCurrData }) => {
  console.log("Render CommonFields")
  const userRole = useStore(state => state.userRole);
  const terms = useStore(state => state.terms);

  return (
    <Grid container spacing={1} padding={1} size={{ xs:12 }}> 
      <Grid 
        size={{ xs:12 }}
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
          options={terms.context_status}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
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
          toolTip='Context number: a numeric (integer) context number.'
        />
      </Grid>
      <Grid size={{ xs: 8, sm: 9, md: 9 }}>
        <InputText
          name="title"
          label="Name"
          value={currData?.title}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip={'A short, descriptive title for the context.'}
        />
      </Grid>
    </Grid>
  );
};

export const DescriptionFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Description"}>
      <Grid container spacing={1} padding={1} size={{ xs: 12 }}>
        <TextEditor 
          id='description'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};