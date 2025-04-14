import React, { useEffect, useState } from 'react';

import { useStore } from 'services/store';
import TableDrawer from 'components/layout/TableDrawer';
import { standardColDef } from 'helpers/tableRenders';
import { PageContent, FullPage, ScrollSheet } from "components/layout/Sheets";
import { makeRequest } from 'services/query';
import RelationshipGraph from 'components/visualisations/excavation/RelationshipGraph';
import { RelationshipIcon } from 'components/LocalIcons';
import PageHeader from 'components/layout/PageHeader';

const listTable = 'list_relationships';

const listColumns = [
  standardColDef('parent', 'Parent'),
  standardColDef('label_active', 'Relationship', 2),
  standardColDef('child', 'Child'),
  standardColDef('trench', 'Trench', 4),
];

const Relationships = () => {
  console.log("Render Relationships");
  const [loading, setLoading] = useState(false);
  const setTableOpen = useStore(state => state.setTableOpen);
  const setFilteredRows = useStore(state => state.setFilteredRows);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await makeRequest('get', listTable, {}, {});
        setFilteredRows(data);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      };
    };
    getData();
    console.log("listTable has changed:", listTable);
  }, [listTable]);

  return (
    <>
      <PageHeader
        IconComponent={RelationshipIcon}
        title="Relationships"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <FullPage>
          <ScrollSheet id="rel">
            <RelationshipGraph useFilterRows currUUID={''} />
          </ScrollSheet>
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

export default Relationships;
