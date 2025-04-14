import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import {
  InventoryFields,
  DescriptionFields
} from 'components/input/excavation/CommonFields';
import {
  CommonContextFields,
  CutShapeFields
} from 'components/input/excavation/ContextFields';
import { LeftStack, DataEntry } from "components/layout/Sheets";

const LeftCut = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
    menuDefs.shape,
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} loading >
      <DataEntry id="contextinfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <CommonContextFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="gendesc" >
        <DescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="shape" >
        <CutShapeFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

export default LeftCut