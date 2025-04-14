import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import CrudButtons from 'components/buttons/DesktopCrudButtons';
import { ActorFields } from 'components/input/VocabFields';
import Audit from 'components/sheets/mima/MimaAudit';
import Orcid from 'components/sheets/mima/MimaOrcid';
import { HalfPage, ScrollSheet } from 'components/layout/Sheets';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { SelectTable } from 'components/layout/Table';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { makeRequest } from 'services/query';


const Actors = () => {
  console.log("Render Actors")

  let { id } = useParams(); // Grabs the entryID from the URL  

  const currData = useStore(state => state.currActor);
  const setCurrData = useStore(state => state.setCurrActor);
  const [loading, setLoading] = useState(false);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);
  const userRole = useStore(state => state.userRole);

  const currOrcid = useMemo(() => currData?.orcid, [currData?.orcid]);
  
  const apiTable = 'edit_actor'

  const rightMenuItems = [
    menuDefs.table,
    menuDefs.orcid,
  ];
  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  useEffect(() => {
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]);

  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,  
    editTable: apiTable
  });

  const listColumns = [
    colDef.uuid,
    colDef.name,
    standardColDef('initials', 'Initials'),
    standardColDef('orcid', 'ORCID ID'),
  ]

  if (!currData) {
    return (
      <>
        <HalfPage>
          <Typography variant="h6" >
              Actors
          </Typography>
          <ScrollSheet id="actor">
            <CrudButtons rowSelected={false} />
          </ScrollSheet>
        </HalfPage>
        <HalfPage>
          <ScrollSheet id="table">
            <SelectTable
              columns={listColumns}
              listTable={apiTable}
              loading={loading}
              setLoading={setLoading}
            />
          </ScrollSheet>
        </HalfPage>
      </>
    );
  }

  return (
    <>
      <HalfPage>
        <Typography variant="h6" >
            Actors
        </Typography>
          <div className="fill-most" id="actor">
            <ActorFields currData={currData} setCurrData={setCurrData} />
          </div>
          <CrudButtons rowSelected={true} />
      </HalfPage>
      <HalfPage>
        <ScrollSheet id="table">
          <SelectTable
            columns={listColumns}
            listTable={apiTable}
            loading={loading}
            setLoading={setLoading}
          />
        </ScrollSheet>
        <Orcid 
          orcid={currOrcid}
          parent={'actor'}
        />
{ userRole === 'admin' && (
        <Audit 
          parent={'actor'}
        />
)}
        <NavRight menuItems={rightMenuItems} />
      </HalfPage>
    </>
  );
};

export default Actors;