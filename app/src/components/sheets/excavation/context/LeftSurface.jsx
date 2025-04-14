import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import { LeftStack, DataEntry } from "components/layout/Sheets";
import {
  InventoryFields,
  DescriptionFields
} from 'components/input/excavation/CommonFields';
import {
  CommonContextFields,
  SurfaceShapeFields,
  TruncationFields,
  PotInterpretationFields,
} from 'components/input/excavation/ContextFields';


const LeftSurface = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
    menuDefs.spesdesc,
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
      <DataEntry id="spesdesc" >
        <PotInterpretationFields currData={currData} setCurrData={setCurrData} />
        <TruncationFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="shape" >
        <SurfaceShapeFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

export default LeftSurface;