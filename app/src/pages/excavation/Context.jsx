import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from 'services/store';
import PageHeader from 'components/layout/PageHeader';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef, colDef, linkColDef } from 'helpers/tableRenders';
import SubClassPage from '@/components/sheets/excavation/SubClassPage';
import RightContext from 'components/sheets/excavation/context/RightContext';
import LeftFillDeposit from 'components/sheets/excavation/context/LeftFillDeposit';
import LeftCut from 'components/sheets/excavation/context/LeftCut';
import LeftSurface from 'components/sheets/excavation/context/LeftSurface';
import LeftStructure from 'components/sheets/excavation/context/LeftStructure';
import { PageContent, HalfPage, OverviewSheet, ScrollSheet } from "components/layout/Sheets";
import { ContextIcon } from 'components/LocalIcons';
import { ViewTable } from 'components/layout/Table';
import { isUUID } from 'helpers/validation';
import { makeRequest } from 'services/query';
import MapComponent from 'components/sheets/excavation/MapTest';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { OverviewMap } from 'components/sheets/excavation/Map';


const listTable = 'list_context_parent';

const listColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('title', 'Name', 2),
  standardColDef('context_type', 'Type', 2),
  standardColDef('context_shape', 'Shape'),
  standardColDef('status', 'Status')
];

const overviewColumns = [
  colDef.uuid,
  linkColDef('uuid', 'context_type'),
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('title', 'Name', 2),
  standardColDef('context_type', 'Type', 2),
  standardColDef('context_shape', 'Shape'),
  standardColDef('status', 'Status')
];

const contextConfigs = [
  {
    type: 'Fill',
    icon: ContextIcon,
    apiTable: 'edit_context_filldeposit',
    leftComponent: LeftFillDeposit,
    listTable: listTable
  },
  {
    type: 'Deposit',
    icon: ContextIcon,
    apiTable: 'edit_context_filldeposit',
    leftComponent: LeftFillDeposit,
    listTable: listTable
  },
  {
    type: 'Cut',
    icon: ContextIcon,
    apiTable: 'edit_context_cut',
    leftComponent: LeftCut,
    listTable: listTable
  },
  {
    type: 'Surface',
    icon: ContextIcon,
    apiTable: 'edit_context_surface',
    leftComponent: LeftSurface,
    listTable: listTable
  },
  {
    type: 'Structure',
    icon: ContextIcon,
    apiTable: 'edit_context_structure',
    leftComponent: LeftStructure,
    listTable: listTable
  }
];


const RightOverview = () => {
  
  const rightMenuItems = [
    menuDefs.map,
    menuDefs.maptest,
    menuDefs.threed,
  ];

  return (
    <div className="fill-most" >
      <OverviewMap 
        parent={'context'}
      />
      <MapComponent />
      <ScrollSheet id="3d">
      </ScrollSheet>
      <NavRight menuItems={rightMenuItems} />
    </div>
  );
};

const Context = () => {
  console.log("Render Context");

  let { type, id } = useParams();
  const setTableOpen = useStore(state => state.setTableOpen);
  const navigate = useNavigate();

  const typeCol = 'context_type';

  console.log("Context type: ", type);
  console.log("Context id: ", id);

  useEffect(() => {
    if (isUUID(type)) {
      try {
        const getData = async () => {
          const data = await makeRequest('get', `${listTable}?uuid=eq.${type}&select=${typeCol}`, {}, {});
          const newType = data[0][typeCol];
          navigate(`${newType}/${type}`);
        };
        getData();
      } catch (error) {
        console.error('Could not load data for record:', error);
      }
    };
  }, [type]);

  const contextConfig = contextConfigs.find(config => config.type === type);

  if (contextConfig) {
    return (
      <SubClassPage
        IconComponent={contextConfig.icon}
        title={contextConfig.type}
        apiTable={contextConfig.apiTable}
        LeftComponent={contextConfig.leftComponent}
        RightComponent={RightContext}
        listTable={contextConfig.listTable}
        listColumns={listColumns}
        subCol={typeCol}
      />
    );
  };

  return (
    <>
      <PageHeader
        IconComponent={ContextIcon}
        title="Context Data"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <HalfPage>
          <OverviewSheet>
            <ViewTable
              columns={overviewColumns}
              listTable={listTable}
            />
          </OverviewSheet>
        </HalfPage>
        <HalfPage>
          <RightOverview />
        </HalfPage>
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={listTable}
        subCol={typeCol}
      />
    </>
  );
};

export default Context;
