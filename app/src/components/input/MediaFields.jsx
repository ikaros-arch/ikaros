import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import UploadForm from 'components/input/FileUpload';
import { useStore } from 'services/store';
import { 
  InputText, 
  InputTextMulti, 
  SingleSelect, 
  CheckInput 
} from 'components/input/InputFields';
import { 
  handleInputChange,
  goToRecord
} from 'helpers/buttonActions';
import { DataSubEntry } from 'components/layout/Sheets';

/**
 * MediaInventoryFields component renders a form with fields for media inventory.
 * It updates the current data state based on the selected media type.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {string} props.type - The type of media.
 *
 * @returns {JSX.Element} The rendered MediaInventoryFields component.
 */
export const MediaInventoryFields = ({ currData, setCurrData, type }) => {
  console.log("Render MediaInventoryFields")
  const mediaTypes = useStore(state => state.mediaTypes);
  console.log(mediaTypes)

  useEffect(() => {
    if (!currData.media_type && type) {
      const matchedType = mediaTypes.find(mediaType => mediaType.label.toLowerCase() === type.toLowerCase());
      if (matchedType) {
        setCurrData(prevData => ({ ...prevData, media_type: matchedType.uuid }));
      }
    }
  }, [currData, setCurrData, type, mediaTypes]);

  return (
    <Grid size={{ xs: 12 }} >
      <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}> 
        <Grid size={{ xs: 4, sm: 3, md: 3 }}>
          <InputText
            name="media_id"
            label="Id"
            value={currData?.media_id}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
        <Grid size={{ xs: 8, sm: 9, md: 9 }}>
          <InputText
            name="filename"
            label="Filename"
            value={currData?.filename}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
            <SingleSelect
              name="media_type"
              label="Type"
              currData={currData}
              setCurrData={setCurrData}
              options={mediaTypes}
              optionLabel="label"
              optionValue="uuid" 
            />
        </Grid>
      </Grid>
    </Grid>
  );
};

/**
 * MetadataFields component renders a form for editing metadata fields.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object containing metadata fields.
 * @param {Function} props.setCurrData - The function to update the current data object.
 *
 * @returns {JSX.Element} The rendered MetadataFields component.
 */
export const MetadataFields = ({ currData, setCurrData }) => {
  console.log("Render MetadataFields")
  const actors = useStore(state => state.actors);

  return (
    <DataSubEntry heading={"Metadata"} >
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="description"
          label="Description"
          value={currData?.description}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelect
          name="creator"
          label="Creator"
          currData={currData}
          setCurrData={setCurrData}
          options={actors}
          optionLabel="name"
          optionValue="uuid"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} >
        <InputText
          name="captured_at"
          label="Capture Time"
          value={currData?.captured_at}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputText
          name="copyright"
          label="Copyright Information"
          value={currData?.copyright}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </DataSubEntry>
  );
};

/**
 * ParentFields component renders a form section for selecting parent data.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object.
 * @param {Function} props.setCurrData - Function to update the current data.
 * 
 * @returns {JSX.Element} The rendered ParentFields component.
 */
export const ParentFields = ({ currData, setCurrData }) => {
  console.log("Render ParentFields")
  const recordLookup = useStore(state => state.recordLookup);
  const [parent, setParent] = useState(null);  

  const navigate = useNavigate();

  const parent_types = [
    {
      value: 'A',
      label: 'Archaeological'
    },{
      value: 'D',
      label: 'Documentary'
    },{
      value: 'L',
      label: 'Literary'
    },{
      value: 'V',
      label: 'Visual'
    }
  ]

  useEffect(() => {
    setParent(
      currData ? recordLookup.find(option => option.value === currData.parent) || null : null
    );
  }, [currData]);


  return (
    <DataSubEntry heading={"Parent data"}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelect
          name="parent_type"
          label="Parent Type"
          currData={currData}
          setCurrData={setCurrData}
          options={parent_types}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelect
          name="parent"
          label="Parent record"
          currData={currData}
          setCurrData={setCurrData}
          options={recordLookup}
          optionLabel="label"
          optionValue="value"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => parent && goToRecord(navigate, parent.label)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
    </DataSubEntry>
  );
};

/**
 * ResourceFields component renders a form for managing resource data.
 * It displays a checkbox for external media, and based on its state, either
 * shows an input field for URL or an upload form for file uploads.
 * 
 * If the type is 'website' and there is no link in the current data, 
 * it will set the link field to true.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object for the resource.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {string} props.type - The type of resource (e.g., 'website').
 *
 * @returns {JSX.Element} The rendered component.
 */
export const ResourceFields = ({ currData, setCurrData, type }) => {
  console.log("Render ResourceFields")

  useEffect(() => {
    if (type === 'Website' && currData.link === undefined) {
      setCurrData(prevData => ({ ...prevData, link: true }));
    }
  }, [type, currData, setCurrData]);

  return (
    <DataSubEntry heading={"Resource Data"} >
      <Grid size={{ xs: 3 }} >
        <CheckInput
          name="link"
          label="External media"
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      { currData?.link && (
        <Grid size={{ xs: 9 }} >
          <InputText
            name="url"
            label="URL"
            value={currData?.url}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
      )}
      {!currData?.link && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">
            Upload file
          </Typography>
          <UploadForm currData={currData} setCurrData={setCurrData} />
        </Grid>
      )}
    </DataSubEntry>
  );
};