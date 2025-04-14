import React, { useEffect, useState } from 'react';
import { useStore } from 'services/store';
import { formatISO, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useKeycloak } from '@react-keycloak/web';
import setupAxiosInterceptors from 'services/setTokenHeader'
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import UpdateIcon from '@mui/icons-material/Update';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import SegmentTable from 'components/input/survey/SegmentTable';
import { makeRequest } from 'services/query';
import useCrudActions from '@/hooks/useCrudActions';
import CrudButtons from 'components/buttons/CrudButtons';
import { 
  DirectionButtons,
  AddFind,
  OpenTable,
  AddNew,
 } from 'components/buttons/Buttons';
import { 
  handleInputChange, 
  handleDateChange, 
  handleAutocompleteChange, 
} from 'helpers/buttonActions';
import TableDrawer from 'components/layout/TableDrawer';
import { surveyColDefs } from 'helpers/tableRenders';

const SurveyLine = () => {
  console.log("Render SurveyLine")
  const { keycloak, initialized } = useKeycloak();  
  const currLine = useStore(state => state.currLine);
  const setCurrLine = useStore(state => state.setCurrLine);
  const currSegments = useStore(state => state.currSegments);
  const setCurrSegments = useStore(state => state.setCurrSegments);  
  const tracts = useStore(state => state.tract);
  const walkers = useStore(state => state.walker);
  const lines = useStore(state => state.lines);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);
  const buttonAction = useStore(state => state.buttonAction);


  // Updates the axios interceptors whenever the token changes
  useEffect(() => {
    if (keycloak.token) {
      // When axios makes API calls the token will be sent automatically
      setupAxiosInterceptors(keycloak.token);
      console.log("Authentication bearer set.")

    }
  }, [keycloak.token]);

  // Check token validity and refresh if necessary before making a request
  if (keycloak.authenticated ) {
    try {
      keycloak.updateToken(180);
      console.log("Token refreshed!")
    } catch (error) {
      console.error('Failed to refresh token', error);
      throw error;
    }
  } else {
    console.log(keycloak)
  }

  const [lineForDb, setLineForDb] = useState(null);
  const { uuid } = currLine || {};

  const addSegment = () => {
    const id = currSegments?.length + 1;
    setCurrSegments([
      ...currSegments,
      { uuid: uuidv4(),
        segment_no: id, 
        count_pottery: 0, 
        count_obsidian: 0, 
        count_pottery_bags: 0, 
        count_other_bags: 0, 
        notwalked: false
      }
    ]);
  };

  //Get Segments
  useEffect(() => {
    const segmentQuery = async () => { 
      const getData = await makeRequest('get', `view_segment?line_uuid=eq.${currLine.uuid}`, {}, {});
      setCurrSegments(getData);
      console.log(getData);
    }
    if (currLine?.uuid) {
      segmentQuery();
    }
  }, [uuid]);

  //Preparing object for writing to database
  useEffect(() => {
    if (currLine) {
      const { geom, geometry, tract, walker, updated_by, ...lineData } = currLine;
      setLineForDb(lineData);
    }
  }, [currLine]);
  
  useCrudActions({
    setSelectedRowData: setCurrLine,
    selectedRowData: lineForDb,
    viewTable: 'view_line',  
    editTable: 'edit_line'
  });

  const saveSegments = async () => {
    console.log('Save segments');
    try {
      const updateData = currSegments.map(({ geometry, line, updated_by, ...segment }) => ({
        ...segment,
        line_uuid: currLine.uuid,
        updated_at: formatISO(new Date()),
        updated_by_uuid: activeActor?.uuid || null  
      }));
      const updatedRow = await makeRequest(
        'POST', 
        `edit_segment`,
        updateData, 
        "Prefer: resolution=merge-duplicates"
      );
      console.log('Segments updated: ', updatedRow);
      setSnackbarData ({
        "actionType": "save",
        "messageType": "success",
        "messageText": "Segments saved."
      });
    } catch (error) {
      console.log('Error saving segments: ', error);
      setSnackbarData ({
        "actionType": "save",
        "messageType": "error",
        "messageText": "Save failed: \n\n" + error.message + " \n " + error.response.data.message
      });
    }
    setSnackbarOpen(true)
  };
    
  useEffect(() => {
    if (buttonAction.save) {
      saveSegments();
    }
  }, [buttonAction]);

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type,
  ]

  if(!currLine){
    return (
      <>
        <TableDrawer 
          columns={listColumns}
          listTable={'list_line'}
          apiTable={'view_line'}
          setCurrData={setCurrLine}
        />
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
            <AddNew />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
            <OpenTable /> 
          </Grid>
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No line selected. Add new or browse through existing.
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
        listTable={'list_line'}
        apiTable={'view_line'}
        setCurrData={setCurrLine}
      />
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
          <AddNew />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} order={{ xs: 3, sm: 2 }}>
          <OpenTable />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
          <Typography gutterBottom variant="body" component="p">
            {currLine?.line_no &&`Line ${currLine?.line_no}, ${currLine?.tract} `}
              Record N of Y.
              {currLine?.uuid ? ` Created ${currLine?.created_at}.` : ' Not yet recorded'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 5, sm: 4 }}>
          <Autocomplete
            style={{ flex: 1 }}
            disablePortal
            id="tract"
            options={tracts}
            getOptionLabel={(option) => `T${option.name}`}
            isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
            value={currLine ? tracts.find(option => option.uuid === currLine.tract_uuid) || null : null}
            onChange={(event, newValue) => {
              // Adapt newValue to have a 'value' key
              const adaptedNewValue = newValue ? { ...newValue, value: newValue.uuid } : null;
              handleAutocompleteChange(event, adaptedNewValue, 'tract_uuid', currLine, setCurrLine);
            }}
            renderInput={(params) => <TextField {...params} label="Tract" />}
            renderOption={(props, option) => (
              <li {...props} key={option.uuid}>
                {`T${option.name}`}
              </li>
            )}
          />
          <Autocomplete
            disablePortal
            id="line"
            options={lines}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label}
            value={lines.find(line => line.value === currLine?.line_no) || null} // Convert the integer line_no to an object
            onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'line_no', currLine, setCurrLine)}
            renderInput={(params) => <TextField {...params} label="Line" />}
          />
        </Grid>
        <Grid 
          size={{ xs: 12, sm: 3 }} 
          order={{ xs: 6, sm: 4 }}
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={1}
            sx={{ 
              display: 'flex',
              justifyContent: 'center', 
              alignItems: 'center',
              width: 'fit-content',
              height: 'fit-content'
            }}
          >
            <DirectionButtons 
              currData={currLine} 
              setCurrData={setCurrLine} 
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <Card >
            <CardActionArea>
              <CardContent onClick={() => addSegment()}>
                <AddRoadIcon sx={{ fontSize: 60 }} />
                <Typography gutterBottom variant="h5" component="p">
                  Add Segment
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddFind />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 6 }}>
          <Autocomplete
            style={{ flex: 1 }}
            disablePortal
            id="walker"
            options={walkers}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={currLine ? walkers.find(option => option.value === currLine.walker_uuid) || null : null}
            onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'walker_uuid', currLine, setCurrLine)}
            renderInput={(params) => <TextField {...params} label="Recorder" />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 6 }}>
          <TimePicker
            label="Start Time"
            value={currLine?.start_time ? parseISO(currLine?.start_time): null}
            onChange={(date) => handleDateChange(date, 'start_time', currLine, setCurrLine)}
            slots={{
              textField: params => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {  handleDateChange(new Date(), 'start_time', currLine, setCurrLine) }} edge="end">
                          <UpdateIcon sx={{fontSize: 50}}/>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 6 }}>
          <TimePicker
            label="End Time"
            value={currLine?.end_time ? parseISO(currLine?.end_time): null}
            onChange={(date) => handleDateChange(date, 'end_time', currLine, setCurrLine)}
            slots={{
              textField: params => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {  handleDateChange(new Date(), 'end_time', currLine, setCurrLine) }} edge="end">
                          <UpdateIcon sx={{fontSize: 50}}/>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }} order={{ xs: 6 }}>
          <DatePicker
            label="Date"
            value={currLine?.walked_date ? parseISO(currLine?.walked_date): new Date()}
            onChange={(date) => handleDateChange(date, 'walked_date', currLine, setCurrLine)}
            slots={{
              textField: params => <TextField {...params} />
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <Paper elevation={1}>
            <SegmentTable 
              rows={currSegments}
              setRows={setCurrSegments}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <TextField
            label="Notes"
            variant="outlined"
            id="line_notes"
            name="notes"
            multiline
            fullWidth
            rows={4}
            value={currLine?.notes || ''} // controlled input value
            onChange={(data) => handleInputChange(data, currLine, setCurrLine)} // input change handler
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
        </Grid>
      </Grid>
      <CrudButtons />
    </>
  );
};

export default SurveyLine;
