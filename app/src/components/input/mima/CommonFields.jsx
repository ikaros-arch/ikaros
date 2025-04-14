import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Rating from '@mui/material/Rating';
import { useStore } from 'services/store';
import {
  InputText,
  InputTextMulti,
  MultiSelect,
  SingleSelect,
  MultiFree,
  CheckInput
} from 'components/input/InputFields';
import {
  handleInputChange,
} from 'helpers/buttonActions';
import { TextEditor } from 'components/input/MarkDownEditor'
import { DataSubEntry } from 'components/layout/Sheets';

export const IdFields = ({ currData, setCurrData }) => {
  console.log("Render IdFields")

  return (
    <Grid container spacing={1} padding={1} size={{ xs:12 }}> 
      <Grid size={{ xs: 4, sm: 3, md: 3 }}>
        <InputText
          name="entry_id"
          label="Id"
          value={currData?.entry_id}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 8, sm: 9, md: 9 }}>
        <InputText
          name="entry_name"
          label="Name"
          value={currData?.entry_name}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </Grid>
  );
};

export const InventoryFields = ({ currData, setCurrData }) => {
  console.log("Render CommonFields")
  const userRole = useStore(state => state.userRole);
  
  return (
    <DataSubEntry heading={"Inventory and Publication"} >
      <Grid size={{ xs: 12 }}>
        <InputTextMulti
          name="inventory"
          label="Inventory"
          value={currData?.inventory}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={2}
        />  
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputTextMulti
          name="publications"
          label="Publication"
          value={currData?.publications}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={2}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const DatingFields = ({ currData, setCurrData }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startEra, setStartEra] = useState("AD");
  const [endEra, setEndEra] = useState("AD");
  const [inputChange, setInputChange] = useState(false);

  // Helper function to remove era from the date string
  const formatDateString = (dateString) => {
    // Remove ' BC' if present
    let formatted = dateString.replace(/\s*BC$/, '');
    // Then, replace leading zeros in the year part of the date string.
    formatted = formatted.replace(/^0+/, '');
    return formatted;
  };

    // Parse the initial date range
  useEffect(() => {
    if(currData?.dating) {
      const initialDateRange = currData.dating;
      const matches = initialDateRange.match(/\[(?:"?)(.*?)(?:"?)\s*,\s*(?:"?)(.*?)(?:"?)\)/);
      if (matches && matches.length === 3) {
        const start = matches[1];
        const end = matches[2];
        setStartDate(formatDateString(start));
        setEndDate(formatDateString(end));
        setStartEra(start.includes('BC') ? 'BC' : 'AD');
        setEndEra(end.includes('BC') ? 'BC' : 'AD');
      } 
    } else {
      setStartDate('');
      setEndDate('');
      setStartEra('AD');
      setEndEra('AD');
    }

  }, [currData]);

  // Update and format the date range state
  const formatAndSetDateRange = () => {
      console.log('Formatting date range');
      console.log(startEra);

    const formattedStartDate = `${startDate}${startEra === 'AD' ? '' : ' BC'}`;
    const formattedEndDate = `${endDate}${endEra === 'AD' ? '' : ' BC'}`;
    const formattedDateRange = `["${formattedStartDate}", "${formattedEndDate}")`;
    updateCurrData(formattedDateRange);
  };

  useEffect(() => {
    if(inputChange){
      formatAndSetDateRange();
      setInputChange(false);
    }
  }, [startDate, endDate, startEra, endEra]); 

  // Handle changes in date fields
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setInputChange(true);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setInputChange(true);    
  };

  // Handle era changes
  const handleStartEraChange = (event, newStartEra) => {
    if (newStartEra !== null) {
      setStartEra(newStartEra);
      setInputChange(true);
    }
  };

  const handleEndEraChange = (event, newEndEra) => {
    if (newEndEra !== null) {
      setEndEra(newEndEra);
      setInputChange(true);
    }
  };

  const updateCurrData = (formattedDateRange) => {
    if (formattedDateRange !== currData.dating) {
      let updatedData = { ...currData, dating: formattedDateRange === '' ? null : formattedDateRange };
      setCurrData(updatedData);
    }
  };


  return (
    <DataSubEntry heading={"Dating"} >
      <Grid size={{ xs: 6, sm: 6, md: 8, xl: 4 }}>
        <InputText
          name="startDate"
          label="Terminus Post Quem (YYYY-MM-DD)"
          value={startDate}
          onBlur={handleStartDateChange}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 4, xl: 2 }}>
        <ToggleButtonGroup
          value={startEra}
          exclusive
          onChange={handleStartEraChange}
        >
          <ToggleButton value="AD">CE</ToggleButton>
          <ToggleButton value="BC">BCE</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 8, xl: 4 }}>
        <InputText
          name="endDate"
          label="Terminus Ante Quem (YYYY-MM-DD)"
          value={endDate}
          onBlur={handleEndDateChange}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 4, xl: 2 }}>
        <ToggleButtonGroup
          value={endEra}
          exclusive
          onChange={handleEndEraChange}
        >
          <ToggleButton value="AD">CE</ToggleButton>
          <ToggleButton value="BC">BCE</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="dating_notes"
          label="Basis for dating"
          value={currData?.dating_notes}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={2}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const PlaceFields = ({ currData, setCurrData }) => {
  const places = useStore(state => state.places);
  const navigate = useNavigate();

  return (
      <DataSubEntry heading={"Location"}>
        <Grid size={{ xs: 8, sm: 3, md: 8, xl: 6 }}>
          <SingleSelect
            name="place"
            label="Place"
            currData={currData}
            setCurrData={setCurrData}
            options={places}
            optionLabel="name"
            optionValue="uuid"
            endAdornment={(
              <InputAdornment position="end">
                <IconButton
                  aria-label="Open"
                  onClick={() => currData?.place && navigate(`../Vocabulary/Place/${currData.place}`)}
                  edge="end"
                >
                  <LaunchIcon />
                </IconButton>
              </InputAdornment>
            )}
          />
        </Grid> 
        <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }} >
          <InputText
            name="place_source"
            label="Place source"
            value={currData?.place_source}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
        <Grid size={{ xs: 12 }} >
          <InputTextMulti
            name="place_comment"
            label="Place comment"
            value={currData?.place_comment}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            rows={3}
          /> 
        </Grid>
      </DataSubEntry>
  );
};

export const ViewLocFields = ({ currData }) => {
  console.log("Render ViewLocFields")
  console.log(currData);
  return (
      <DataSubEntry heading={"Location Metadata"}>
        <Grid size={{ xs:12 }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Name:</strong> {currData?.name || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Modern Name:</strong> {currData?.name_modern || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Authorities:</strong>
            </Typography>
            {currData?.authorities ? (
              Object.entries(currData.authorities).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {value['dc:title'] || 'N/A'} - <a href={value['dc:identifier']} target="_blank" rel="noopener noreferrer">{value['dc:identifier']}</a>
                </Typography>
              ))
            ) : (
              <Typography variant="body2">
                No Linked Data sources set.
              </Typography>
            )}
          </Stack>
        </Grid> 
      </DataSubEntry>
  );
};

export const PrisonFields = ({ currData, setCurrData }) => {
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Prison Data"} >
      <Grid size={{ xs: 12, sm: 6, md: 6, xl: 4 }} >
        <InputText
          name="incarceration_length"
          label="Length of incarceration"
          value={currData?.incarceration_length}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, xl: 8 }} >
        <InputText
          name="carceral_language"
          label="Carceral language"
          value={currData?.carceral_language}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, xl: 8 }} >
        <InputText
          name="prison_name"
          label="Named carceral facility"
          value={currData?.prison_name}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 4 }} >
        <SingleSelect
          name="prison_type"
          label="Type of carceral facility"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.prison_type}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
    </DataSubEntry>
  );
};

export const AMIFields = ({ currData, setCurrData }) => {
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"AMI Metadata"} >
      <Grid size={{ xs: 12, sm: 6, xl: 8 }} >
        <MultiSelect
          name="tag"
          label="Tags"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.tag}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, xl: 4 }} >
        <MultiFree
          name="book_appearance"
          label="Appearance in AMI"
          currData={currData}
          setCurrData={setCurrData}
          toolTip={"Page numbers, chapters  or sections reffering to appearance in Ancient Mediterranean Incarceration."}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const BookFields = ({ currData, setCurrData }) => {
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Book Fields"} >
      <Grid size={{ xs: 12, sm: 6, xl: 3 }} >
          <Typography component="legend">Inclusion Candidate</Typography>
          <Rating
            id="inclusion_candidate"
            name="inclusion_candidate"
            value={currData?.inclusion_candidate}
            onChange={(data) => handleInputChange(data, currData, setCurrData)}
            precision={1}
            max={5}
          />
          <Typography component="span">  {currData?.inclusion_candidate}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, xl: 9 }} >
        <MultiSelect
          name="index_topic"
          label="Index topics"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.index_topic}
          optionLabel="term_name" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, xl: 6 }} >
        <MultiSelect
          name="keyword"
          label="Keywords"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.keyword}
          optionLabel="term_name"
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, xl: 6 }} >
        <MultiFree
          name="book_appearance"
          label="Book Appearance"
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, xl: 6 }} >
      <InputText
          name="book_appearance"
          label="Appearance in AMI"
          value={currData?.book_appearance}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip={"Page numbers reffering to appearance in Ancient Mediterranean Incarceration."}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputText
          name="note_inclusion"
          label="Inclusion note"
          value={currData?.note_inclusion}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      <Grid size={{ xs: 3 }} >
        <CheckInput
          name="book_picture"
          label="Include Picture"
          currData={currData}
          setCurrData={setCurrData}
        /> 
      </Grid>
      { currData?.book_picture &&
      <>
        <Grid size={{ xs: 9 }} >
          <InputText
            name="book_picture_details"
            label="Picture details"
            value={currData?.book_picture_details}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, xl: 12 }} >
          <InputText
            label="Caption"
            name="vis_caption"
            value={currData?.vis_caption}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          />
        </Grid>
      </>
      }
    </DataSubEntry>
  );
};

export const TranslationFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Translation"} >
      <Grid container spacing={1} padding={1} size={{ xs:12, xl:12 }}>
        <TextEditor 
          id='translation'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, xl: 12 }} >
        <InputText
          name="translation_source"
          label="Translation Source"
          value={currData?.translation_source}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </DataSubEntry>
  );
};
export const OriginalTextFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Original Language Text"} >
      <Grid container spacing={1} padding={1} size={{ xs:12, xl:12 }}>
        <TextEditor 
          id='original_text'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, xl: 12 }} >
        <InputText
          name="original_text_source"
          label="Original Language Source"
          value={currData?.original_text_source}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const CommentaryFields = ({ currData, setCurrData }) => {
  const userRole = useStore(state => state.userRole);

  return (
    <DataSubEntry heading={"Prison Project Database Commentary"} >
      <Grid container spacing={1} padding={1} size={{ xs:12, xl:12 }}>
        <TextEditor 
          id='ami_comment'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="note_commentary"
          label="Commentary note"
          rows={2}
          value={currData?.note_commentary}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
        />
      </Grid>
      {(userRole === 'admin' || userRole === 'read_write') && 
      <>
        <Grid container spacing={1} size={{ xs:12, xl:12 }}>
          <Typography variant="subtitle1" >
            Other scholarly commentary
          </Typography> 
          <TextEditor 
            id='commentary'
            currData={currData}
            setCurrData={setCurrData}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <InputTextMulti
            name="note_general"
            label="Note"
            value={currData?.note_general}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            rows={4}
          />
        </Grid>
      </>
      }
    </DataSubEntry>
  );
};
