import React, { useEffect, useRef, useState } from "react";
import { useStore } from 'services/store';
import { isMobile, isTablet } from 'react-device-detect';
import L from "leaflet";
import 'leaflet.gridlayer.googlemutant';
import "@geoman-io/leaflet-geoman-free";
import { makeRequest } from 'services/query';
//import useCrudActions from 'components/CrudActions';
import leafletMarkerIcon from 'leaflet/dist/images/marker-icon.png';
import leafletMarkerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import leafletMarkerIconShadow from 'leaflet/dist/images/marker-shadow.png';
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

const defaultPosition = [35, 15];
// Define the local coordinate system (replace with your local system definition)
const localCRS = L.CRS.Simple;


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

const GoogleSat = L.gridLayer.googleMutant({
  type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
});

const baseMaps = {
  "DARE": DAREBasemap,
  "Google Sat": GoogleSat,
  "Esri Sat": EsriSatBasemap,
  "Esri Topo": EsriTopoBasemap,
  "Esri Shade": EsriHillshadeBasemap
}

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

const activeStyle = {
  color: 'blue', // Outline color
  weight: 1.5, // Outline width
  fillColor: 'blue', // Fill color
  fillOpacity: 0.5 // Fill opacity
};
const backgroundStyle = {
  color: 'black', // Outline color
  weight: 1, // Outline width
  fillColor: 'grey', // Fill color
  fillOpacity: 0.5 // Fill opacity
};

const EditMap = ({ currData, setCurrData, staticTable, parent }) => {
  const mapRef = useRef();
  const currDataRef = useRef(currData);
  const layersRef = useRef({});

  const [dataForDb, setDataForDb] = useState(null);
  const [backgroundData, setBackgroundData] = useState([]);
  const [geoJsonForMap, setGeoJsonForMap] = useState(null);
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);

  let timeoutHandle = null; 
  let userMarker = null;
  let activeLayer = null;
  let coords = null;

  useEffect(() => {
    let geometryData = {};
    if (typeof currData?.geom === 'string') {
      geometryData = JSON.parse(currData?.geom);
    } else {
      geometryData = currData?.geom;
    }
    console.log("Loaded geometries");
    console.log(currData?.geom);
    setGeoJsonForMap(geometryData);
  }, [currData]); 

  useEffect(() => {
    if (staticTable){
      const getData = async () => {
        const data = await makeRequest('get', staticTable, {}, {});
        setBackgroundData(data);
        console.log("Static geometries loaded.");
        console.log(data);
      };
      getData();
    }
  }, [staticTable]);

  useEffect(() => {
    console.log('geoJsonForMap: ', geoJsonForMap);
  }, [geoJsonForMap]); 

  function recPostion() {
    // if a userMarker and activeLayer exist, add a vertex at the userMarker's position
    console.log("running");
    console.log("userMarker: " + userMarker + " and activeLayer: " + activeLayer);
    if(userMarker && activeLayer) {
      coords = userMarker.getLatLng();
      if(activeLayer instanceof L.Polygon || activeLayer instanceof L.Polyline) {
        activeLayer.addLatLng(coords);
        console.log("Active layer type polygon or polyline. Coords added.");
      } else if(activeLayer instanceof L.Marker) {
        activeLayer.setLatLng(coords);
        console.log("Active layer type marker. Coords added.");
      };
      // Remove the userMarker
      userMarker.removeFrom(mapRef.current);
      userMarker = null;
      console.log("userMarker removed after position recording");
      console.log("Position recorded: " + coords);
    };
  };
 
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
  };

  // Using a ref to always have the current `currData`
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
    console.log('currentData');
    console.log(currentData);
    setDataForDb({...currentData, "geom": geometryCollection});
    //updateButtonAction("save", true)
  };

  // Tell Leaflet to use this icon for all markers
  L.Marker.prototype.options.icon = DefaultIcon;

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
  var control = new L.Control.Button();

  useEffect(() => {
    if (!mapRef.current) {
      let buttonSize;
      let iconSize;
      if (isMobile) {
        buttonSize = '50px';
        iconSize = '45px';
      } else if (isTablet) {
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
        zoom: 3,
        maxZoom: 20,
        crs: localCRS, // Use the local coordinate system
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
        drawPolygon: true,
        drawCircle: false,
        drawCircleMarker: false,
        drawText: false
      });
      // L.control.layers(baseMaps).addTo(mapRef.current);
      new LocateControl({
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
    };
  }, []);

  useEffect(() => {
      // Remove old edit layers
      if (layersRef.current['edit']) {
        layersRef.current['edit'].forEach(layer => mapRef.current.removeLayer(layer));
      }
      layersRef.current['edit'] = [];
      // Add GeoJSON to map
      const editLayer = L.geoJSON(geoJsonForMap).addTo(mapRef.current);
      editLayer.pm.enable(); // This makes the layer a Geoman layer
      layersRef.current['edit'] = [editLayer];
      // Check if there are any layers available to zoom to
      if (editLayer.getLayers().length > 0) {
        // Adjust the map view to ensure the entire layer is visible within the current map container
        try {
          mapRef.current.fitBounds(editLayer.getBounds(), {
            maxZoom: 10 // Set this to your desired max zoom level
          });
        } catch (error) {
          console.error('Error setting bounds:', error);
        };
      }
  }, [geoJsonForMap]);

  useEffect(() => {
    if (mapRef.current) {
      // Remove old layers of the same type
      if (layersRef.current['background']) {
        layersRef.current['background'].forEach(layer => mapRef.current.removeLayer(layer));
      }
      layersRef.current['background'] = [];

      if (backgroundData.length > 0) {
        const staticLayer = backgroundData
          .filter(row => row.geom) // Filter out rows with null geom
          .map(row => {
            const layer = L.geoJSON(row.geom, {
              style: backgroundStyle
            }).addTo(mapRef.current);
            layersRef.current['background'].push(layer);
            return layer;
          });
          if (!geoJsonForMap && staticLayer && staticLayer.length > 0) {
            try {
              // Adjust the map view to ensure all layers are visible
              const featureGroup = L.featureGroup(staticLayer);
              mapRef.current.fitBounds(featureGroup.getBounds(), {
                maxZoom: 10 // Set this to your desired max zoom level
              });
            } catch (error) {
              console.error('Error setting map view:', error);
            };
          };
      };
    };
  }, [backgroundData]);

  return (
    <div className="sheet-element" id="map" style={{ width: "100%" }} />
  );
};


const ReadMap = ({currData, parent}) => {
  const mapRef = useRef();
  const [staticGeometries, setStaticGeometries] = useState(null);

  // Tell Leaflet to use this icon for all markers
  L.Marker.prototype.options.icon = DefaultIcon;  

  useEffect(() => {
    if (parent === 'context') {
      setStaticGeometries(currData.geom);
      console.log("Geometry loaded.");
      console.log(currData.geom);
    }
    if (currData?.place){
      const getData = async () => {
        const data = await makeRequest('get', `v_place?uuid=eq.${currData?.place}`, {}, {});
        setStaticGeometries(data[0].geojson);
        console.log("Place loaded.");
        console.log(data);
      };   
      getData();
    }
  }, [currData]); 

  // Using a ref to always have the current `currData`
  const currDataRef = useRef(currData);
  useEffect(() => {
    currDataRef.current = currData;
  }, [currData]);

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
      // Add GeoJSON to map
      const staticLayer = L.geoJSON(staticGeometries).addTo(mapRef.current);
       console.log("StaticLayer:");
       console.log(staticLayer);
      // Check if there are any layers available to zoom to
      if (staticLayer && staticLayer.getLayers && staticLayer.getLayers().length > 0) {
        try {
          mapRef.current.fitBounds(staticLayer.getBounds(), {
            maxZoom: 10 // Set this to your desired max zoom level
          });
        } catch (error) {
          console.error('Error setting bounds:', error);
        }
      }
  }, [staticGeometries]);

  return (
    <div className="sheet-element" id="map" style={{ width: "100%", overflow: "hidden" }} />
  );
};

const OverviewMap = ({ parent }) => {
  console.log("OverviewMap");
  const filteredRows = useStore(state => state.filteredRows);
  const setFilteredRows = useStore(state => state.setFilteredRows);
  const selRow = useStore(state => state.selRow);
  const setSelRow = useStore(state => state.setSelRow);

  const mapRef = useRef();
  const layersRef = useRef([]);
  const selLayerRef = useRef(null);

  // Tell Leaflet to use this icon for all markers
  L.Marker.prototype.options.icon = DefaultIcon;

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: defaultPosition,
        zoom: 3,
        maxZoom: 20,
        crs: localCRS, // Use the local coordinate system
      });
      L.control.scale({ imperial: false }).addTo(mapRef.current);
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      // Remove old layers
      layersRef.current.forEach(layer => mapRef.current.removeLayer(layer));
      layersRef.current = [];

      if (filteredRows.length > 0) {
        const geoJsonLayers = filteredRows
          .filter(row => row.geom) // Filter out rows with null geom
          .map(row => {
            const layer = L.geoJSON(row.geom, {
              style: backgroundStyle
            }).addTo(mapRef.current);

            // Add click event listener to set selRow
            layer.on('click', () => {
              setSelRow(row);
            });

            layersRef.current.push(layer);
            return layer;
          });

        // Adjust the map view to ensure all layers are visible
        const featureGroup = L.featureGroup(geoJsonLayers);
        if (featureGroup.getLayers().length > 0) {
          mapRef.current.fitBounds(featureGroup.getBounds(), {
            maxZoom: 10 // Set this to your desired max zoom level
          });
        }
      }
    }
  }, [filteredRows]);

  useEffect(() => {
    if (mapRef.current) {
      // Remove old selected row layer
      if (selLayerRef.current) {
        mapRef.current.removeLayer(selLayerRef.current);
        selLayerRef.current = null;
      }

      if (selRow && selRow.geom) {
        // Add new selected row layer
        selLayerRef.current = L.geoJSON(selRow.geom, {
          style: activeStyle
        }).addTo(mapRef.current);

        // Adjust the map view to ensure the selected layer is visible
        const featureGroup = L.featureGroup([selLayerRef.current]);
        if (featureGroup.getLayers().length > 0) {
          mapRef.current.fitBounds(featureGroup.getBounds(), {
            maxZoom: 10 // Set this to your desired max zoom level
          });
        }
      }
    }
  }, [selRow]);

  console.log("Filtered Rows: ", filteredRows);
  console.log("Selected Row: ", selRow);

  return (
    <div className="sheet-element" id="map" style={{ width: "100%", overflow: "hidden" }} />
  );
};

export { EditMap, ReadMap, OverviewMap };