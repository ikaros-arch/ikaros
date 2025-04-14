import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet.gridlayer.googlemutant';

const GoogleMutantLayer = ({ type = 'satellite' }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create GoogleMutant layer
    const googleLayer = L.gridLayer.googleMutant({
      type: type, // Possible types: roadmap, satellite, hybrid, terrain
    });

    // Add the layer to the map
    map.addLayer(googleLayer);

    return () => {
      // Cleanup on unmount
      map.removeLayer(googleLayer);
    };
  }, [map, type]);

  return null; // As this is a custom layer control, no visual component is returned
};

export default GoogleMutantLayer;
