import React from 'react';
import Grid from '@mui/material/Grid2';
import { InputTextMulti, CheckInput } from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

const ArchFields = ({ currData, setCurrData }) => {
  console.log("Render ArchaeologicalFields")

  return (
    <DataSubEntry heading={"Field data"} >
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="arch_excavations"
          label="Excavations"
          value={currData?.arch_excavations}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
      <Grid size={{ xs: 3 }} >
        <CheckInput
          name="arch_visited"
          label="Visited"
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};

export default ArchFields;