import React from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate  } from 'react-router-dom';
import { useStore } from 'services/store';
import Typography from '@mui/material/Typography';
import WindRose from 'assets/svg/WindRose';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import AddchartIcon from '@mui/icons-material/Addchart';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AttractionsIcon from '@mui/icons-material/Attractions';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import getGeoJsonPosition from 'services/getLocation';
import { 
  handlePress
} from 'helpers/buttonActions';


const Triangle = styled('polygon')(({ theme, filled }) => ({
  fill: filled ? theme.palette.grey[400] : theme.palette.common.white,
  stroke: theme.palette.grey[500],
  cursor: 'pointer',
  strokeWidth: 1,
}));

export const DirectionButtons = ({currData, setCurrData}) => {

  const onTriangleClick = (event) => {
    let updatedData = { ...currData, 'direction': event.target.id };
    setCurrData(updatedData);    
    console.log('Heading ' + event.target.id + '!');
  };

  return (
    <svg  viewBox="0 0 128 128" height="128" width="128">
        <Triangle id="N" filled={currData?.direction === 'N'} points="0,0 128,0 64,64" onClick={onTriangleClick} />
        <Triangle id="E" filled={currData?.direction === 'E'} points="128,0 128,128 64,64" onClick={onTriangleClick} />

        <Triangle id="S" filled={currData?.direction === 'S'} points="128,128 0,128 64,64" onClick={onTriangleClick} />
        <Triangle id="W" filled={currData?.direction === 'W'} points="0,128 0,0 64,64" onClick={onTriangleClick} />
        <WindRose />        
    </svg>
  );
}

export const AddPhoto = () => {
  const navigate = useNavigate();
  return (
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'photo')}>
          <AddPhotoAlternateIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Photo
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card> 
  )
 
}
export const AddFind = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'find')}>
          <ScatterPlotIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Find
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card> 
  )        
}
export const AddGeometry = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'geom')}>
          <AddchartIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Geometry
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card>
  )     
}
export const AddPoI = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'poi')}>
          <ArtTrackIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add PoI
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card>
  )     
}
export const AddLanduse = ({currData, setCurrData}) => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'landuse')}>
          <AgricultureIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Landuse
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card> 
  )      
}
export const AddFeature = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, '/surv_feature/select')}>
          <AttractionsIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Feature
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card> 
  )      
}
export const AddGrid = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, '/surv_grid/select')}>
          <BorderAllIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Grid
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card>  
  )     
}
export const AddScape = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, '/surv_scape/select')}>
          <LandscapeIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add Feature
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card>  
  )     
}    
export const OpenTable = () => {
  const setTableOpen = useStore(state => state.setTableOpen);
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => setTableOpen(true)}>
          <AddIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Open Table
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>  
  )     
}
export const AddNew = () => {
  const navigate = useNavigate();
  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handlePress(navigate, 'select')}>
          <AddIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Add New
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>  
  )     
}
/**
 * Component to navigate to the previousitem in a list.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object.
 * @param {Function} props.setCurrData - Function to update the current data.
 * @param {Array} props.list - The list of data objects.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const GoPrev = ({currData, setCurrData, list}) => {

  // Function to find the index of the current scape
  const findDataIndex = (uuid) => list.findIndex(item => item.uuid === uuid);
  
  // Function to navigate to the previous or next scape
  const navigateData = (direction) => {
    const currentIndex = findDataIndex(currData.uuid);
    if (currentIndex === -1) return; // or handle error
  
    // Calculating the new index
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    } else { // if direction === 'next'
      newIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    }
  
    // Updating the currScape with the new scape's uuid
    setCurrData(list[newIndex].uuid);
  };

  return (  
    <Card >
      <CardActionArea>
        <CardContent 
          onClick={() => navigateData('next')} >
          <NavigateBeforeIcon sx={{ fontSize: 90 }} />
        </CardContent>
      </CardActionArea>
    </Card>  
  )     
}
/**
 * Component to navigate to the next item in a list.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.currData - The current data object.
 * @param {Function} props.setCurrData - Function to update the current data.
 * @param {Array} props.list - The list of data objects.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const GoNext = ({currData, setCurrData, list}) => {
  // Function to find the index of the current scape
  const findDataIndex = (uuid) => list.findIndex(item => item.uuid === uuid);
  
  // Function to navigate to the previous or next scape
  const navigateData = (direction) => {
    const currentIndex = findDataIndex(currData.uuid);
    if (currentIndex === -1) return; // or handle error
  
    // Calculating the new index
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    } else { // if direction === 'next'
      newIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    }
  
    // Updating the currScape with the new scape's uuid
    setCurrData(list[newIndex].uuid);
  };

  return (  
    <Card >
      <CardActionArea>
        <CardContent onClick={() => navigateData('prev')}>
          <NavigateNextIcon sx={{ fontSize: 90 }} />
        </CardContent>
      </CardActionArea>
    </Card>    
  )    
}

export const GetLocation = ({currData, setCurrData}) => {
  const handleLocationClick = async () => {
    try {
      const geoJsonPosition = await getGeoJsonPosition();
      if (geoJsonPosition.properties.accuracy > 5) {
        if (!window.confirm("Accuracy is less than 5 meters. Do you still want to save?")) {
          return;
        }
      }
      let updatedData = { ...currData, 'geom': geoJsonPosition };
      setCurrData(updatedData);      
      console.log(geoJsonPosition);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card >
      <CardActionArea>
        <CardContent onClick={() => handleLocationClick()}>
          <AddLocationIcon sx={{ fontSize: 60 }} />
          <Typography gutterBottom variant="h5" component="p">
            Get location
          </Typography>                  
        </CardContent>
      </CardActionArea>
    </Card>  
  )
}

export const AreaFilters = ({filters, setFilters}) => {
  // handle filter change
  const handleFilterChange = (filter) => {
    setFilters(prevState => ({ ...prevState, ...filter }));
  };

  return (
    <FormGroup row >
      <FormControlLabel control={
        <Checkbox
          checked={filters.status}
          onChange={(event) => handleFilterChange({ status: event.target.checked })}
          inputProps={{ 'aria-label': 'controlled' }}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 60, }, }}
        />
      } label="Include walked tracts?" />
      <FormControlLabel control={
        <Checkbox
          checked={filters.areaA}
          onChange={(event) => handleFilterChange({ areaA: event.target.checked })}
          inputProps={{ 'aria-label': 'controlled' }}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 60, }, }}
        />
      } label="Include Melanes?" />     
      <FormControlLabel control={
        <Checkbox
          checked={filters.areaB}
          onChange={(event) => handleFilterChange({ areaB: event.target.checked })}
          inputProps={{ 'aria-label': 'controlled' }}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 60, }, }}
        />
      } label="Include Apollonas?" />                               
    </FormGroup> 
  )
}