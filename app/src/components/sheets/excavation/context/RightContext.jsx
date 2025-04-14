import React from 'react';
import { menuDefs } from 'components/layout/NavMenu';
import { RightStack, ScrollSheet } from 'components/layout/Sheets';
import { EditMap } from 'components/sheets/excavation/Map';
import MapComponent from 'components/sheets/excavation/MapTest';
import { Bibliography } from 'components/sheets/mima/MimaBibliography';
import { Threed } from 'components/sheets/mima/Mima3d';
import { Images } from 'components/sheets/mima/MimaResources';
import { EditRelationships } from "components/sheets/excavation/Relationships";
import { EditASUs } from "components/sheets/excavation/context/ASUs";
import Audit from 'components/sheets/mima/MimaAudit';

const RightContext = ({ currData, setCurrData }) => {
  const staticTable = 'list_trenches';

  const rightMenuItems = [
    menuDefs.map,
    menuDefs.maptest,
    menuDefs.rel,
    menuDefs.asu,
    menuDefs.table,
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
        parent={'context'}
      />
      <MapComponent />
      <EditRelationships
        currData={currData}
        parent={'context'}
      />
      <EditASUs
        currData={currData}
        parent={'context'}
      />
      <ScrollSheet id="table">
      </ScrollSheet>
      <Images
        parent={'context'}
      />
      <Bibliography
        currData={currData}
        setCurrData={setCurrData}
        parent={'context'}
      />
      <Audit
        parent={'context'}
      />
      <Threed
        currData={currData}
        parent={'context'}
      />
    </RightStack>
  );
};

export default RightContext;