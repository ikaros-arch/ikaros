import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
import { parseISO } from 'date-fns';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Paper from "@mui/material/Paper";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HideImageIcon from '@mui/icons-material/HideImage';
import Autocomplete from '@mui/material/Autocomplete';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import RecordedPositionMap from 'components/visualisations/PositionMap';
import useCrudActions from '@/hooks/useCrudActions';
import { 
  GetLocation,
  OpenTable 
} from 'components/buttons/Buttons';
import { 
  handleInputChange, 
  handleDateChange,
  handleAutocompleteChange, 
} from 'helpers/buttonActions';
import TableDrawer from 'components/layout/TableDrawer';
import { surveyColDefs } from 'helpers/tableRenders';

const SurveyPhoto = ({parent}) => {
  console.log("Render SurveyPhoto")
  const currData = useStore(state => state.currPhoto);
  const setCurrData = useStore(state => state.setCurrPhoto);   
  const walkers = useStore(state => state.walker);
  const [dataForDb, setDataForDb] = useState(null);
  const [newData, setNewData] = useState({});
  const activeActor = useStore(state => state.activeActor);  
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);  
  const domain = useStore(state => state.env.domainName);

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setCurrData({ 
        ...currData,
        'filename': selectedFile.name, 
        'captured_at': new Date().toISOString() 
      })
      setFile(selectedFile);
      // Create a URL for the captured/selected file to show it in an img element
      setPreviewUrl(URL.createObjectURL(event.target.files[0]));      
    }
  };

  const handleClickFileInput = () => {
    // Trigger the file input click action
    fileInputRef.current.click();
  };

  const handleFormSubmit = async () => {

    if (file) {
      const formData = new FormData();
      formData.append('uuid', currData?.uuid);
      formData.append('file', file);

      try {
        const response = await axios.post(`https://${domain}/upload/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data);
        setFile(null); // Reset the file state after upload
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };


  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      let geoJsonForDb
      if (currData?.geom?.geometry){
        geoJsonForDb = currData.geom.geometry
      } else if (currData?.geom){
        geoJsonForDb = currData.geom
      } else (
        geoJsonForDb = null
      )
      geoJsonForDb = currData?.geom?.geometry
      const { geometry, geom, creator, updated_by, ...tempData } = currData;
      setDataForDb({...tempData, "geom": geoJsonForDb});
    }
  }, [currData]); // This effect runs whenever `currData` changes

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: 'view_photo',  
    editTable: 'edit_media'
  });

  const updateButtonAction = (actionName, value) => {
    const updatedAction = { ...buttonAction, [actionName]: value };
    setButtonAction(updatedAction);
  };

  // Custom hook that returns the appropriate store state
  const useParentData = () => {
    let selector = {};
    // Define a map of selectors for each 'parent' value
    const selectorMap = {
      grid: (state) => state.currGrid,
      feature: (state) => state.currFeat,
      line: (state) => state.currLine,
      find: (state) => state.currFind,
      scape: (state) => state.currScape,
      tract: (state) => state.currTract
    };
    try {
      // Get the correct selector based on the 'parent' prop
      selector = selectorMap[parent];
      if (!selector) {
        // You could return a sensible default or throw an error if 'parent' is not expected
        throw new Error(`Unknown parent: ${parent}, defaulting to 'line'.`);
      }
    // Use the selected state slice from the Zustand store      
      
    } catch  (error) {
      console.error(error)
      selector = selectorMap['line'];
    }
    return useStore(selector);
  };

  // Invoke the custom hook to get the data for the current 'parent'
  const parentData = useParentData();


// Set actor_uuid
  useEffect(() => {
    setCurrData({ ...currData,'updated_by_uuid': activeActor?.uuid })
  }, [activeActor]);

// Set parent data
  useEffect(() => {
    setNewData({ 
      ...newData, 
      'creator_uuid': activeActor?.uuid, 
      'updated_by_uuid': activeActor?.uuid,
      'media_type': 'photo', 
      'parent': parentData?.uuid, 
      'parent_type': parent 
    })
  }, [parentData, activeActor]);

  useEffect(() => {
    console.log(newData);
  }, [newData]); 

  useEffect(() => {
    console.log("New Curr Data set!")
    console.log(currData);
  }, [currData]); 

  const handleAdd = async () => {

    const updateData = await makeRequest('post', `edit_media`, newData, 'Prefer: return=representation');
    const getData = await makeRequest('get', `view_photo?uuid=eq.${updateData[0].uuid}`, {}, {});
    setCurrData(getData[0]);
    console.log(newData);
  };  

  const handleAction = async (action) => {
    if (action === 'saveAndAdd'){
      await handleFormSubmit()
      await updateButtonAction("save", true)
      handleAdd();


    } else if (action === 'saveAndBack'){
      await handleFormSubmit();
      await updateButtonAction("save", true)
      handlePress(`/surv_${parent}`)

    } else if (action === 'revertAndBack'){
      handlePress(`/surv_${parent}`)

    }
  }; 

  const handlePress = (target) => {
    navigate(target);
  };

  if(!currData?.uuid && parent){
    handleAdd()
  }

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type, 
  ]


  if(!currData?.uuid && !parent){
    return (
      <>
        <TableDrawer 
          columns={listColumns}        
          listTable={'list_photo'}
          apiTable={'view_photo'}
          setCurrData={setCurrData}
        />      
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 12 }} order={{ xs: 3, sm: 2 }}>
            <Card >
              <CardActionArea>
                <CardContent onClick={() => handleAdd()}>
                  <AddIcon sx={{ fontSize: 60 }} />
                  <Typography gutterBottom variant="h5" component="p">
                    Add New
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>  
          </Grid>     
          <Grid size={{ xs: 12 }} order={{ xs: 3, sm: 2 }}>
            <OpenTable /> 
          </Grid>
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No photo selected. Add new or browse through existing.
            </Typography>        
          </Grid>
        </Grid>
      </>
    )    
  }

  return (
    <>
      <TableDrawer 
        columns={listColumns}      
        listTable={'list_photo'}
        apiTable={'view_photo'}
        setCurrData={setCurrData}
      />       
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 12 }} order={{ xs: 1 }}>
          <Typography gutterBottom variant="body" component="p">
            {currData?.media_id &&`Photo ${currData?.media_id} of type ${currData?.parent_type} from ${currData?.parent}`}
              Record N of Y.
              {currData?.uuid ? ` Created ${currData?.created_at}.` : ' Not yet recorded'}
          </Typography>        
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 2, sm: 2 }}>             
          <TextField
            label="Photo ID"
            variant="outlined"
            id="photo_id"
            name="media_id"
            fullWidth              
            value={currData?.media_id || null}
            onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
          />           
          <Autocomplete
            style={{ flex: 1 }}
            disablePortal
            id="creator"
            options={walkers}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}              
            value={currData ? walkers.find(option => option.value === currData.creator_uuid) || null : null}
            onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'creator_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Photographer" />}
          />
        </Grid>          
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 3 }}>
          <Card >
            <CardActionArea>
              <CardContent 
                onClick={() => handleClickFileInput()} >
                <AddPhotoAlternateIcon sx={{ fontSize: 60 }} />
                <Typography gutterBottom variant="h5" component="p">
                  Capture
                </Typography>                  
              </CardContent>
            </CardActionArea>
          </Card>          </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 3 }}>
          <GetLocation 
            currData={currData}
            setCurrData={setCurrData}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 3, sm: 4 }}>
          <RecordedPositionMap position={currData?.geom} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 6 }}>
          <DatePicker
            label="Date Collected"
            value={currData?.date_collected ? parseISO(currData?.date_collected): new Date()}
            onChange={(date) => handleDateChange(date, 'date_collected', currData, setCurrData)}
            slots={{
              textField: params => <TextField {...params} />
            }}
          />
        </Grid>            
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>  
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*; capture=camera"
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the input element
      />   
        </Grid>            
        <Grid size={{ xs: 9 }} order={{ xs: 6 }}>              
          <TextField
            label="Photo Description"
            variant="outlined"
            id="photo_descr"
            name="description"
            multiline
            fullWidth              
            rows={4}
            value={currData?.description || ''}
            onChange={(data) => handleInputChange(data, currData, setCurrData)}
          />       
        </Grid>
        <Grid size={{ xs: 3 }} order={{xs: 6 }}>
          {previewUrl && (
          <Paper 
            elevation={1}
            sx={{ 
              display: 'flex',
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <img 
              src={previewUrl} 
              alt="preview" 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                objectFit: 'cover'
              }} 
            />
          </Paper>
          )}
        </Grid>        
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>        
          <TextField
            label="Filename"
            variant="outlined"
            id="photoFilename"
            name="filename"
            fullWidth              
            value={currData?.filename || ''}
            onChange={(data) => handleInputChange(data, currData, setCurrData)}
          />       
        </Grid>                             
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>    
        </Grid>     
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 7 }}>
          <Card >
            <CardActionArea>
              <CardContent 
                onClick={() => handleAction('saveAndAdd')} >
                <AddPhotoAlternateIcon sx={{ fontSize: 60 }} />
                <Typography gutterBottom variant="h5" component="p">
                  Upload and Add another
                </Typography>                  
              </CardContent>
            </CardActionArea>
          </Card>        
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 8, sm: 7 }}>
          <Card >
            <CardActionArea>
              <CardContent onClick={() => handleAction('saveAndBack')}>
                <NavigateBeforeIcon sx={{ fontSize: 60 }} />
                <Typography gutterBottom variant="h5" component="p">
                  Upload and Go Back
                </Typography>                 
              </CardContent>
            </CardActionArea>
          </Card> 
        </Grid>   
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 8, sm: 7 }}>
          <OpenTable /> 
        </Grid>                 
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 7, sm: 8 }}>
          <Card >
            <CardActionArea>
              <CardContent onClick={() => handleAction('revertAndBack')}>
                <HideImageIcon sx={{ fontSize: 60 }} />
                <Typography gutterBottom variant="h5" component="p">
                  Cancel and Go Back
                </Typography>                 
              </CardContent>
            </CardActionArea>
          </Card>  
        </Grid>      
      </Grid>
    </>
  );
};

export default SurveyPhoto;