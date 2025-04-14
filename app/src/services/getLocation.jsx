const getGeoJsonPosition = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geojson = {
            type: "Feature",
            properties: {
              accuracy: position.coords.accuracy
            },
            geometry: {
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
          };
          resolve(geojson);
        },
        reject,
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
};

export default getGeoJsonPosition;
