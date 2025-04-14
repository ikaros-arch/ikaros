import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography'; 
import { useStore } from 'services/store';
import TableDrawer from 'components/layout/TableDrawer';
import { ReadMap } from 'components/sheets/mima/MimaMap';
import { makeRequest } from 'services/query';
import { Threed } from 'components/sheets/mima/Mima3d';
import { MapIcon } from 'components/LocalIcons';
import { FullPage, PageContent } from 'components/layout/Sheets';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { colDef, standardColDef, jsonColDef } from 'helpers/tableRenders';


const Map = () => {
  let { id } = useParams(); // Grabs the entryID from the URL  
  console.log("Render Map")
  const [places, setPlaces] = useState([]);
  const setTableOpen = useStore(state => state.setTableOpen);
  const setCurrEntryId = useStore(state => state.setCurrEntryId);  

  const apiTable = 'v_place'

  useEffect(() => {
    const getData = async () => {
      const data = await makeRequest('get', `${apiTable}`, {}, {});
      setPlaces(data);
    };   
    getData();
    console.log("Places loaded.")
  }, []);

  useEffect(() => {
    if (id){
      setCurrEntryId(id);
    }
  }, [id]);

  const listColumns = [
    standardColDef('name', 'Name'),
    standardColDef('name_modern', 'Modern Name'),
    standardColDef('place_type', 'Type'),
    colDef.authorities,
    jsonColDef('geojson', 'GeoJSON', 3),  
  ] 

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.threed,
  ];

  return (
    <>
      <header className="w3-container" >
        <Typography variant="h5" gutterBottom >
          <MapIcon /> Map
        </Typography>
        <a href="#" className="w3-bar-item w3-button w3-padding w3-right" type="button" onClick={() => setTableOpen(true)}>
          <i className="fa fa-list fa-fw"></i>  View list
        </a>
      </header>
      <PageContent>
        <FullPage>
        <ReadMap currPlace={id} allPlaces={places} parent={'map'} />
        <Threed />
        </FullPage>
      </PageContent>
      <NavRight menuItems={rightMenuItems} />
      <TableDrawer
        columns={listColumns}
        listTable={apiTable}
      />
    </>
  );
};

export default Map;
