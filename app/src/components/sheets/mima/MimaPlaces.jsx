import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import CrudButtons from 'components/buttons/DesktopCrudButtons';
import { PlaceFields } from 'components/input/VocabFields';
import RecordsTable from 'components/VocabRecords';
import Audit from 'components/sheets/mima/MimaAudit';
import { HalfPage, ScrollSheet } from 'components/layout/Sheets';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { SearchTable } from 'components/layout/Table';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { EditMap } from 'components/sheets/mima/MimaMap';
import { makeRequest } from 'services/query';

const LeftHalf = ({ currData, setCurrData }) => {
  return (
    <HalfPage>
      <Typography variant="h6" >
          Places
      </Typography>
      { !currData ?
        <ScrollSheet id="place">
          <CrudButtons rowSelected={false} />
        </ScrollSheet>
        :
        <>
          <ScrollSheet id="place">
            <PlaceFields 
              currData={currData} 
              setCurrData={setCurrData} 
            />
          </ScrollSheet>
          <CrudButtons rowSelected={true} />
        </>
      }
    </HalfPage>
  );
};

const RightHalf = ({ currData, setCurrData, apiTable }) => {
  const userRole = useStore(state => state.userRole);

  const listColumns = [
    colDef.uuid,
    colDef.name,
    standardColDef('place_type', 'Type'),
    colDef.authorities,
  ];

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.records,
    { iconClass: 'fa fa-search fa-fw', scrollTarget: 'table', title: 'Search Places' },
  ];

  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  };

  if (!currData) {
    return (
      <HalfPage>
        <ScrollSheet id="table">
          <SearchTable 
            searchCol={'name'}
            columns={listColumns}
            apiTable={apiTable}
          />
        </ScrollSheet>
      </HalfPage>
    )
  }

  return (
    <HalfPage>
      <EditMap 
        currData={currData}
        setCurrData={setCurrData}
        parent={'place'}
      />
      <ScrollSheet id="records">
        <RecordsTable 
          currData={currData} 
          parent={'place'}
        />
      </ScrollSheet>
      <ScrollSheet id="table">
        <SearchTable 
          searchCol={'name'}
          columns={listColumns}
          apiTable={apiTable}
        />
      </ScrollSheet>
{ userRole === 'admin' && (
      <Audit 
        parent={'place'}
      />
)}
      <NavRight menuItems={rightMenuItems} />
    </HalfPage> 
  );
};

const Places = () => {
  console.log("Render Places");

  let { id } = useParams(); // Grabs the entryID from the URL

  const currData = useStore(state => state.currPlace);
  const setCurrData = useStore(state => state.setCurrPlace);
  const [dataForDb, setDataForDb] = useState(null);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);


  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { geojson, ...preppedData } = currData;
      setDataForDb(preppedData);
    };
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
    console.log("Data in currData updated:", currData);
  }, [currData]); // This effect runs whenever `currData` changes

  const apiTable = 'v_place';
  const editTable = 'edit_place';


  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0]);
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: apiTable,  
    editTable: editTable
  });

  return (
    <>
      <LeftHalf 
        currData={currData}
        setCurrData={setCurrData}
      />
      <RightHalf 
        currData={currData}
        setCurrData={setCurrData}
        apiTable={apiTable}
      />
    </>
  );
};

export default Places;