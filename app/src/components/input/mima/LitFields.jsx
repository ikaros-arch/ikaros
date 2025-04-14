import React from 'react';
import Grid from '@mui/material/Grid2';
import { InputText } from 'components/input/InputFields';
import { 
  handleInputChange, 
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

const LitFields = ({ currData, setCurrData }) => {
  console.log("Render LiteraryFields")

  return (
    <DataSubEntry heading={"Source data"} >
      <Grid size={{ xs: 12, sm: 12, md: 6, xl: 6 }} >
        <InputText
          label="Author"
          name="lit_author"
          value={currData?.lit_author}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, xl: 6 }} >
        <InputText
          label="Document"
          name="lit_doc"
          value={currData?.lit_doc}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </DataSubEntry>
  );
};

export default LitFields;