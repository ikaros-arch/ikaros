import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import { 
  TopoFields, 
  InventoryFields,
} from 'components/input/excavation/TopoFields';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef, linkColDef, colDef } from 'helpers/tableRenders';
import { SelectTable, ViewTable } from 'components/layout/Table';
import PageHeader from 'components/layout/PageHeader';
import { menuDefs } from 'components/layout/NavMenu';
import { EditMap, OverviewMap } from 'components/sheets/excavation/Map';
import { Images } from 'components/sheets/mima/MimaResources';
import { PageContent, HalfPage, LeftStack, DataEntry, RightStack, OverviewSheet, ScrollSheet } from "components/layout/Sheets";
import { TopoIcon } from 'components/LocalIcons';

const apiTable = 'edit_topo'
const listTable = 'list_topo'

const listColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('topo_point_type', 'Type', 2),
  standardColDef('status', 'Status'),
  standardColDef('area', 'Area', 2),
  standardColDef('trench', 'Trench', 2),
];

const overviewColumns = [
  colDef.uuid,
  linkColDef('uuid'),
  standardColDef('identifier', 'Id'),
  standardColDef('topo_point_type', 'Type', 2),
  standardColDef('status', 'Status'),
  standardColDef('area', 'Area', 2),
  standardColDef('trench', 'Trench', 2),
];

const LeftHalf = ({ currData, setCurrData }) => {

  return (
    <LeftStack currData={currData} >
      <DataEntry id="contextinfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <TopoFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

const RightHalf = ({ currData, setCurrData }) => {
  const [staticTable, setStaticTable] = useState(null);
  const [loading, setLoading] = useState(false);

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.table,
    menuDefs.images,
  ];
  
  useEffect(() => {
    if (currData?.trench) {
      setStaticTable(`list_trenches?uuid=eq.${currData?.trench}`);
    }
  }, [currData]);

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} OverviewComp={OverviewMap}>
      <EditMap 
        currData={currData}
        setCurrData={setCurrData}
        staticTable={staticTable}
        parent={'topo'}
      />
      <ScrollSheet id="table">
        <ViewTable
        columns={overviewColumns}
        listTable={listTable}
        loading={loading}
        setLoading={setLoading}
        />
      </ScrollSheet>
      <Images
        parent={'topo'}
      />
    </RightStack>
  );
};

const Topo = () => {
  let { id } = useParams(); // Grabs the uuid from the URL  
  console.log("Render Topo")
  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currTopo);
  const setCurrData = useStore(state => state.setCurrTopo);
  const setCurrUuid = useStore(state => state.setCurrUuid);

  const { loadCurrData } = useDataLoader();
  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: 'edit_topo',  
    editTable: 'edit_topo'
  });

  //Preparing object for writing to database
  useEffect(() => {
    if (currData?.uuid) {
      setCurrUuid(currData.uuid);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  useEffect(() => {
    loadCurrData(id, apiTable, currData, setCurrData);
  }, [id]);


  return (
    <>
      <PageHeader
        IconComponent={TopoIcon}
        title="Topo Data"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <HalfPage>
          { id ?
          <LeftHalf currData={currData} setCurrData={setCurrData} />
            :
            <OverviewSheet>
              <ViewTable
                columns={overviewColumns}
                listTable={listTable}
              />
            </OverviewSheet>
          }
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

export default Topo;
