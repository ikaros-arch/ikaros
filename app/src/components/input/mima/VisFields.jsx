import React from 'react';
import Grid from '@mui/material/Grid2';
import { 
  InputText,
  SingleSelect, 
} from 'components/input/InputFields';
import { useStore } from 'services/store';
import { 
  handleInputChange, 
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

const VisFields = ({ currData, setCurrData }) => {
  console.log("Render VisualFields")
  const terms = useStore(state => state.terms);
  console.log(terms);

  return (
    <DataSubEntry heading={"Object description"} >
      <Grid size={{ xs: 12, sm: 12, md: 6, xl: 6 }}>
        <SingleSelect
          name="vis_type"
          label="Visual Type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms?.vis_type}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, xl: 6 }}>
        <SingleSelect
          name="vis_material"
          label="Material"
          currData={currData}
          setCurrData={setCurrData}
          options={terms?.vis_material}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }} >
        <InputText
          label="Size"
          name="vis_size"
          value={currData?.vis_size}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }} >
        <InputText
          label="Provenance"
          name="vis_provenance"
          value={currData?.vis_provenance}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </DataSubEntry>
  );
};

export default VisFields;