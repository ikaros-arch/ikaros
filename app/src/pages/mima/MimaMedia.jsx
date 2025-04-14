import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { 
  MediaInventoryFields, 
  MetadataFields, 
  ParentFields, 
  ResourceFields 
} from 'components/input/MediaFields';
import MediaViewer from 'components/visualisations/MediaViewer';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef } from 'helpers/tableRenders';
import Audit from 'components/sheets/mima/MimaAudit';
import { MediaIcon } from 'components/LocalIcons';
import { Threed } from 'components/sheets/mima/Mima3d';
import { PageContent, HalfPage, LeftStack, DataEntry, ScrollSheet } from 'components/layout/Sheets';
import PageHeader from 'components/layout/PageHeader';
import { ReadMap } from 'components/sheets/mima/MimaMap';
import { makeRequest } from 'services/query';
import { NavRight, menuDefs } from 'components/layout/NavMenu';


const LeftHalf = ({ currData, setCurrData }) => {

  return (
    <LeftStack currData={currData} >
      <DataEntry id="form" >
        <MediaInventoryFields currData={currData} setCurrData={setCurrData} />
        <MetadataFields currData={currData} setCurrData={setCurrData} />
        <ParentFields currData={currData} setCurrData={setCurrData} />
        <ResourceFields currData={currData} setCurrData={setCurrData} />
      </DataEntry>
    </LeftStack>
  );
};


const Media = () => {
  console.log("Render Media");
  let { id } = useParams(); // Grabs the entryID from the URL  

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currMedia);
  const setCurrData = useStore(state => state.setCurrMedia);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);
  const userRole = useStore(state => state.userRole);

  const currUUID = useMemo(() => currData?.uuid, [currData?.uuid]);
  const currPlace = useMemo(() => currData?.place, [currData?.place]);

  const apiTable = 'edit_media';
  const navigate = useNavigate();

  useEffect(() => {
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]);

  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    } else if(currData){
      navigate(currData.entry_id)
    } else {
      setTableOpen(true)
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,
    editTable: apiTable
  });

  const listColumns = [
    standardColDef('media_id', 'Id'),
    standardColDef('media_type', 'Type'),
    standardColDef('parent_type', 'Parent Type'),
    standardColDef('parent', 'Parent'),
    standardColDef('link', 'Link'),
  ]

  const rightMenuItems = [
    menuDefs.viewer,
    menuDefs.map,
  ];
  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

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
          { currData?.media_type === '06483fe6-591c-4c49-81fd-c820fa280689' ?
            <Threed 
              currData={currData}
              parent={'media'}
            /> :
            <ScrollSheet id="viewer">
              <MediaViewer 
                currData={currData}
                parent={'media'}
              /> 
            </ScrollSheet>
          }
          <ReadMap 
            currPlace={currPlace}
            parent={'media'}
          />
{ userRole === 'admin' && (
          <Audit 
            parent={'media'}
          />
)}
          <NavRight menuItems={rightMenuItems} />
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
