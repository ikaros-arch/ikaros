// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as proj from 'ol/proj';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import proj4 from 'proj4';

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Define the custom CRS using Proj4
    proj4.defs('EPSG:90001', '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs +x_0=4000 +y_0=4000 +lon_0=25.64687372 +lat_0=36.89245276 +k=1');

    // Register the projection in OpenLayers
    register(proj4);

    // Create a new projection object
    const customProjection = new Projection({
      code: 'EPSG:90001',
      extent: [0, 0, 1800, 7300], // Define the extent of your CRS (modify as necessary)
      units: 'm',
    });

    // Example GeoJSON data (Replace with your data or fetch from your API)
    const geojsonObject = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [179.566, 3512.64],
                  [180.973, 3515.119],
                  [180.614, 3514.971],
                  [179.995, 3515.327],
                  [180.049, 3515.748],
                  [177.823, 3517.076],
                  [177.709, 3517.374],
                  [177.334, 3517.44],
                  [176.154, 3515.849],
                  [174.89, 3514.741],
                  [179.566, 3512.64]
                ]
              ]
            }
          }
        ]
      };

    // Create vector source and layer
    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonObject, {
          dataProjection: 'EPSG:90001',  // The projection of the input data
          featureProjection: 'EPSG:3857', // The projection in which we'd like the features to be
        }),
      });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });


    console.log('Custom Projection:', customProjection);
    console.log('GeoJSON Object:', geojsonObject);
    console.log('Vectorsource:', vectorSource);
    // Log loaded features for debugging
    console.log('Loaded Features:', vectorSource.getFeatures());

    // Initialize the map with OpenLayers
    const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        view: new View({
          projection: 'EPSG:3857', // Use the OSM standard projection
          center: proj.transform([25.64687372, 36.89245276], 'EPSG:4326', 'EPSG:3857'), // Center coordinates in EPSG:4326 transformed to EPSG:3857
          zoom: 12, // Starting zoom level
        }),
      });

      
    // Zoom to the extent of the vector layer
    const vectorLayerExtent = vectorSource.getExtent();
    console.log('Vector Layer Extent:', vectorLayerExtent);
    map.getView().fit(vectorLayerExtent, { size: map.getSize(), padding: [50, 50, 50, 50] });

    
    // Clean up on unmount
    return () => {
      map.setTarget(null);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="sheet-element" id="maptest" style={{width:"100%",overflow:"hidden"}}>
    </div>
  );
};

export default MapComponent;
