import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { parseISO } from 'date-fns';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import {
  AddGeometry,
  AddLanduse,
  AddNew,
  OpenTable,
  AddPhoto,
  GoNext,
  GoPrev
 } from 'components/buttons/Buttons';
import { 
  handleInputChange, 
  handleDateChange, 
  handleMultiAutocompleteChange 
} from 'helpers/buttonActions';
import CrudButtons from 'components/buttons/CrudButtons';
import TableDrawer from 'components/layout/TableDrawer';
import { surveyColDefs } from 'helpers/tableRenders';


const SurveyFeature = () => {
  console.log("Render SurveyFeature");
  const currData = useStore(state => state.currFeat);
  const setCurrData = useStore(state => state.setCurrFeat);
  const walkers = useStore(state => state.walker);
  const recTypeField = useStore(state => state.recTypeField);
  const featureType = useStore(state => state.featureType);
  const period = useStore(state => state.period);
  const [scapeForDb, setScapeForDb] = useState(null);

  console.log(currData);

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { 
        area, 
        geom, 
        geometry,
        scape,
        teamleader, 
        walkers, 
        doc_methods,
        periods,
        feature_types,
        updated_by,
        recorded_by,
        ...scapeData 
      } = currData;
      setScapeForDb(scapeData);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: scapeForDb,
    viewTable: 'view_feature',  
    editTable: 'edit_feature'
  });

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type, 
  ];

  if(!currData){
    return (
      <>
        <TableDrawer
          columns={listColumns}
          apiTable={'view_feature'}
          listTable={'list_feature'}
          setCurrData={setCurrData}
        />
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 1 }}>
            <GoPrev
              currData={currData} 
              setCurrData={setCurrData}
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
            /> 
          </Grid>
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No feature selected. Add new or browse through existing.
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
        apiTable={'view_feature'}
        listTable={'list_feature'}
        setCurrData={setCurrData}
      />
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 1 }}>
          <GoPrev
            currData={currData} 
            setCurrData={setCurrData}
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
          /> 
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
          <Typography gutterBottom variant="body" component="p">
            {currData?.name &&`Tract ${currData?.name}. `}
              Record N of Y.
              {currData?.status ? ` Created ${currData?.created_at}.` : ' Not yet recorded'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddPhoto />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddLanduse />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{xs: 4, sm: 5 }}>
          <AddGeometry />
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
        <Grid size={{ xs: 12, sm: 8 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            multiple
            id="feature_types"
            options={featureType}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.feature_types_uuid ? featureType.filter(option => currData.feature_types_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'feature_types_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Feature Types" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            multiple
            id="recorders"
            options={walkers}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.recorded_by_uuid ? walkers.filter(option => currData.recorded_by_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'recorded_by_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Recorders" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            multiple
            id="doc_methods"
            options={recTypeField}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.doc_methods_uuid ? recTypeField.filter(option => currData.doc_methods_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'doc_methods_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Documentation Methods" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
          <Autocomplete
            disablePortal
            multiple
            id="periods"
            options={period}
            getOptionLabel={(option) => option.label}
            value={ currData && currData.periods_uuid ? period.filter(option => currData.periods_uuid.includes(option.value)) : [] }
            onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, 'periods_uuid', currData, setCurrData)}
            renderInput={(params) => <TextField {...params} label="Chronology" />}
            renderOption={(props, option) => <li {...props}>{option.label}</li>} 
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <TextField
            label="Feature Description"
            variant="outlined"
            id="feat_descr"
            name="description"
            multiline
            fullWidth
            rows={4}
            value={currData?.description || ''} // controlled input value
            onChange={(data) => handleInputChange(data, currData, setCurrData)} // input change handler
          />
        </Grid>
        <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
          <TextField
            label="Notes"
            variant="outlined"
            id="feature_notes"
            name="notes"
            multiline
            fullWidth
            rows={4}
            value={currData?.notes || ''} // controlled input value
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

export default SurveyFeature;
