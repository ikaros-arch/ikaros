import React from 'react';

import { menuDefs } from 'components/layout/NavMenu';
import { LeftStack, DataEntry } from "components/layout/Sheets";
import {
  InventoryFields,
  DescriptionFields,
} from 'components/input/excavation/CommonFields';
import {
  CommonContextFields,
  SlopeDescriptionFields,
  SoilColourFields,
  CompositionCompactionFields,
  SoilInclusionsFields,
  PotInterpretationFields,
  MicromorphologyFields,
  ContextDescriptionFields
} from 'components/input/excavation/ContextFields';


const LeftFillDeposit = ({ currData, setCurrData }) => {

  const leftMenuItems = [
    menuDefs.contextinfo,
    menuDefs.gendesc,
    menuDefs.spesdesc,
    { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'morphology',  title: 'Morphology' },
    { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'inclusions', title: 'Inclusions' },
    { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'contextdesc', title: 'Context Description' }
  ];

  return (
    <LeftStack currData={currData} menuItems={leftMenuItems} loading>
      <DataEntry id="contextinfo" >
        <InventoryFields currData={currData} setCurrData={setCurrData} />
        <CommonContextFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="gendesc" >
        <DescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="spesdesc" >
        <PotInterpretationFields currData={currData} setCurrData={setCurrData} />
        <MicromorphologyFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="morphology" >
        <SlopeDescriptionFields currData={currData} setCurrData={setCurrData} />
        <SoilColourFields currData={currData} setCurrData={setCurrData} />
        <CompositionCompactionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="inclusions" >
        <SoilInclusionsFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
      <DataEntry id="contextdesc" >
        <ContextDescriptionFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};

export default LeftFillDeposit