import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { EntryNavigator } from 'components/buttons/EntryNavigator';
import LitFields from 'components/input/mima/LitFields';
import TableDrawer from 'components/layout/TableDrawer';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { ReadMap } from 'components/sheets/mima/MimaMap';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Images, Documents, Links } from 'components/sheets/mima/MimaResources';
import Relationships from 'components/sheets/mima/MimaRels';
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
  TranslationFields,
  OriginalTextFields,
  CommentaryFields
} from 'components/input/mima/CommonFields';
import {LiteraryIcon } from 'components/LocalIcons';
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
        <LitFields currData={currData} setCurrData={setCurrData} />
        <DatingFields currData={currData} setCurrData={setCurrData} />
        <PrisonFields currData={currData} setCurrData={setCurrData} />
        <AMIFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="translation" rolling >
        <TranslationFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="original" rolling >
        <OriginalTextFields currData={currData} setCurrData={setCurrData} />
        <InventoryFields currData={currData} setCurrData={setCurrData}/>
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
    menuDefs.map,
    menuDefs.rel,
    menuDefs.links,
    menuDefs.documents,
    menuDefs.biblio,
    menuDefs.images,
  ];

  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <ReadMap 
        currPlace={currPlace}
        parent={'literary'}
      />
      <div className="thirtyheight">
        <Grid container spacing={2} paddingTop={2} > 
          <PlaceFields currData={currData} setCurrData={setCurrData} />
        </Grid>
      </div>
      <Relationships
        currUUID={currUUID}
        parent={'literary'}
      />
      <Links
        parent={'literary'}
      />
      <Documents
        parent={'literary'}
      />   
      <Bibliography
        currUUID={currUUID}
        currBiblio={currBiblio}
        parent={'literary'}
      />
      <Images
        parent={'literary'}
      />
{ userRole === 'admin' && (
      <Audit 
        parent={'literary'}
      />
)}
    </RightStack>
  );
};

const Literary = () => {
  let { id } = useParams(); // Grabs the entryID from the URL  
  console.log("Render Literary");

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currLit);
  const setCurrData = useStore(state => state.setCurrLit);
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
  }, [currData]);


  const apiTable = 'v_literary';

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: apiTable,
    editTable: 'edit_literary'
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
    standardColDef('lit_author', 'Author', 2),
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
        IconComponent={LiteraryIcon}
        title="Literary Sources"
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
        listTable={'list_literary'}
        idCol={idCol}
      />
      <EntryNavigator
        navigate={navigate}
        entryId={id}
      />
    </>
  );
};

export default Literary;
