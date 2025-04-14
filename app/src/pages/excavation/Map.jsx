import React, { useState, useEffect } from 'react';
import { useStore } from 'services/store';
import TableDrawer from 'components/layout/TableDrawer';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { OverviewMap } from "components/sheets/excavation/Map";
import { Threed } from 'components/sheets/mima/Mima3d';
import { MapIcon } from 'components/LocalIcons';
import { FullPage, PageContent } from "components/layout/Sheets";
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import PageHeader from 'components/layout/PageHeader';
import { makeRequest } from 'services/query';

const listTable = 'list_context_parent';

const rightMenuItems = [
  menuDefs.map,
  menuDefs.threed,
];

const listColumns = [
  colDef.uuid,
  standardColDef('identifier', 'Id'),
  standardColDef('trench', 'Trench', 2),  
  standardColDef('title', 'Name', 2),
  standardColDef('context_type', 'Type', 2),
  standardColDef('context_shape', 'Shape'),
  standardColDef('status', 'Status')
];

const FullMap = () => {
  console.log("Render Map");
  const setTableOpen = useStore(state => state.setTableOpen);
  const setFilteredRows = useStore(state => state.setFilteredRows);
  const [loading, setLoading] = useState(false);

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
        IconComponent={MapIcon}
        title="Map"
        setTableOpen={setTableOpen}
      />
      <PageContent>
        <FullPage>
          <OverviewMap parent={'map'} />
          <Threed />
        </FullPage>
      </PageContent>
      <NavRight menuItems={rightMenuItems} />
      <TableDrawer 
        columns={listColumns}
        listTable={listTable}
        viewTable
      />
    </>
  );
};

export default FullMap;
