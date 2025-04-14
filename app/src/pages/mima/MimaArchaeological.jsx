import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { EntryNavigator } from 'components/buttons/EntryNavigator';
import ArchFields from 'components/input/mima/ArchFields';
import TableDrawer from 'components/layout/TableDrawer';
import { colDef } from 'helpers/tableRenders';
import { ReadMap } from 'components/sheets/mima/MimaMap';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Images, Documents, Links, Threed } from 'components/sheets/mima/MimaResources';
import Relationships from 'components/sheets/mima/MimaRels';
import Audit from 'components/sheets/mima/MimaAudit';
import { PageContent, HalfPage, LeftStack, RightStack, DataEntry } from 'components/layout/Sheets';
import { menuDefs } from 'components/layout/NavMenu';
import {
  IdFields,
  DatingFields, 
  PlaceFields, 
  PrisonFields,
  AMIFields,
  CommentaryFields
} from 'components/input/mima/CommonFields';
import { ArchIcon } from 'components/LocalIcons';
import { makeRequest } from 'services/query';
import PageHeader from 'components/layout/PageHeader';

const LeftHalf = ({ currData, setCurrData }) => {
  const leftMenuItems = [
    menuDefs.info,
    menuDefs.commentary,
    { iconClass: 'fa fa-tags fa-fw', scrollTarget: 'arch', title: 'Field data' },
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} >
      <DataEntry id="info" rolling >
        <IdFields currData={currData} setCurrData={setCurrData}/>
      </DataEntry>
      <DataEntry id="commentary" rolling >
        <CommentaryFields currData={currData} setCurrData={setCurrData} />
      </DataEntry> 
      <DataEntry id="arch" >
        <ArchFields currData={currData} setCurrData={setCurrData} />
        <DatingFields currData={currData} setCurrData={setCurrData} />
        <PrisonFields currData={currData} setCurrData={setCurrData} />
        <AMIFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

const RightHalf = ({ currData, setCurrData }) => {
  const currUUID = useMemo(() => currData?.uuid, [currData?.uuid]);
  const currPlace = useMemo(() => currData?.place, [currData?.place]);
  const currBiblio = useMemo(() => currData?.bibliography, [currData?.bibliography]);
  const userRole = useStore(state => state.userRole);

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.threed,
    menuDefs.rel,
    menuDefs.links,
    menuDefs.images,
    menuDefs.documents,
    menuDefs.biblio,
  ];

  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <ReadMap 
        currPlace={currPlace}
        parent={'archaeological'}
      />
      <div className="thirtyheight">
        <Grid container spacing={2} paddingTop={2} > 
          <PlaceFields currData={currData} setCurrData={setCurrData} />
        </Grid>
      </div>
      <Threed 
        parent={'archaeological'}
      />
      <Relationships
        currUUID={currUUID}
        parent={'archaeological'}
      />
      <Links
        parent={'archaeological'}
      />
      <Images
        parent={'archaeological'}
      />
      <Documents
        parent={'archaeological'}
      />
      <Bibliography
        currBiblio={currBiblio}
        currUUID={currUUID}
        parent={'archaeological'}
      />
{ userRole === 'admin' && (
      <Audit 
        parent={'archaeological'}
      />
)}
    </RightStack>
  );
};


const Archaeological = () => {
  let { id } = useParams(); // Grabs the entryID from the URL  
  console.log("Render Archaeological");

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currArch);
  const setCurrData = useStore(state => state.setCurrArch);
  const storedUuid = useStore(state => state.currUuid);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const setCurrEntryId = useStore(state => state.setCurrEntryId);  
  const [dataForDb, setDataForDb] = useState(null);

  const navigate = useNavigate();

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { index_topic_names, keyword_names, tag_names, prison_type_name, links, geom, placename, place_authority, ...preppedData } = currData;
      setDataForDb(preppedData);
    }
    if (currData?.uuid && currData.uuid !== storedUuid) {
      console.log("Set UUID: " + currData.uuid);
      console.log("Stored UUID: " + storedUuid);
      setCurrUuid(currData.uuid);
    }
  }, [currData]);

  const apiTable = 'v_archaeological';

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: 'v_archaeological',
    editTable: 'edit_archaeological'
  });

  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?entry_id=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
      setCurrEntryId(id);
    } else if(currData){
      navigate(currData.entry_id)
    } else {
      setTableOpen(true)
    }
  }, [id]);

  const idCol = 'entry_id';

  const listColumns = [
    colDef.uuid,
    colDef.id,
    colDef.entryName,
    colDef.placeName,
    colDef.dateStart,
    colDef.dateEnd,
    colDef.indexTopics,
    colDef.tags,
    colDef.visitedBool,
    colDef.completeBool,
  ];

  return (
    <>
      <PageHeader
        IconComponent={ArchIcon}
        title="Archaeological Sources"
        setTableOpen={setTableOpen}
        currData={currData}
      />
      <PageContent>
        <HalfPage>
          <LeftHalf currData={currData} setCurrData={setCurrData} />
        </HalfPage>
        <HalfPage>
          <RightHalf currData={currData} setCurrData={setCurrData} />
        </HalfPage>
      </PageContent>
      <TableDrawer
        columns={listColumns}
        listTable={'list_archaeological'}
        idCol={idCol}
      />
      <EntryNavigator
        navigate={navigate}
        entryId={id}
      />
    </>
  );
};

export default Archaeological;
