import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import PageHeader from 'components/layout/PageHeader';
import { MediaInventoryFields, MetadataFields, ParentFields, ResourceFields } from 'components/input/MediaFields';
import MediaViewer from 'components/visualisations/MediaViewer';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef } from 'helpers/tableRenders';
import Audit from 'components/sheets/mima/MimaAudit';
import { MediaIcon } from 'components/LocalIcons';
import { Threed } from 'components/sheets/mima/Mima3d';
import { PageContent, HalfPage, LeftStack, RightStack, DataEntry, ScrollSheet } from "components/layout/Sheets";
import { ReadMap } from "components/sheets/excavation/Map";
import { menuDefs } from 'components/layout/NavMenu';

const apiTable = 'edit_media';

const listColumns = [
  standardColDef('media_id', 'Id'),
  standardColDef('media_type', 'Type'),
  standardColDef('parent_type', 'Parent Type'),
  standardColDef('parent', 'Parent'),
  standardColDef('link', 'Link'),
];

const rightMenuItems = [
  menuDefs.viewer,
  menuDefs.map,
  menuDefs.audit
];

const LeftHalf = ({ currData, setCurrData }) => {

  return (
    <LeftStack currData={currData} >
      <DataEntry id="form">
        <Grid container spacing={2} >
          <MediaInventoryFields currData={currData} setCurrData={setCurrData} />
          <MetadataFields currData={currData} setCurrData={setCurrData} />
          <ParentFields currData={currData} setCurrData={setCurrData} />
          <ResourceFields currData={currData} setCurrData={setCurrData} />
        </Grid>
      </DataEntry>
    </LeftStack>
  );
};

const Media = () => {
  console.log("Render Media");

  let { id } = useParams(); // Grabs the entryID from the URL  
  const { loadCurrData } = useDataLoader();

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currMedia);
  const setCurrData = useStore(state => state.setCurrMedia);
  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,
    editTable: apiTable
  });

  useEffect(() => {
    loadCurrData(id, apiTable, currData, setCurrData);
  }, [id]);

  return (
    <>
      <PageHeader
        IconComponent={MediaIcon}
        title="Media"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <HalfPage>
          <LeftHalf currData={currData} setCurrData={setCurrData} />
        </HalfPage>
        <HalfPage>
          <RightStack currData={currData} menuItems={rightMenuItems} >
            <ScrollSheet id="viewer">
            { currData?.media_type === '06483fe6-591c-4c49-81fd-c820fa280689' ?
              <Threed 
                currData={currData}
                setCurrData={setCurrData}
                parent={'media'}
              /> :
              <MediaViewer 
                currData={currData}
                setCurrData={setCurrData}
                parent={'media'}
              />
            }
            </ScrollSheet>
            <ReadMap 
              currData={currData}
              setCurrData={setCurrData}
              parent={'media'}
            />
            <Audit 
              currData={currData}
              setCurrData={setCurrData}
              parent={'media'}
            />
          </RightStack>
        </HalfPage>
      </PageContent>
      <TableDrawer
        columns={listColumns}
        listTable={'list_media'}
      />
    </>
  );
};

export default Media;
