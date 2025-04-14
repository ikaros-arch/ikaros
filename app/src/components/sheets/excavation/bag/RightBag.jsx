import React from 'react';
import { menuDefs } from 'components/layout/NavMenu';
import { RightStack, ScrollSheet } from 'components/layout/Sheets';
import { EditMap } from 'components/sheets/excavation/Map';
import MapComponent from 'components/sheets/excavation/MapTest';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Threed } from 'components/sheets/mima/Mima3d';
import { Images } from 'components/sheets/mima/MimaResources';
import { EditRelationships } from "components/sheets/excavation/Relationships";
import Audit from 'components/sheets/mima/MimaAudit';

const RightBag = ({ currData, setCurrData }) => {
  const staticTable = 'list_trenches';

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.maptest,
    menuDefs.table,
    menuDefs.rel,
    menuDefs.images,
    menuDefs.biblio,
    menuDefs.audit,
    menuDefs.threed,
  ];

  return (
    <RightStack currData={currData} menuItems={rightMenuItems} >
      <EditMap 
        currData={currData}
        setCurrData={setCurrData}
        staticTable={staticTable}
        parent={'bag'}
      />
      <MapComponent />
      <ScrollSheet id="table">
      </ScrollSheet>
      <EditRelationships
        currData={currData}
        parent={'bag'}
      />
      <Images
        parent={'bag'}
      />
      <Bibliography
        currData={currData}
        setCurrData={setCurrData}
        parent={'bag'}
      />
      <Audit
        parent={'bag'}
      />
      <Threed
        currData={currData}
        parent={'bag'}
      />
    </RightStack>
  );
};

export default RightBag;