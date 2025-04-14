import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import TableDrawer from 'components/layout/TableDrawer';
import { ViewTable } from 'components/layout/Table';
import { standardColDef, dateColDef, linkColDef, colDef } from 'helpers/tableRenders';
import PageHeader from 'components/layout/PageHeader';
import { NavRight, NavLeft, menuDefs } from 'components/layout/NavMenu';
import { PageContent, HalfPage, OverviewSheet, ScrollSheet } from "components/layout/Sheets";
import { OverviewMap } from 'components/sheets/excavation/Map';
import MapComponent from 'components/sheets/excavation/MapTest';
import SubClassPage from 'components/sheets/excavation/SubClassPage';
import LeftPottery from '@/components/sheets/excavation/bag/LeftPottery';
import LeftObsidian from '@/components/sheets/excavation/bag/LeftObsidian';
import LeftAnimalBone from '@/components/sheets/excavation/bag/LeftAnimalBone';
import LeftHumanBone from '@/components/sheets/excavation/bag/LeftHumanBone';
import LeftFish from '@/components/sheets/excavation/bag/LeftFish';
import LeftShell from '@/components/sheets/excavation/bag/LeftShell';
import LeftFlotation from '@/components/sheets/excavation/bag/LeftFlotation';
import LeftSeed from '@/components/sheets/excavation/bag/LeftSeed';
import LeftCharcoal from '@/components/sheets/excavation/bag/LeftCharcoal';
import LeftMicromorphology from '@/components/sheets/excavation/bag/LeftMicromorphology';
import LeftResidue from '@/components/sheets/excavation/bag/LeftResidue';
import LeftRadiocarbon from '@/components/sheets/excavation/bag/LeftRadiocarbon';
import LeftPhytolith from '@/components/sheets/excavation/bag/LeftPhytolith';
import LeftSoilChemistry from '@/components/sheets/excavation/bag/LeftSoilChemistry';
import LeftMetal from '@/components/sheets/excavation/bag/LeftMetal';
import RightBag from 'components/sheets/excavation/bag/RightBag';
import {
  BagIcon,
  PotteryIcon,
  ObsidianIcon,
  AnimalBoneIcon,
  HumanBoneIcon,
  FishIcon,
  ShellIcon,
  FlotationIcon,
  SeedIcon,
  CharcoalIcon,
  MicromorphologyIcon,
  ResidueIcon,
  RadiocarbonIcon,
  PhytolithIcon,
  SoilChemistryIcon,
  MetalIcon
 } from 'components/LocalIcons';
import NewMenu from 'components/buttons/NewMenu';
import { isUUID } from 'helpers/validation';
import { makeRequest } from 'services/query';
import { getAddressString } from 'helpers/transformers';

const typeCol = 'bag_category';
const listTable = 'list_bags';
const apiTable = 'edit_bag';

const listColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('bag_category', 'Category', 2),
  standardColDef('bag_origin', 'Origin', 2),
  standardColDef('context', 'Context', 2),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('phase', 'Phase', 2),
  dateColDef('created_at', 'Created', 'dateTime'),
  standardColDef('status', 'Status')
];

const overviewColumns = [
  colDef.uuid,
  linkColDef('uuid', 'bag_category'),
  standardColDef('identifier', 'Id'),
  standardColDef('bag_category', 'Category', 2),
  standardColDef('bag_origin', 'Origin', 2),
  standardColDef('context', 'Context', 2),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('phase', 'Phase', 2),
  dateColDef('created_at', 'Created', 'dateTime'),
  standardColDef('status', 'Status')
];

const bagConfigs = [
  {
    type: 'Pottery',
    icon: PotteryIcon,
    apiTable: 'edit_bag_pottery',
    leftComponent: LeftPottery,
    listTable: listTable
  },
  {
    type: 'Obsidian',
    icon: ObsidianIcon,
    apiTable: 'edit_bag_obsidian',
    leftComponent: LeftObsidian,
    listTable: listTable
  },
  {
    type: 'Animal Bone',
    icon: AnimalBoneIcon,
    apiTable: 'edit_bag_bone_animal',
    leftComponent: LeftAnimalBone,
    listTable: listTable
  },
  {
    type: 'Hunman Bone',
    icon: HumanBoneIcon,
    apiTable: 'edit_bag_bone_human',
    leftComponent: LeftHumanBone,
    listTable: listTable
  },
  {
    type: 'Fish',
    icon: FishIcon,
    apiTable: 'edit_bag_fish',
    leftComponent: LeftFish,
    listTable: listTable
  },
  {
    type: 'Shell',
    icon: ShellIcon,
    apiTable: 'edit_bag_shell',
    leftComponent: LeftShell,
    listTable: listTable
  },
  {
    type: 'Flotation',
    icon: FlotationIcon,
    apiTable: 'edit_bag_flotation',
    leftComponent: LeftFlotation,
    listTable: listTable
  },
  {
    type: 'Seed',
    icon: SeedIcon,
    apiTable: 'edit_bag_seeds',
    leftComponent: LeftSeed,
    listTable: listTable
  },
  { 
    type: 'Charcoal',
    icon: CharcoalIcon,
    apiTable: 'edit_bag_charcoal',
    leftComponent: LeftCharcoal,
    listTable: listTable
  },
  {
    type: 'Micromorphology',
    icon: MicromorphologyIcon,
    apiTable: 'edit_bag_micromorphology',
    leftComponent: LeftMicromorphology,
    listTable: listTable
  },
  {
    type: 'Residue',
    icon: ResidueIcon,
    apiTable: 'edit_bag_residue',
    leftComponent: LeftResidue,
    listTable: listTable
  },
  {
    type: 'Radiocarbon',
    icon: RadiocarbonIcon,
    apiTable: 'edit_bag_radiocarbon',
    leftComponent: LeftRadiocarbon,
    listTable: listTable
  },
  {
    type: 'Phytolith',
    icon: PhytolithIcon,
    apiTable: 'edit_bag_phytolith',
    leftComponent: LeftPhytolith,
    listTable: listTable
  },
  {
    type: 'Soil Chemistry',
    icon: SoilChemistryIcon,
    apiTable: 'edit_bag_soil_chemistry',
    leftComponent: LeftSoilChemistry,
    listTable: listTable
  },
  {
    type: 'Metal',
    icon: MetalIcon,
    apiTable: 'edit_context_metal',
    leftComponent: LeftMetal,
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
        parent={'bag'}
      />
      <MapComponent />
      <ScrollSheet id="3d">
      </ScrollSheet>
      <NavRight menuItems={rightMenuItems} />
    </div>
  );
};


const Bag = () => {
  let { type, id } = useParams(); // Grabs the uuid from the URL  
  console.log("Render Bag")
  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currBag);
  const setCurrData = useStore(state => state.setCurrBag);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const terms = useStore(state => state.terms);
  const [editTable, setEditTable] = useState(apiTable);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUUID(type)) {
      try {
        const getData = async () => {
          const data = await makeRequest('get', `${listTable}?uuid=eq.${type}&select=${typeCol}`, {}, {});
          const newType = getAddressString(data[0][typeCol]);
          if (newType) {
            navigate(`${newType}/${type}`);
          }
        };
        getData();
      } catch (error) {
        console.error('Could not load data for record:', error);
      }
    };
  }, [type]);

  const bagConfig = bagConfigs.find(config => config.type === type);

  const { loadCurrData } = useDataLoader();
  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,
    editTable: editTable
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

  if (bagConfig) {
    return (
      <SubClassPage
        IconComponent={bagConfig.icon}
        title={bagConfig.type}
        apiTable={bagConfig.apiTable}
        LeftComponent={bagConfig.leftComponent}
        RightComponent={RightBag}
        listTable={bagConfig.listTable}
        listColumns={listColumns}
        subCol={typeCol}
      />
    );
  };

  return (
    <>
      <PageHeader
        IconComponent={BagIcon}
        title="Bag Data"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <HalfPage>
          <OverviewSheet
            NewComp={() => <NewMenu setEditTable={setEditTable} terms={terms.bag_category} parent="bag" />}
          >
            <ScrollSheet id="table">
              <ViewTable
                columns={overviewColumns}
                listTable={listTable}
              />
            </ScrollSheet>
            {isMobile &&
              <NavLeft menuItems={[menuDefs.table]} />
            }
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

export default Bag;
