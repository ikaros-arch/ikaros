import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { parseISO } from 'date-fns';
import UpdateIcon from '@mui/icons-material/Update';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { 
  AddGrid,
  AddGeometry,
  AddFeature,
  OpenTable,
  AddNew,
  AddPhoto,
  GoNext,
  GoPrev
 } from 'components/buttons/Buttons';
import { 
  handleInputChange, 
  handleDateChange, 
  handleAutocompleteChange, 
  handleMultiAutocompleteChange 
} from 'helpers/buttonActions';
import CrudButtons from 'components/buttons/CrudButtons';
import TableDrawer from 'components/layout/TableDrawer';
import { surveyColDefs } from 'helpers/tableRenders';

const SurveySample = () => {
  console.log("Render SurveySample")
  const currData = useStore(state => state.currSample);
  const setCurrData = useStore(state => state.setCurrSample);
  const samples = useStore(state => state.sample);  
  const walkers = useStore(state => state.walker);
  const [sampleForDb, setSampleForDb] = useState(null);

  console.log(currData);
  // Function to find the index of the current sample
  const findDataIndex = (uuid) => samples.findIndex(item => item.uuid === uuid);
  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { area, geom, geometry, teamleader, walkers, updated_by, ...sampleData } = currData;
      setSampleForDb(sampleData);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: sampleForDb,
    viewTable: 'view_sample',
    editTable: 'edit_sample'
  });

  // Function to get the human-friendly number (1-based) of the current sample in the list:
  const getCurrDataNumber = () => {
    const currentIndex = findDataIndex(currData);
    return currentIndex >= 0 ? currentIndex + 1 : 'Not Found';
  };

  // The current sample number for display:
  const currDataNumber = getCurrDataNumber();

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type,
  ]

  if(!currData){
    return (
      <>
        <TableDrawer 
          columns={listColumns}
          listTable={'list_sample'}
          apiTable={'view_sample'}
          setCurrData={setCurrData}
        />
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 1 }}>
            <GoPrev
              currData={currData} 
              setCurrData={setCurrData}
              list={samples}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 3, sm: 2 }}>
            <AddNew />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 3, sm: 2 }}>
            <OpenTable /> 
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 2, sm: 3 }}>
            <GoNext
              currData={currData} 
              setCurrData={setCurrData}
              list={samples}
            />   
          </Grid>
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No sample selected. Add new or browse through existing.
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
        listTable={'list_sample'}
        apiTable={'view_sample'}
        setCurrData={setCurrData}
      />
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 1 }}>
          <GoPrev
              currData={currData} 
              setCurrData={setCurrData}
              list={samples}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 3, sm: 2 }}>
          <AddNew />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 4 }} order={{ xs: 3, sm: 2 }}>
          <OpenTable />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 2, sm: 3 }}>
          <GoNext
              currData={currData}
              setCurrData={setCurrData}
              list={samples}
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
          <Typography gutterBottom variant="body" component="p">
            {currData?.name &&`Sample ${currData?.name}. `}
              Record {currDataNumber} of {samples?.length}.
              {currData?.status ? ` Created ${currData?.created_at}.` : ' Not yet recorded'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddPhoto />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddGeometry />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddFeature />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddGrid />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 5, sm: 6 }}>
          <DatePicker
            label="Date"
            value={currData?.recorded_date ? parseISO(currData?.recorded_date): new Date()}
            onChange={(date) => handleDateChange(date, 'recorded_date', currData, setCurrData)}
            slots={{
              textField: params => <TextField {...params} />}}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 6 }}>
          <TimePicker
            label="Start Time"
            value={currData?.start_time ? parseISO(currData?.start_time): null}
            onChange={(date) => handleDateChange(date, 'start_time', currData, setCurrData)}
            slots={{
              textField: params => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {  handleDateChange(new Date(), 'start_time', currData, setCurrData) }} edge="end">
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
        <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 6 }}>
          <TimePicker
            label="End Time"
            value={currData?.end_time ? parseISO(currData?.end_time): null}
            onChange={(date) => handleDateChange(date, 'end_time', currData, setCurrData)}
            slots={{
              textField: params => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {  handleDateChange(new Date(), 'end_time', currData, setCurrData) }} edge="end">
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
        <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 6 }}>
          <Autocomplete
            style={{ flex: 1 }}
            disablePortal
            id="recorder"
            options={walkers}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}              
            value={currData ? walkers.find(option => option.value === currData.teamleader_uuid) || null : null}
            onChange={(event, newValue) => handleAutocompleteChange(event, newValue, 'teamleader_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Recorder" />}
          />
        </Grid>  
        <Grid size={{ xs: 12, sm: 8 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            multiple
            id="walkers"
            options={walkers}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.walkers_uuid ? walkers.filter(option => currData.walkers_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'walkers_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Walkers" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <TextField
            label="Sample Description"
            variant="outlined"
            id="sample_descr"
            name="description"
            multiline
            fullWidth
            rows={4}
            value={currData?.description} // controlled input value
            onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <TextField
            label="Comments"
            variant="outlined"
            id="sample_com"
            name="comments"
            multiline
            fullWidth
            rows={4}
            value={currData?.comment} // controlled input value
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

export default SurveySample;
