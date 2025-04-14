import React, { useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { geoJSON } from 'leaflet';
import { MapContainer, GeoJSON, Marker, Circle, useMap } from 'react-leaflet'
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import AddIcon from '@mui/icons-material/Add';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import GoogleMutantLayer from 'components/GoogleMutant';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { AreaFilters } from 'components/buttons/Buttons';


function LocationMarker( {selectedItem, getLocation} ) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (getLocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition([lat, lng]);
  
        //Set the view once position is updated
        map.flyTo([lat, lng], 15, { duration: 3 });
      });      
    }
  }, [map,getLocation]);

  useEffect(() => {
    if (selectedItem) {
      // Define temp GeoJSON layer
      const layer = geoJSON(JSON.parse(selectedItem.geojson));
      // Get the center of the layer
      const center = layer.getBounds().getCenter();
      //console.log(center); // Logs the centroid of the geometry
      map.flyTo([center.lat, center.lng], 17, { duration: 1 });
    }
  }, [selectedItem]);

  return position === null ? null : (
    <>
      <Marker position={position} />
      <Circle 
        center={position} 
        //radius={position.properties.accuracy}
      />    
    </>
  );
}


const SurveySelTract = () => {
  console.log("Render AddSurveyTract")
  const tracts = useStore(state => state.tract);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [getLocation, setGetLocation] = useState(false);
  const setCurrTract = useStore(state => state.setCurrTract);

 
  const [filters, setFilters] = useState({
    areaA: true,
    areaB: false,
    status: false
  });

  const navigate = useNavigate();

  const highlight = { color: 'green', weight: 3 }; 

  // filtered options
  const filteredOptions = tracts.filter(option =>
    (filters.areaA && option.parent === "Melanes (A)") ||
    (filters.areaB && option.parent === "Apollonas (B)") ||
    (filters.status && option.status === true)
  );  


  const handlePress = async (target) => {
    if (target === 'select') {
      const data = await makeRequest('get', `view_tract?uuid=eq.${selectedItem.uuid}`, {}, {});
      setCurrTract(data[0]);
    }
    navigate('/surv_tract');
  };

  return (
    <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
      <Grid size={{ xs: 9, sm: 9 }} order={{ xs: 1 }}>
        <AreaFilters 
          filters={filters}
          setFilters={setFilters}
        />
      </Grid>
        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 2 }} order={{xs: 2 }}>
          <Card >
            <CardActionArea>
            { !getLocation ?
              <CardContent onClick={() => setGetLocation(true)}>
                <LocationSearchingIcon sx={{ fontSize: 60 }} />                        
              </CardContent>
              :
              <CardContent onClick={() => setGetLocation(false)}>
                <MyLocationIcon sx={{ fontSize: 60 }} />                                 
              </CardContent>                
            }
            </CardActionArea>
          </Card>  
        </Grid>                                          
      <Grid size={{ xs: 12, sm: 12, md: 6 }} order={{ xs: 3 }}>
        <Autocomplete
          options={filteredOptions}
          getOptionLabel={(option) => `T${option.name} in ${option.parent}. ${option.status === true ? 'Walked' : 'Not walked'}`}
          isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
          value={selectedItem}
          onChange={(event, newValue) => {
            setSelectedItem(newValue);
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.uuid}>
              {`T${option.name} in ${option.parent}. ${option.status === true ? 'Walked' : 'Not walked'}`}
            </li>
          )}             
          renderInput={(params) => <TextField {...params} label="Select tract" variant="outlined" />}
        />
      </Grid>                              
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} order={{ xs: 7 }} >
        <Paper 
          elevation={1}
          sx={{ 
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            height: '50vh'
          }}
        >
          <MapContainer 
            style={{ height: "100%", width: "100%" }}
            center={[37.109, 25.494]} 
            zoom={15} 
            scrollWheelZoom={true}
          >
            <GoogleMutantLayer />
            {filteredOptions.map((option) => (
              <GeoJSON 
                key={option.uuid} 
                data={JSON.parse(option.geojson)}
                style={selectedItem === option ? highlight : null} // Highlight if selected
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: (e) => {
                      if (selectedLayer) {
                        selectedLayer.setStyle({color: '', weight: ''}); // Reset style of previous selected polygon
                      }
                      layer.setStyle(highlight); // Highlight current clicked polygon
                      setSelectedLayer(layer); // Replace the previously selected layer
                      setSelectedItem(option); // Set item as selected
                    },
                  });
                }}                  
              />
            ))}
            <LocationMarker selectedItem={selectedItem} getLocation={getLocation} />
          </MapContainer>
        </Paper>  
      </Grid>                              
      <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} order={{ xs: 7 }}>
        <Card >
          <CardActionArea>
            <CardContent 
              onClick={() => handlePress('back')} >
              <SettingsBackupRestoreIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
                Go back
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
                Select
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> 
      </Grid>                      
    </Grid>
  );
};

export default SurveySelTract;
