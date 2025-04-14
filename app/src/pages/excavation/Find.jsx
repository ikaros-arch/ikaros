import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import { 
  FindFields, 
  InventoryFields, 
  DescriptionFields,
  FindDimensionsFields,
  SpecialistFields,
} from 'components/input/excavation/FindFields';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef, dateColDef, colDef } from 'helpers/tableRenders';
import PageHeader from 'components/layout/PageHeader';
import { menuDefs } from 'components/layout/NavMenu';
import { EditMap } from 'components/sheets/excavation/Map';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Threed } from 'components/sheets/mima/Mima3d';
import { Images } from 'components/sheets/mima/MimaResources';
import Audit from 'components/sheets/mima/MimaAudit';
import { PageContent, HalfPage, LeftStack, DataEntry, RightStack } from "components/layout/Sheets";
import { ViewRelationships } from "components/sheets/excavation/Relationships";
import { FindIcon } from 'components/LocalIcons';


const LeftHalf = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
    menuDefs.spesdesc,
    menuDefs.physdesc,
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} >
      <DataEntry id="contextinfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <FindFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="gendesc" >
        <DescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="spesdesc" >
        <SpecialistFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="physdesc" >
        <FindDimensionsFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

const RightHalf = ({ currData, setCurrData }) => {
  const [staticTable, setStaticTable] = useState(null);

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.rel,
    menuDefs.images,
    menuDefs.biblio,
    menuDefs.audit,
    menuDefs.threed,
  ];
  
  useEffect(() => {
    if (currData?.trench) {
      setStaticTable(`list_trenches?uuid=eq.${currData?.trench}`);
    }
  }, [currData]);

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <EditMap 
        currData={currData}
        setCurrData={setCurrData}
        staticTable={staticTable}
        parent={'find'}
      />
      <ViewRelationships
        currData={currData}
        parent={'find'}
      />
      <Images
        parent={'find'}
      />
      <Bibliography
        currData={currData}
        setCurrData={setCurrData}
        parent={'find'}
      />
      <Audit 
        parent={'find'}
      />
      <Threed 
        currData={currData}
        setCurrData={setCurrData}
        parent={'find'}
      />
    </RightStack>
  );
};


const Find = () => {
  let { id } = useParams(); // Grabs the uuid from the URL
  console.log("Render Find")
  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currFind);
  const setCurrData = useStore(state => state.setCurrFind);
  const setCurrUuid = useStore(state => state.setCurrUuid);

  const { loadCurrData } = useDataLoader();
  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: 'edit_find',
    editTable: 'edit_find'
  });

  //Preparing object for writing to database
  useEffect(() => {
    if (currData?.uuid) {
      setCurrUuid(currData.uuid);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  const apiTable = 'edit_find'

  useEffect(() => {
    loadCurrData(id, apiTable, currData, setCurrData);
  }, [id]);

  const listColumns = [
    colDef.uuid,
    standardColDef('identifier', 'Id'),
    standardColDef('artefact_category', 'Category', 2),
    standardColDef('context', 'Context', 2),
    standardColDef('trench', 'Trench', 2),
    standardColDef('phase', 'Phase', 2),
    dateColDef('created_at', 'Created', 'dateTime'),
    standardColDef('status', 'Status')
  ];

  return (
    <>
      <PageHeader
        IconComponent={FindIcon}
        title="Find Data"
        setTableOpen={setTableOpen}
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
        listTable={'list_finds'}
      />
    </>
  );
};

export default Find;
