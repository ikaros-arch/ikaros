import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import { LeftStack, DataEntry } from "components/layout/Sheets";
import {
  InventoryFields,
  DescriptionFields
} from 'components/input/excavation/CommonFields';
import {
  CommonContextFields,
  TruncationFields,
  StructureTypeFields,
  StructureDimensionsFields,
  StructureMaterialsFields,
  StructureMasonryFields,
  StructureExposureFields
} from 'components/input/excavation/ContextFields';


const LeftStructure = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
    menuDefs.physdesc,
    { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'exposuretruncation', title: 'Exposure and Truncation' }
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} loading >
      <DataEntry id="contextinfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <CommonContextFields currData={currData} setCurrData={setCurrData} />
        <StructureTypeFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="gendesc" >
        <DescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="physdesc" >
        <StructureDimensionsFields currData={currData} setCurrData={setCurrData} />
        <StructureMaterialsFields currData={currData} setCurrData={setCurrData} />
        <StructureMasonryFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="exposuretruncation" >
        <StructureExposureFields currData={currData} setCurrData={setCurrData} />
        <TruncationFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};
export default LeftStructure;