import React, { useEffect, useState } from 'react';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { parseISO } from 'date-fns';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DatePicker } from '@mui/x-date-pickers';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import RecordedPositionMap from 'components/visualisations/PositionMap';
import useCrudActions from '@/hooks/useCrudActions';
import CrudButtons from 'components/buttons/CrudButtons';
import { 
  GetLocation,
  OpenTable,
  AddPhoto 
} from 'components/buttons/Buttons';
import SurveyPotFind from 'components/sheets/survey/SurveyPotFind';
import { 
  handleInputChange, 
  handleDateChange,
  handleCheckChange,
  handleAutocompleteChange, 
} from 'helpers/buttonActions';
import TableDrawer from 'components/layout/TableDrawer';
import { surveyColDefs } from 'helpers/tableRenders';

const SurveyFind = ({parent}) => {
  console.log("Render SurveyFind")
  const currData = useStore(state => state.currFind);
  const setCurrData = useStore(state => state.setCurrFind);   
  const walkers = useStore(state => state.walker);
  const collType = useStore(state => state.collType);
  const [dataForDb, setDataForDb] = useState(null);
  const [newData, setNewData] = useState({});
  const activeActor = useStore(state => state.activeActor);  

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
      const { geometry, geom, collection_type, recorded_by, updated_by, ...tempData } = currData;
      setDataForDb({...tempData, "geom": geoJsonForDb});
    }
  }, [currData]); // This effect runs whenever `currData` changes


  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: 'view_find',
    editTable: 'edit_find'
  });

  // Custom hook that returns the appropriate store state
  const useParentData = () => {
    let selector = {};
    // Define a map of selectors for each 'parent' value
    const selectorMap = {
      grid: (state) => state.currGrid,
      feature: (state) => state.currFeat,
      line: (state) => state.currLine
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
    if (Array.isArray(collType)) {
      const parentObject = collType.find(item => item.label === parent);
      console.log("parentObject:")
      console.log(parentObject)
      const parentTypeUuid = parentObject?.value || null;
      setNewData({ ...newData, 'recorded_by_uuid': activeActor?.uuid, 'collected_from': parentData?.uuid, 'collection_type_uuid': parentTypeUuid })
    }
  }, [parentData, activeActor]);

  useEffect(() => {
    console.log(newData);
  }, [newData]);

  const handleAdd = async () => {

    const updateData = await makeRequest('post', `edit_find`, newData, 'Prefer: return=representation');
    const getData = await makeRequest('get', `view_find?uuid=eq.${updateData[0].uuid}`, {}, {});
    setCurrData(getData[0]);
    console.log(getData);
  };  

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type,
  ]  

  if(!currData?.uuid){
    return (
      <>
        <TableDrawer 
          columns={listColumns}
          listTable={'list_find'}
          apiTable={'view_find'}
          setCurrData={setCurrData}
        />      
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
            <OpenTable /> 
          </Grid>
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No find selected. Add new or browse through existing.
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <TableDrawer
        columns={listColumns}
        listTable={'list_find'}
        apiTable={'view_find'}
        setCurrData={setCurrData}
      />
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 12 }} order={{ xs: 1 }}>
          <Typography gutterBottom variant="body" component="p">
            {currData?.find_id &&`Find ${currData?.find_id} of type ${currData?.collection_type} from ${currData?.collected_from}`}
              Record N of Y.
              {currData?.uuid ? ` Created ${currData?.created_at}.` : ' Not yet recorded'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2, lg: 2 }} order={{ xs: 2, sm: 2 }}>
          <TextField
            label="Find ID"
            variant="outlined"
            id="find_id"
            name="find_id"
            fullWidth
            value={currData?.find_id || null}
            onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
          />
          <Autocomplete
            style={{ flex: 1 }}
            disablePortal
            id="recorded_by"
            options={walkers}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}              
            value={currData ? walkers.find(option => option.value === currData.recorded_by_uuid) || null : null}
            onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'recorded_by_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Recorder" />}
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 2, md: 2, lg: 4 }} order={{ xs: 3, sm: 2 }}>
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
        <Grid size={{ xs: 6, sm: 2, md: 2, lg: 2 }} order={{xs: 4, sm: 3 }}>
          <AddPhoto />
        </Grid>
        <Grid size={{ xs: 6, sm: 2, md: 2, lg: 2 }} order={{xs: 4, sm: 3 }}>
          <GetLocation 
            currData={currData}
            setCurrData={setCurrData}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 3, sm: 4 }}>
          <RecordedPositionMap position={currData?.geom} />
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }} order={{ xs: 5 }}>
          <FormControl>
            <FormLabel id="type-group-label">Type</FormLabel>
            <RadioGroup
              row
              aria-labelledby="type-group-label"
              name="type"
              value={currData?.find_type} // here is where you set the selectedValue which controls the selected radio button
              onChange={(type) => handleCheckChange(type, 'find_type', currData, setCurrData)}
            >
              <FormControlLabel value="Pottery" control={
                <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
            } label="Pottery" />
              <FormControlLabel value="Lithic" control={
                <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
              } label="Lithic" />
              <FormControlLabel value="Architecture" control={
                <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
              } label="Architecture" />
              <FormControlLabel value="Stone" control={
                <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
              } label="Stone" />
              <FormControlLabel value="PoI" control={
                <Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 40, }, }} />
              } label="PoI" />
            </RadioGroup>
          </FormControl>
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
          <TextField
            label="Note"
            variant="outlined"
            id="find_note"
            name="note"
            multiline
            fullWidth
            rows={4}
            value={currData?.note  || ''}
            onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
        </Grid>
      </Grid>
      <CrudButtons />
    </>
  );
};

export default SurveyFind;

//          <SurveyPotFind
//            currData={currData}
//            setCurrData={setCurrData}
//          />