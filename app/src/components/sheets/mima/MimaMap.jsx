import React, { useEffect, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import { useNavigate } from "react-router-dom";
import { useStore } from 'services/store';
import L from "leaflet";
import 'leaflet.gridlayer.googlemutant';
import "@geoman-io/leaflet-geoman-free";
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import { makeRequest } from 'services/query';
import leafletMarkerIcon from 'leaflet/dist/images/marker-icon.png';
import leafletMarkerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import leafletMarkerIconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  goToRecord
} from 'helpers/buttonActions';

const defaultPosition = [35, 15];

  // Set up custom Leaflet icon properties
  const BlueIcon = L.icon({
    iconRetinaUrl: leafletMarkerIconRetina,
    iconUrl: leafletMarkerIcon,
    shadowUrl: leafletMarkerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const GreyIcon = L.icon({
    iconRetinaUrl: leafletMarkerIconRetina,
    iconUrl: leafletMarkerIcon,
    shadowUrl: leafletMarkerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'greyscale-icon' // Add a custom class for greyscale styling
  });


const PopupContent = ({ properties, navigate }) => {
  const { name, uuid, authorities, related_records } = properties;

  return (
    <Box>
      <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
        {name}
        <IconButton
          aria-label="Open"
          onClick={() => navigate(`/Vocabulary/Place/${uuid}`)}
          edge="end"
        >
          <LaunchIcon />
        </IconButton>
      </Typography>
      {related_records && related_records.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Related Records</Typography>
          {related_records.map(record => (
            <Box key={record.id} mb={1}>
              <Link href={`#`} onClick={() => goToRecord(navigate, record.id)}>{record.id}: {record.name}</Link>
            </Box>
          ))}
        </Box>
      )}      
      {Object.entries(authorities).map(([key, value]) => (
        <Box key={key} mb={2}>
          <Typography variant="subtitle1" component="div">
            <strong>{key}</strong>: <Link href={value['dc:identifier']} target="_blank" rel="noopener noreferrer">{value['dc:title'] ? value['dc:title'] : value['dc:identifier'] }</Link>
          </Typography>
          {value['dc:description'] && (
          <Typography variant="body2" component="div">
            {value['dc:description']}
          </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};


const EditMap = ({currData, setCurrData, parent}) => {
  const mapRef = useRef();

  const [dataForDb, setDataForDb] = useState(null);
  const [geoJsonForMap, setGeoJsonForMap] = useState(null);
  const [staticGeometries, setStaticGeometries] = useState(null);
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);    

  useEffect(() => {
    if (currData?.place){
      const getData = async () => {
        const data = await makeRequest('get', `v_place?uuid=eq.${currData?.place}`, {}, {});
        setStaticGeometries(data[0].geojson);
        console.log("Place loaded.")      
        console.log(data)
      };   
      getData();
    }    
    let geometryData = {}
    if (typeof currData?.geom === 'string') {
    geometryData = JSON.parse(currData?.geom);
    } else {
        geometryData = currData?.geom
    }
    console.log("Loaded geometries")
    console.log(currData?.geom)
    setGeoJsonForMap(geometryData);
  }, [currData]); 

  useEffect(() => {
    console.log('geoJsonForMap: ', geoJsonForMap)
  }, [geoJsonForMap]); 

  //useCrudActions({
    //setSelectedRowData: setCurrData,
    //selectedRowData: dataForDb,
    //viewTable: `v_${parent}`,  
    //editTable: `edit_${parent}`
  //});
 
  const updateButtonAction = (actionName, value) => {
    const updatedAction = { ...buttonAction, [actionName]: value };
    setButtonAction(updatedAction);
  };

  function featureCollectionToGeometryCollection(featureCollection) {
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
      return null;
    }

    const geometryCollection = {
      type: "GeometryCollection",
      geometries: featureCollection.features.map(feature => feature.geometry)
    };
  
    return geometryCollection;
  }

  // Using a ref to always have the current `currData`
  const currDataRef = useRef(currData);
  useEffect(() => {
    currDataRef.current = currData;
  }, [currData]);
  useEffect(() => {
    if (dataForDb) {
      console.log('dataForDb')
      console.log(dataForDb)
      setCurrData(dataForDb)
    }
  }, [dataForDb]);

  function saveLayers() {
    // Use current value from ref  
    const currentData = currDataRef.current;
    const geomanLayers = mapRef.current.pm.getGeomanLayers();
    const featureGroup = L.featureGroup(geomanLayers);  
    const data = featureGroup.toGeoJSON();  
    console.log(data);
    const geometryCollection = featureCollectionToGeometryCollection(data);
    console.log(geometryCollection);
//    let updatedData = { ...currentData, geom: geometryCollection };
//    setCurrData(updatedData);
//    console.log('updatedData')
//        console.log('currData')
//    console.log(currData)
//
    console.log('currentData')
    console.log(currentData)
    setDataForDb({...currentData, "geom": geometryCollection});
    //updateButtonAction("save", true)
  };

  // Set up default Leaflet icon properties
  const DefaultIcon = L.icon({
      iconRetinaUrl: leafletMarkerIconRetina,
      iconUrl: leafletMarkerIcon,
      shadowUrl: leafletMarkerIconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  // Tell Leaflet to use this icon for all markers
  L.Marker.prototype.options.icon = DefaultIcon;

  const GoogleSat = L.gridLayer.googleMutant({
    type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
  });


  const EsriSatBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });
  const EsriTopoBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });
  const EsriHillshadeBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });
  const DAREBasemap = L.tileLayer(" https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png", {
  attribution: 'Map data from DARE, CC-BY 4.0 Johan Åhlfeldt, Centre for Digital Humanities University of Gothenburg',
  });


  const baseMaps = {
      "DARE": DAREBasemap,
      "Google Sat": GoogleSat,
      "Esri Sat": EsriSatBasemap,
      "Esri Topo": EsriTopoBasemap,
      "Esri Shade": EsriHillshadeBasemap
  };

  useEffect(() => {
    if (!mapRef.current) {      
      mapRef.current = L.map("map", {
        center: defaultPosition,
        zoom: 3,
        maxZoom: 20,
        layers: [
          EsriSatBasemap
        ],
      });
      mapRef.current.pm.Toolbar.createCustomControl({
        name: 'save',
        block: 'custom',
        className: 'fa fa-floppy-o mapicon',
        title: 'Save the map',
        onClick: () => {
          saveLayers(); 
        },
      });
      mapRef.current.pm.addControls({
        positions: {
          draw: "topleft",
          edit: "topleft",
          custom: "topleft",
        },
        oneBlock: true,
        cutPolygon: false,
        rotateMode:false,
        drawMarker: true,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: false,
        drawCircle: false,
        drawCircleMarker: false,
        drawText: false
      });
      L.control.layers(baseMaps).addTo(mapRef.current);
    };
  }, []);

  useEffect(() => {
    // Add GeoJSON to map
    const editLayer = L.geoJSON(geoJsonForMap).addTo(mapRef.current);
    //console.log("Editlayer:");
    //console.log(editLayer)
    editLayer.pm.enable(); // This makes the layer a Geoman layer 
    const staticLayer = L.geoJSON(staticGeometries).addTo(mapRef.current);
    //console.log("StaticLayer:");
    //console.log(staticLayer)      
    // Check if there are any layers available to zoom to
    if (editLayer.getLayers().length > 0) {
      // Adjust the map view to ensure the entire layer is visible within the current map container
      try{
        mapRef.current.fitBounds(editLayer.getBounds(), {
          maxZoom: 10 // Set this to your desired max zoom level
        });
      } catch (error) {
        console.error('Error setting bounds:', error);
      }

    } else if (staticLayer.getLayers().length > 0) {
      try{
        // Adjust the map view to point
        mapRef.current.setView(staticLayer, 8);
      } catch (error) {
        console.error('Error setting map view:', error);
      }
    };
  }, [geoJsonForMap, staticGeometries]);

  return (
    <div className="halfheight" id="map" style={{width:"100%"}} />
  );
};

const ReadMap = ({currPlace, allPlaces = [], parent = '' }) => {
  const mapRef = useRef();
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const prevCurrPlaceRef = useRef(''); // Ref to track previous currPlace
  const staticLayerRef = useRef(null); // Ref to store the staticLayer

  // Tell Leaflet to use this icon for all markers
  L.Marker.prototype.options.icon = BlueIcon;  

  const getData = async () => {
    const data = await makeRequest('get', `v_place?uuid=eq.${currPlace}`, {}, {});
    setPlaces([data[0]]);
    console.log("Place loaded.");
    console.log(data);
  };

  useEffect(() => {
    if (allPlaces.length > 0) {
      setPlaces(allPlaces);
    } else if (currPlace && prevCurrPlaceRef.current !== currPlace) {
      getData();
      prevCurrPlaceRef.current = currPlace; // Update the ref with the new currPlace
    }
  }, [currPlace, allPlaces]);


  const GoogleSat = L.gridLayer
    .googleMutant({
      type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

  const EsriSatBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });
  const EsriTopoBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });
  const EsriHillshadeBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}", {
  attribution: 'Map data © Esri',
  });  
  const DAREBasemap = L.tileLayer(" https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png", {
  attribution: 'Map data from DARE, CC-BY 4.0 Johan Åhlfeldt, Centre for Digital Humanities University of Gothenburg',
  });

  const baseMaps = {
      "DARE": DAREBasemap,
      "Google Sat": GoogleSat,
      "Esri Sat": EsriSatBasemap,
      "Esri Topo": EsriTopoBasemap,
      "Esri Shade": EsriHillshadeBasemap
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: defaultPosition,
        zoom: 3,
        maxZoom: 20,
        layers: [
          EsriSatBasemap
        ],
      });
      L.control.layers(baseMaps).addTo(mapRef.current);
    };
  }, []);


  useEffect(() => {
    if (staticLayerRef.current) {
      mapRef.current.removeLayer(staticLayerRef.current); // Remove the previous layer
    }

    if (places.length > 0) {
      const featureCollection = {
        type: "FeatureCollection",
        features: places.map(place => place.geojson)
      };

      const staticLayer = L.geoJSON(featureCollection, {
        pointToLayer: (feature, latlng) => {
          const icon = feature.properties.uuid === currPlace ? BlueIcon : GreyIcon;
          return L.marker(latlng, { icon });
        },
        onEachFeature: (feature, layer) => {
          const popupContent = document.createElement('div');
          const root = createRoot(popupContent);
          root.render(<PopupContent properties={feature.properties} navigate={navigate} />);
          layer.bindPopup(popupContent);
        }
      }).addTo(mapRef.current);

      staticLayerRef.current = staticLayer; // Store the new layer in the ref

      // Check if there are any layers available to zoom to
      if (staticLayer.getLayers().length > 0) {
        try {
          // Adjust the map view to fit the bounds of the features
          mapRef.current.fitBounds(staticLayer.getBounds(), {
            maxZoom: 10 // Set this to your desired max zoom level
          });
        } catch (error) {
          console.error('Error setting bounds:', error);
        }
      }
    }
  }, [places, currPlace]);

  if (parent === 'map') {
    return (
      <div className="fill-main" id="map" style={{ width: "100%", overflow: "hidden" }} />
    );
  }
//  if (parent === 'archaeological') {
    //return (
      //<>
      //<div className="halfheight" id="map" style={{width:"100%",overflow:"hidden"}} />
      //<div className="thirtyheight" style={{width:"100%",overflow:"auto"}}>
        //<Grid container spacing={2} paddingTop={2} > 
          //<ViewLocFields currData={places} />
        //</Grid>
      //</div>
      //</>
    //);
//  }
  return (
    <div className={'halfheight'} id="map" style={{ width: "100%", overflow: "hidden" }} />
  );
};

export { EditMap, ReadMap };
