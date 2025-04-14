import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from 'services/store';
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import 'leaflet.gridlayer.googlemutant';
import useCrudActions from '@/hooks/useCrudActions';
import 'leaflet.locatecontrol'

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Define the mapping between path prefixes and corresponding Zustand selector hooks.
const storeSelectorsMap = {
  '/surv_tract/': (state) => ({
    currData: state.currTract,
    setCurrData: state.setCurrTract,
  }),
  '/surv_scape/': (state) => ({
    currData: state.currScape,
    setCurrData: state.setCurrScape,
  }),
  '/surv_feature/': (state) => ({
    currData: state.currFeat,
    setCurrData: state.setCurrFeat,
  }),  
};

const defaultPosition = [37.109, 25.494]; // london

const SurveyGeometry = ({ parent }) => {
  const mapRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataForDb, setDataForDb] = useState(null);
  const [geoJsonForMap, setGeoJsonForMap] = useState(null);
  const activeActor = useStore(state => state.activeActor);  
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);    


//  // Custom hook that returns the appropriate store state
//  const useParentData = () => {
//    let selector = {};
//    // Define a map of selectors for each 'parent' value
//    const selectorMap = {
//      grid: (state) => state.currGrid,
//      feature: (state) => state.currFeat,
//      line: (state) => state.currLine,
//      find: (state) => state.currLine,
//      scape: (state) => state.currLine
//    };
//    try {
//      // Get the correct selector based on the 'parent' prop
//      selector = selectorMap[parent];
//      if (!selector) {
//        // You could return a sensible default or throw an error if 'parent' is not expected
//        throw new Error(`Unknown parent: ${parent}, defaulting to 'line'.`);
//      }
//    // Use the selected state slice from the Zustand store      
//    } catch  (error) {
//      console.error(error)
//      selector = selectorMap['line'];
//    }
//    return useStore(selector);
//  };
//
//  // Invoke the custom hook to get the data for the current 'parent'
//  const parentData = useParentData();

  // Find the matching selector for the current path.
  const storePath = Object.keys(storeSelectorsMap).find((parent) =>
    location.pathname.startsWith(parent)
  );

  // Use the matching selector from the path-to-hook map, or use a default selector that returns undefineds.
  const selector = storePath
    ? storeSelectorsMap[storePath]
    : () => ({ currData: null, setCurrData: null });

  // Use the selected hook.
  const { currData, setCurrData } = useStore(selector);

  const theme = useTheme();
  const isXsmall = useMediaQuery(theme.breakpoints.only('xs'));
  const isSmall = useMediaQuery(theme.breakpoints.down('lg'));

  let timeoutHandle = null; 
  let userMarker = null;
  let activeLayer = null;
  let coords = null;

  useEffect(() => {
    let geometryData = {}
    if (typeof currData?.geometry === 'string') {
    geometryData = JSON.parse(currData?.geometry);
    } else {
        geometryData = currData?.geometry;
    }
    console.log("Loaded geometries")
    console.log(currData?.geometry)    
    setGeoJsonForMap(geometryData);
  }, [currData]); 

  useEffect(() => {
    console.log(geoJsonForMap)
  }, [geoJsonForMap]); 

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: `view_${parent}`,  
    editTable: `edit_${parent}`
  });
 
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

  function saveLayers() {
    const geomanLayers = mapRef.current.pm.getGeomanLayers();
    const featureGroup = L.featureGroup(geomanLayers);  
    const data = featureGroup.toGeoJSON();  
    console.log(data);
    const geometryCollection = featureCollectionToGeometryCollection(data);
    console.log(geometryCollection);

    setDataForDb({"uuid":currData.uuid,"geom": geometryCollection});
    updateButtonAction("save", true)
  }

  const handlePress = (target) => {
    navigate(target);
  };

  function recPostion() {
    // if a userMarker and activeLayer exist, add a vertex at the userMarker's position
    console.log("running")
    console.log("userMarker: " + userMarker + " and activeLayer: " + activeLayer);
    if(userMarker && activeLayer) {
      coords = userMarker.getLatLng()
        if(activeLayer instanceof L.Polygon || activeLayer instanceof L.Polyline) {
            activeLayer.addLatLng(coords);
            console.log("Active layer type polygon or polyline. Coords added.");
        } else if(activeLayer instanceof L.Marker) {
            activeLayer.setLatLng(coords);
            console.log("Active layer type marker. Coords added.");
        }
        // Remove the userMarker
        userMarker.removeFrom(mapRef.current);
        userMarker = null;
        console.log("userMarker removed after position recording");
      console.log("Position recorded: " + coords);
    }
  }

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

  const baseMaps = {
      "Google Sat": GoogleSat,
      "Esri Sat": EsriSatBasemap,
      "Esri Topo": EsriTopoBasemap,
      "Esri Shade": EsriHillshadeBasemap
  };


  L.Control.Button = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var button = L.DomUtil.create('a', 'leaflet-control-button fa fa-bullseye mapicon', container);
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', function(){
            recPostion();
        });

        container.title = "Record position";

        return container;
    },
    onRemove: function(map) {},
  });
  var control = new L.Control.Button()

  useEffect(() => {
    if (!mapRef.current) {
      let buttonSize;
      let iconSize;
      if (isXsmall) {
        buttonSize = '50px';
        iconSize = '45px';
      } else if (isSmall) {
        buttonSize = '75px';
        iconSize = '70px';
      } else {
        buttonSize = '36px';
        iconSize = '30px';
      }

      const style = document.createElement("style");
      style.innerHTML = `
        .leaflet-bar button, 
        .leaflet-bar a,
        .leaflet-control-layers-toggle {
          width: ${buttonSize} !important;
          height: ${buttonSize} !important;
        }
        .mapicon,
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out,
        .leaflet-control-layers label {
          font-size: ${iconSize} !important;
          line-height: ${buttonSize} !important;
          color: rgba(0,0,0,0.6) !important;
        }
        .leaflet-control-locate-location-arrow {
          width: calc(${iconSize} - 15px) !important;
          height: calc(${iconSize} - 15px) !important;  
          color: rgba(0,0,0,0.6) !important;
        }
      `;

      document.head.appendChild(style);
                  
      mapRef.current = L.map("map", {
        center: defaultPosition,
        zoom: 12,
        maxZoom: 20,
        layers: [
          GoogleSat
        ],
      });

      mapRef.current.pm.Toolbar.createCustomControl({
        name: 'back',
        block: 'custom',
        className: 'fa fa-chevron-left mapicon', // you can style your button with this class
        title: 'Go back',
        onClick: () => {
          // Provide logic for 'back' action 
          handlePress(`/surv_${parent}`);
        },
      });
  
      mapRef.current.pm.Toolbar.createCustomControl({
        name: 'save',
        block: 'custom',
        className: 'fa fa-floppy-o mapicon', // you can style your button with this class
        title: 'Save the map',
        onClick: () => {
          saveLayers(); 
        },
      });

      mapRef.current.pm.addControls({
        positions: {
          draw: "topright",
          edit: "topleft",
          custom: "topleft",
        },
        drawMarker: true,
        drawPolyline: true,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: true,
        drawCircleMarker: false,
  
      });

      L.control.layers(baseMaps).addTo(mapRef.current);
      L.control.locate({
        position: "topright"
      }).addTo(mapRef.current);

    
      mapRef.current.on('locationfound', (e) => {
        // If there's already a userMarker, remove it
        if(userMarker) {
            userMarker.removeFrom(mapRef.current);
            console.log("removed useMarker on locationfound");
        }

        // If accuracy is higher than 2 meters, ignore this event
        if(e.accuracy > 2) {
            return;
        }

        // If there's an old timeout, clear it
        if(timeoutHandle) {
            clearTimeout(timeoutHandle);
        }

        // Now create a new marker
        userMarker = L.marker(e.latlng, { pmIgnore: true }).addTo(mapRef.current);
        console.log("Added new userMarker on locationfound");

        // Remove the marker after 90 seconds
        timeoutHandle = setTimeout(() => {
            userMarker.removeFrom(mapRef.current);
            userMarker = null;
            console.log("userMarker removed after 90 seconds.");
        }, 90000); // 90000 milliseconds = 90 seconds

      });
        
      mapRef.current.on('pm:drawstart', (event) => {
        activeLayer = event.workingLayer;
        console.log("Set activeLayer on drawstart");
      });

      mapRef.current.on('pm:drawend', (event) => {
          activeLayer = null;
          console.log("Reset activeLayer on drawend");
      });

      control.addTo(mapRef.current);

      // Add GeoJSON to map
      const editLayer = L.geoJSON(geoJsonForMap).addTo(mapRef.current);
      editLayer.pm.enable(); // This makes the layer a Geoman layer 
      // Check if there are any layers available to zoom to
      if (editLayer.getLayers().length > 0) {
        // Adjust the map view to ensure the entire layer is visible within the current map container
        mapRef.current.fitBounds(editLayer.getBounds());
      }      
    }     
  }, [isSmall, isXsmall]);

  return (
    <div>
      <div id="map" style={{ height: "calc(100vh - 43px)", width: "100%" }} />
    </div>
  );
};

export default SurveyGeometry;
