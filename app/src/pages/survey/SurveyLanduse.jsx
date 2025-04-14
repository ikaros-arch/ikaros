import React, { useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';



const SurveyLanduse = () => {
  console.log("Render Landuse")
  const activeActor = useStore(state => state.activeActor);  
  const setCurrData = useStore(state => state.setCurrScape);
  const terrain = useStore(state => state.terrain);
  const veg = useStore(state => state.veg);  

  const [data, setData] = useState({
    landuse: null,
    updated_by_uuid: null
  });

  const navigate = useNavigate();


// Set tract_uuid for update on change in either map or dropdown
  useEffect(() => {
    setData({ ...data, 'updated_by_uuid': activeActor?.uuid })

  }, [activeActor]);



  const handlePress = async (target) => {
    if (target === 'select') {
      const updateData = await makeRequest('post', `edit_tract`, data, 'Prefer: return=representation');
      const getData = await makeRequest('get', `view_tract?uuid=eq.${updateData[0].uuid}`, {}, {});
      setCurrData(getData[0]);
      console.log(getData);
    }
    navigate('/surv_tract');
  };

  return (
    <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
      <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} order={{ xs: 7 }}>
        <Card >
          <CardActionArea>
            <CardContent 
              onClick={() => handlePress('back')} >
              <SettingsBackupRestoreIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
                Revert and Return
              </Typography>                  
            </CardContent>
          </CardActionArea>
        </Card>        
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} order={{ xs: 8, sm: 7 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => handlePress('select')}>
              <AddIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
                Save and Return
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> 
      </Grid>                      
    </Grid>
  );
};

export default SurveyLanduse;
