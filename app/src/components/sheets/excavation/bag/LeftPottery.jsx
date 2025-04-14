import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import {
  DescriptionFields
} from 'components/input/excavation/CommonFields';
import {
  InventoryFields,
  BagFields,
} from 'components/input/excavation/BagFields';
import {
  BagdetailFields,
  AnalysisFields
} from 'components/input/excavation/PotteryFields';
import { LeftStack, DataEntry } from "components/layout/Sheets";

const LeftPottery = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.baginfo,
    menuDefs.gendesc,
    menuDefs.bagdetails,
    menuDefs.objectanalysis
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} loading >
      <DataEntry id="baginfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <BagFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="gendesc" >
        <DescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="bagdetails" >
        <BagdetailFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="objectanalysis" >
        <AnalysisFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

export default LeftPottery