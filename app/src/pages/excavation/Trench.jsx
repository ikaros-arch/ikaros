import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import TrenchFields from 'components/input/excavation/TrenchFields';
import { ViewTable } from 'components/layout/Table';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef, linkColDef, dateColDef, colDef } from 'helpers/tableRenders';
import PageHeader from 'components/layout/PageHeader';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { EditMap, OverviewMap } from 'components/sheets/excavation/Map';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Threed } from 'components/sheets/mima/Mima3d';
import { Images } from 'components/sheets/mima/MimaResources';
import Audit from 'components/sheets/mima/MimaAudit';
import { HalfPage, DataEntry, ScrollSheet, LeftStack, RightStack, PageContent } from "components/layout/Sheets";
import { ViewRelationships } from "components/sheets/excavation/Relationships";
import {
  InventoryFields, 
} from 'components/input/excavation/CommonFields';
import { TrenchIcon } from 'components/LocalIcons';

const listTable = 'list_trenches';
const linkColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),
  standardColDef('title', 'Name', 2),
  standardColDef('area', 'Area', 2),
  standardColDef('project', 'Project', 2),
  dateColDef('opened', 'Opened'),
  dateColDef('closed', 'Closed'),
  standardColDef('status', 'Status')
];

const listColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('title', 'Name', 2),
  standardColDef('area', 'Area', 2),
  standardColDef('project', 'Project', 2),
  dateColDef('opened', 'Opened'),
  dateColDef('closed', 'Closed'),
  standardColDef('status', 'Status')
];

const overviewColumns = [
  colDef.uuid,
  linkColDef('uuid'),
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('title', 'Name', 2),
  standardColDef('area', 'Area', 2),
  standardColDef('project', 'Project', 2),
  dateColDef('opened', 'Opened'),
  dateColDef('closed', 'Closed'),
  standardColDef('status', 'Status')
];

const OverviewComp = () => {
  return (
    <ViewTable columns={overviewColumns} listTable={listTable} />
  );
};

const LeftHalf = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
  ];

  return (
    <LeftStack 
      currData={currData} 
      menuItems={leftMenuItems}
      OverviewComp={OverviewComp}
    >
      <DataEntry id="info" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <TrenchFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

const RightHalf = ({ currData, setCurrData }) => {

  const rightMenuOverviewItems = [
    menuDefs.map,
    menuDefs.threed,
  ];

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.rel,
    menuDefs.table,
    menuDefs.images,
    menuDefs.biblio,
    menuDefs.audit,
    menuDefs.threed,
  ];

  const OverviewComp = () => {
    return (
      <>
        <OverviewMap 
          parent={'trench'}
        />
        <ScrollSheet id="3d" >
        </ScrollSheet>
        <NavRight menuItems={rightMenuOverviewItems} />
      </>
    );
  };

  return (
    <RightStack 
      currData={currData}
      menuItems={rightMenuItems}
      OverviewComp={OverviewComp}
    >
      <EditMap 
        currData={currData}
        setCurrData={setCurrData}
        staticTable={listTable}
        parent={'trench'}
      />
      <ViewRelationships
        currData={currData}
        parent={'trench'}
      />
      <ScrollSheet id="table">
        <ViewTable
          columns={linkColumns}
          listTable={currData ? `list_context_parent?trench=eq.${currData.uuid}` : ''}
        />
      </ScrollSheet>
      <Images
        parent={'trench'}
      />
      <Bibliography
        currData={currData}
        setCurrData={setCurrData}
        parent={'trench'}
      />
      <Audit 
        parent={'trench'}
      />
      <Threed 
        currData={currData}
        setCurrData={setCurrData}
        parent={'trench'}
      />
    </RightStack>
  );
};


const Trench = () => {
  let { id } = useParams(); // Grabs the uuid from the URL  
  console.log("Render Trench")
  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currTrench);
  const setCurrData = useStore(state => state.setCurrTrench);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const [dataForDb, setDataForDb] = useState(null);

  const { loadCurrData } = useDataLoader();
  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: 'edit_trench',  
    editTable: 'edit_trench'
  });

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { index_topic_names, keyword_names, tag_names, links, geom, placename, place_authority, ...preppedData } = currData;
      setDataForDb(preppedData);
    }
    if (currData?.uuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]); // This effect runs whenever `currData` changes

  const apiTable = 'edit_trench';

  useEffect(() => {
    loadCurrData(id, apiTable, currData, setCurrData);
    console.log("Load Trench Data for id: ", id);
  }, [id]);

  useEffect(() => {
    console.log("Trench Data: ", currData);
  }, [currData]);

  return (
    <>
      <PageHeader
        IconComponent={TrenchIcon}
        title="Trench Data"
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
        listTable={listTable}
      />
    </>
  );
};

export default Trench;
