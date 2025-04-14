import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { EntryNavigator } from 'components/buttons/EntryNavigator';
import DocFields from 'components/input/mima/DocFields';
import TableDrawer from 'components/layout/TableDrawer';
import { colDef } from 'helpers/tableRenders';
import { ReadMap } from 'components/sheets/mima/MimaMap';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import Relationships from 'components/sheets/mima/MimaRels';
import { Images, Documents, Links, Threed } from 'components/sheets/mima/MimaResources';
import Audit from 'components/sheets/mima/MimaAudit';
import { PageContent, HalfPage, LeftStack, RightStack, DataEntry } from 'components/layout/Sheets';
import { menuDefs } from 'components/layout/NavMenu';
import {
  IdFields,
  InventoryFields,
  DatingFields,
  PlaceFields,
  PrisonFields,
  AMIFields,
  BookFields,
  OriginalTextFields,
  TranslationFields,
  CommentaryFields
} from 'components/input/mima/CommonFields';
import { DocumentaryIcon } from 'components/LocalIcons';
import { makeRequest } from 'services/query';
import PageHeader from 'components/layout/PageHeader';


const LeftHalf = ({ currData, setCurrData }) => {
  const leftMenuItems = [
    menuDefs.info,
    menuDefs.translation,
    menuDefs.original,
    menuDefs.commentary,
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} >
      <DataEntry id="info" rolling >
        <IdFields currData={currData} setCurrData={setCurrData} />
        <InventoryFields currData={currData} setCurrData={setCurrData}/>
        <DocFields currData={currData} setCurrData={setCurrData} />
        <DatingFields currData={currData} setCurrData={setCurrData} />
        <PrisonFields currData={currData} setCurrData={setCurrData} />
        <AMIFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="translation" rolling >
        <TranslationFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="original" rolling >
        <OriginalTextFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="commentary" >
        <CommentaryFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      {false &&
      <DataEntry id="book">
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
    menuDefs.map,
    menuDefs.rel,
    menuDefs.links,
    menuDefs.images,
    menuDefs.documents,
    menuDefs.biblio,
    menuDefs.threed,
  ];
  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <ReadMap 
        currPlace={currPlace}
        parent={'documentary'}
      />
      <div className="thirtyheight">
        <Grid container spacing={2} paddingTop={2} > 
          <PlaceFields currData={currData} setCurrData={setCurrData} />
        </Grid>
      </div>
      <Relationships
        currUUID={currUUID}
        parent={'documentary'}
      />
      <Links
        parent={'documentary'}
      />
      <Images
        parent={'documentary'}
      />
      <Documents
        parent={'documentary'}
      />
      <Bibliography
        currBiblio={currBiblio}
        currUUID={currUUID}
        parent={'documentary'}
      />
      <Audit 
        parent={'documentary'}
      />
      <Threed 
        currUUID={currUUID}
        parent={'documentary'}
      />
{ userRole === 'admin' && (
      <Audit 
        parent={'documentary'}
      />
)}
    </RightStack>
  );
};

const Documentary = () => {
  let { id } = useParams(); // Grabs the entryID from the URL  
  console.log("Render Documentary");

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currDoc);
  const setCurrData = useStore(state => state.setCurrDoc);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);
  const setCurrEntryId = useStore(state => state.setCurrEntryId);

  const [dataForDb, setDataForDb] = useState(null);

  const navigate = useNavigate();

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { index_topic_names, keyword_names, tag_names, prison_type_name, links, doc_support_name, doc_type_name, geom, placename, place_authority, ...preppedData } = currData;
      setDataForDb(preppedData);
    }
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]);

  const apiTable = 'v_documentary';

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: apiTable,
    editTable: 'edit_documentary'
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
        IconComponent={DocumentaryIcon}
        title="Documentary Sources"
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
        listTable={'list_documentary'}
        idCol={idCol}
      />
      <EntryNavigator
        navigate={navigate}
        entryId={id}
      />
    </>
  );
};

export default Documentary;
