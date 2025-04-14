import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { 
  AddGrid,
  AddGeometry,
  AddFeature,
  AddNew,
  OpenTable,
  AddPhoto
 } from 'components/buttons/Buttons';
import CrudButtons from 'components/buttons/CrudButtons';
import TableDrawer from 'components/layout/TableDrawer';
import ScapeFields from 'components/input/survey/ScapeFields';
import { surveyColDefs } from 'helpers/tableRenders';

const SurveyScape = () => {
  console.log("Render SurveyScape")
  const currData = useStore(state => state.currScape);
  const setCurrData = useStore(state => state.setCurrScape);
  const scapes = useStore(state => state.scape);  
  const natResource = useStore(state => state.natResource);  
  const depositGeom = useStore(state => state.depositGeom);  
  const [scapeForDb, setScapeForDb] = useState(null);

  console.log(currData);
  // Function to find the index of the current scape
  const findDataIndex = (uuid) => scapes.findIndex(item => item.uuid === uuid);
  console.log("scapesList:")
  console.log(scapes);

  //Preparing object for writing to database by rmeoving columns not available in the edit table (eg columns from joined tables)
  useEffect(() => {
    if (currData) {
      const { 
        area, 
        tract, 
        type, 
        layout,
        geom, 
        geometry, 
        recorder, 
        teamleader, 
        walkers, 
        doc_methods, 
        natural_resources, 
        updated_by, 
        ...scapeData 
      } = currData;
      setScapeForDb(scapeData);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: scapeForDb,
    viewTable: 'view_scape',  
    editTable: 'edit_scape'
  });
  
  // Function to get the human-friendly number (1-based) of the current scape in the list:
  const getCurrDataNumber = () => {
    const currentIndex = findDataIndex(currData);
    console.log("currentIndex:")
    console.log(currentIndex)
    return currentIndex >= 0 ? currentIndex + 1 : 'Not Found';
  };
  
  // The current scape number for display:
  const currDataNumber = getCurrDataNumber();

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
          listTable={'list_scape'}
          apiTable={'view_scape'}
          setCurrData={setCurrData}
        />
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
{
//          <Grid xs={6} sm={3} md={3} lg={2} order={{ xs: 1 }}>
//            <GoPrev                 
//              currData={currData} 
//              setCurrData={setCurrData}
//              list={scapes}
//            />         
//          </Grid>
}
          <Grid size={{ xs: 12, sm: 21, md: 6, lg: 6 }} order={{ xs: 3, sm: 2 }}>
            <AddNew /> 
          </Grid>     
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} order={{ xs: 3, sm: 2 }}>
            <OpenTable /> 
          </Grid> 
{
//          <Grid xs={6} sm={3} md={3} lg={2} order={{ xs: 2, sm: 3 }}>
//            <GoNext
//              currData={currData} 
//              setCurrData={setCurrData}
//              list={scapes}
//            />   
//          </Grid>
}
          <Grid size={{ xs: 12 }} order={{ xs: 5, sm: 4 }}>
            <Typography gutterBottom variant="body" component="p">
              No scape selected. Add new or browse through existing.
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
        listTable={'list_scape'}
        apiTable={'view_scape'}
        setCurrData={setCurrData}
      />
      <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} >
          <AddNew />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 6, lg: 4 }} >
          <OpenTable />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} >
          <AddPhoto />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} >
          <AddGeometry />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} >
          <AddFeature />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} >
          <AddGrid />
        </Grid>
      </Grid>
      <ScapeFields currData={currData} setCurrData={setCurrData} />
      <CrudButtons />
    </>
  );
};

export default SurveyScape;
