import React from 'react';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LaunchIcon from '@mui/icons-material/Launch';
import { useStore } from 'services/store';
import { 
  InputText,
  SingleSelect, 
} from 'components/input/InputFields';
import { 
  handleInputChange, 
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

const DocFields = ({ currData, setCurrData }) => {
  console.log("Render DocumentaryFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Source data"} >
      <Grid size={{ xs: 12, sm: 12, md: 12, xl: 5 }}>
        <SingleSelect
          name="doc_type"
          label="Document Type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms?.doc_type}
          optionLabel="term_name"
          optionValue="uuid"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 8, md: 6, xl: 4 }}>
        <SingleSelect
          name="doc_support"
          label="Support"
          currData={currData}
          setCurrData={setCurrData}
          options={terms?.doc_support}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 6, xl: 3 }} >
        <InputText
          name="doc_tm"
          label="Trismegistos"
          value={currData?.doc_tm}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={currData?.doc_tm &&{ 
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => { window.open(`https://www.trismegistos.org/text/${currData?.doc_tm}`,'_blank');}} edge="end">
                  <LaunchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      {false &&(
        <Grid size={{ xs: 8, sm: 3, md: 8, xl: 6 }}>
          <SingleSelect
            name="doc_format"
            label="Format"
            currData={currData}
            setCurrData={setCurrData}
            options={terms?.doc_format}
            optionLabel="term_name" 
            optionValue="uuid" 
          />
        </Grid>
      )}
    </DataSubEntry>
  );
};

export default DocFields;