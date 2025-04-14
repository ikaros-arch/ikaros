import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { EntryNavigator } from 'components/buttons/EntryNavigator';
import VisFields from 'components/input/mima/VisFields';
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
  InventoryFields,
  DatingFields,
  PlaceFields,
  AMIFields,
  BookFields,
  OriginalTextFields,
  TranslationFields,
  CommentaryFields
} from 'components/input/mima/CommonFields';
import { VisualIcon } from 'components/LocalIcons';
import { makeRequest } from 'services/query';
import PageHeader from 'components/layout/PageHeader';


const LeftHalf = ({ currData, setCurrData }) => {
  const leftMenuItems = [
    menuDefs.info,
    menuDefs.commentary,
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} >
      <DataEntry id="info" rolling >
        <IdFields currData={currData} setCurrData={setCurrData} />
        <InventoryFields currData={currData} setCurrData={setCurrData}/>
        <VisFields currData={currData} setCurrData={setCurrData} />
        <DatingFields currData={currData} setCurrData={setCurrData} />
        <AMIFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="commentary" >
        <CommentaryFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      {false &&
      <DataEntry id="book" >
        <BookFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      }
    </LeftStack>
  );
};

const RightHalf = ({ currData, setCurrData }) => {
  const currUUID = useMemo(() => currData?.uuid, [currData?.uuid]);
  const currPlace = useMemo(() => currData?.place, [currData?.place]);
  const currBiblio = useMemo(() => currData?.bibliography, [currData?.bibliography]);
  const userRole = useStore(state => state.userRole);

  const rightMenuItems = [
    menuDefs.images,
    menuDefs.threed,
    menuDefs.map,
    menuDefs.rel,
    menuDefs.links,
    menuDefs.documents,
    menuDefs.biblio,
  ];

  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <Images
        parent={'visual'}
      />
      <Threed 
        currUUID={currUUID}
        parent={'visual'}
      />
      <ReadMap 
        currPlace={currPlace}
        parent={'visual'}
      />
      <div className="thirtyheight">
        <Grid container spacing={2} paddingTop={2} > 
          <PlaceFields currData={currData} setCurrData={setCurrData} />
        </Grid>
      </div>  
      <Relationships
        currUUID={currUUID}
        parent={'visual'}
      />
      <Links
        parent={'visual'}
      />
      <Documents
        parent={'visual'}
      />   
      <Bibliography
        currBiblio={currBiblio}
        currUUID={currUUID}
        parent={'visual'}
      />
{ userRole === 'admin' && (
        <Audit 
          parent={'visual'}
        />
)}
    </RightStack>
  );
};

const Visual = () => {
  let { id } = useParams(); // Grabs the entryID from the URL  
  console.log("Render Visual");

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currViz);
  const setCurrData = useStore(state => state.setCurrViz);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);
  const setCurrEntryId = useStore(state => state.setCurrEntryId);
  
  const [dataForDb, setDataForDb] = useState(null);

  const navigate = useNavigate();

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { index_topic_names, keyword_names, tag_names, prison_type_name, links, geom, placename, place_authority, ...preppedData } = currData;
      setDataForDb(preppedData);
    };
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]); // This effect runs whenever `currData` changes

  const apiTable = 'v_visual';

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: 'v_visual',
    editTable: 'edit_visual'
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
    colDef.completeBool,
  ];

  return (
    <>
      <PageHeader
        IconComponent={VisualIcon}
        title="Visual Sources"
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
        listTable={'list_visual'}
        idCol={idCol}
      />
      <EntryNavigator
        navigate={navigate}
        entryId={id}
      />
    </>
  );
};

export default Visual;
