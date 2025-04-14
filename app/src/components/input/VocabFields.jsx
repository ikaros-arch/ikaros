import React from 'react';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LaunchIcon from '@mui/icons-material/Launch';
import { useStore } from 'services/store';
import { 
  InputText, 
  InputTextMulti, 
  SingleSelect, 
  CheckInput, 
  MultiSelect 
} from 'components/input/InputFields';
import { PlaceAuthorityEditor, TermAuthorityEditor } from 'components/input/mima/AuthorityEditor'
import { 
  handleInputChange, 
} from 'helpers/buttonActions';

export const TermFields = ({ currData, setCurrData }) => {
  console.log("Render TermFields")
  const termTypes = useStore(state => state.termTypes);
  console.log(termTypes)

  return (
    <Grid container spacing={1} padding={2} >
      <Grid size={{ xs: 12, sm: 6, md: 6 }} >
        <InputText
          name="term_name"
          label="Term"
          value={currData?.term_name}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} >
        <SingleSelect
          name="term_type"
          label="Type"
          currData={currData}
          setCurrData={setCurrData}
          options={termTypes}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <TermAuthorityEditor 
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </Grid>
  );
};


export const PlaceFields = ({ currData, setCurrData }) => {
  console.log("Render PlaceFields")
  const terms = useStore(state => state.terms);

  return (
    <Grid container spacing={1} padding={2} >
      <Grid size={{ xs: 12, sm: 12, md: 4 }} >
        <InputText
          name="name"
          label="Name"
          value={currData?.name}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip={"The name of the place."}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }} >
        <InputText
          name="name_modern"
          label="Modern Name"
          value={currData?.name_modern}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip={"The modern name of the place, if different from the main name."}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }} >
        <SingleSelect
          name="place_type"
          label="Type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms?.place_type}
          optionLabel="term_name"
          optionValue="uuid"
          toolTip={"Select the type of place from the controlled vocabulary. Add and edit available types in the 'Terms' section."}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <PlaceAuthorityEditor 
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="geojson"
          label="GeoJSON"
          value={JSON.stringify(currData?.geojson, null, 4)}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={12}
          toolTip={"GeoJSON data generated from the database. Currrntly read-only."}
        />
      </Grid>
    </Grid>
  );
};

export const ActorFields = ({ currData, setCurrData }) => {
  const userRole = useStore(state => state.userRole);
  console.log("Render ActorFields")

  const roles = [
    {"value":"admin","label":"Admin"}, 
    {"value":"read_write","label":"Write Access"}, 
    {"value":"read_only","label":"Read Access"},
    ];

  return (
    <Grid container spacing={1} padding={2} >
      <Grid size={{ xs: 12, sm: 12, md: 5 }} >
        <InputText
          name="name"
          label="Name"
          value={currData?.name}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
        <InputText
          name="initials"
          label="Initials"
          value={currData?.initials}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />      
      </Grid>
      <Grid size={{ xs: 12, sm: 8, md: 5 }}>
        <InputText
          name="orcid"
          label="ORCID ID"
          value={currData?.orcid}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => { window.open(`https://orcid.org/${currData?.orcid}`,'_blank');}} edge="end">
                  <LaunchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      {userRole === 'admin' &&
        <>
          <Grid size={{ xs: 12, sm: 12, md: 5 }} >
            <InputText
              name="email"
              label="Email"
              value={currData?.email}
              onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 5 }} >
            <MultiSelect
              name="access"
              label="Access roles"
              currData={currData}
              setCurrData={setCurrData}
              options={roles}
              optionLabel="label" 
              optionValue="value" 
            />
          </Grid> 
          <Grid size={{ xs: 3, sm: 12, md: 2 }}>
            <CheckInput
              name="active"
              label="Active"
              currData={currData}
              setCurrData={setCurrData}
            />
          </Grid>
        </>
      }
    </Grid>
  );
};