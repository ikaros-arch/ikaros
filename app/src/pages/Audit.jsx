import React, { useEffect } from 'react';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import { useParams } from 'react-router-dom';
import DiffViewer from 'components/visualisations/DiffViewer';
import { AuditIcon } from 'components/LocalIcons';
import { PageContent, FullPage } from "components/layout/Sheets";
import PageHeader from 'components/layout/PageHeader';
import { jsonColDef, standardColDef, colDef, linkColDef } from '@/helpers/tableRenders';
import TableDrawer from 'components/layout/TableDrawer';

const apiTable = 'v_audit';
const listTable = 'v_audit';

const listColumns = [
  colDef.uuid,
  linkColDef(),
  standardColDef('event_id', 'ID'),
  standardColDef('row_uuid', 'Row-id'),
  standardColDef('table_name', 'Table'),
  standardColDef('actor', 'Actor'),
  standardColDef('action', 'Action'),
  standardColDef('action_tstamp_tx', 'Time'),
  jsonColDef('row_data', 'Old Data'),
  jsonColDef('changed_fields', 'New Data'),
];

const Audit = () => {
  console.log("Render Audit");

  let { id } = useParams(); // Grabs the uuid from the URL
  console.log("ID: " + id);

  const setTableOpen = useStore(state => state.setTableOpen);
  const currData = useStore(state => state.currAudit);
  const setCurrData = useStore(state => state.setCurrAudit);
  const { loadCurrData } = useDataLoader();

  useEffect(() => {
    loadCurrData(id, apiTable, currData, setCurrData);
  }, [id]);

  useEffect(() => {
    console.log("CurrData: ", currData);
  }, [currData]);

  return (
    <>
      <PageHeader
        IconComponent={AuditIcon}
        title="Audit"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <FullPage>
          <DiffViewer oldData={JSON.stringify(currData?.row_data, null, 2)} newData={JSON.stringify(currData?.changed_fields, null, 2)} />
        </FullPage>
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={listTable}
        viewTable
      />
    </>
  );
};

export default Audit;
