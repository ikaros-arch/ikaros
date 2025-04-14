import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import useCrudActions from 'hooks/useCrudActions';
import PageHeader from 'components/layout/PageHeader';
import TableDrawer from 'components/layout/TableDrawer';
import LeftEmpty from '@/components/sheets/excavation/LeftEmpty';
import { PageContent, HalfPage } from "components/layout/Sheets";

const SubClassPage = ({ IconComponent, title, apiTable, LeftComponent, RightComponent, listColumns, listTable, subCol }) => {
  let { id } = useParams(); // Grabs the uuid from the URL
  const { loadCurrData } = useDataLoader();
  const currData = useStore(state => state.currContext);
  const setCurrData = useStore(state => state.setCurrContext);
  const setTableOpen = useStore(state => state.setTableOpen);

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
      <PageHeader IconComponent={IconComponent} title={title} setTableOpen={setTableOpen} />
      <PageContent>
        <HalfPage>
          {currData ? <LeftComponent currData={currData} setCurrData={setCurrData} /> : <LeftEmpty />}
        </HalfPage>
        <HalfPage>
          <RightComponent currData={currData} setCurrData={setCurrData} parent={title} />
        </HalfPage>
      </PageContent>
      <TableDrawer columns={listColumns} listTable={listTable} subCol={subCol} />
    </>
  );
};

export default SubClassPage;
