import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import {
  DescriptionFields
} from 'components/input/excavation/CommonFields';
import {
  InventoryFields,
  BagFields
} from 'components/input/excavation/BagFields';
import { LeftStack, DataEntry } from "components/layout/Sheets";

const LeftMetal = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.baginfo,
    menuDefs.gendesc,
    menuDefs.bagdetails,
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
      </DataEntry>
    </LeftStack>
  );
};

export default LeftMetal;