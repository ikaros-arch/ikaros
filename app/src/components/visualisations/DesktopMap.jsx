import React, { useEffect, useRef, useState } from "react";
import { useStore } from 'services/store';
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import 'leaflet.gridlayer.googlemutant';
import useCrudActions from '@/hooks/useCrudActions';


const defaultPosition = [37.109, 25.494];

const DesktopMap = ({ currData, setCurrData, parent }) => {
  const mapRef = useRef();
  const [dataForDb, setDataForDb] = useState(null);
  const [geoJsonForMap, setGeoJsonForMap] = useState(null);
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);    

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

  const baseMaps = {
      "Google Sat": GoogleSat,
      "Esri Sat": EsriSatBasemap,
      "Esri Topo": EsriTopoBasemap,
      "Esri Shade": EsriHillshadeBasemap
  }

  useEffect(() => {
    if (!mapRef.current) {      
      mapRef.current = L.map("map", {
        center: defaultPosition,
        zoom: 12,
        maxZoom: 20,
        layers: [
          GoogleSat
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
    };
  }, []); 

  useEffect(() => {    
    // Add GeoJSON to map
    const editLayer = L.geoJSON(geoJsonForMap).addTo(mapRef.current);
    console.log("Editlayer:");
    console.log(editLayer)
    editLayer.pm.enable(); // This makes the layer a Geoman layer 
    // Check if there are any layers available to zoom to
    if (editLayer.getLayers().length > 0) {
      // Adjust the map view to ensure the entire layer is visible within the current map container
      mapRef.current.fitBounds(editLayer.getBounds());
    }
  }, [geoJsonForMap]);

  return (
    <div className="sheet-element hidden-scrollbar" id="map" />
  );
};

export default DesktopMap;
