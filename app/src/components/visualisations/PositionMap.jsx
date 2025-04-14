import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap  } from 'react-leaflet'
import Paper from "@mui/material/Paper";

function RecordedPositionMap({ position }) {
  
	const [leafletCoords, setLeafletCoords] = useState([0,0]);

	useEffect(() => {
    	if (position) {
    		setLeafletCoords(position.geometry.coordinates.reverse())
		}
	}, [position]);


	const UpdateView = ({coords}) => {
  		const map = useMap();
  		map.setView(coords, 17); // Your preferred zoom level
  		return null;
	}

  return (

    	<Paper 
      	elevation={1}
      	sx={{ 
        	display: 'flex',
        	justifyContent: 'center', 
        	alignItems: 'center',
        	width: '100%',
        	height: '100%'
      	}}
    	>
      		<MapContainer 
        		style={{ height: "100%", width: "100%" }}
        		center={position ? leafletCoords : [37, 25.5]}
        		zoom={13} 
        	>
        		<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        		{position && (
          		<>
            		<Marker position={leafletCoords} />
            		<Circle 
              		center={leafletCoords} 
              		radius={position.properties.accuracy}
            		/>
            		<UpdateView coords={leafletCoords} />
          		</>
        		)}
      		</MapContainer>
    	</Paper>

  );
}

export default RecordedPositionMap