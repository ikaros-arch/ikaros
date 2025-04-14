import React from 'react';
import { ViewTable } from 'components/layout/Table';
import { colDef } from 'helpers/tableRenders';
import Typography from '@mui/material/Typography'; 
import { OverviewIcon } from 'components/LocalIcons';
import { FullPage, PageContent } from 'components/layout/Sheets';

const Overview = () => {

  const listTable = 'v_all_data';

  const listColumns = [
    colDef.uuid,
    colDef.link,
    colDef.id,
    colDef.entryName,
    colDef.inventory,
    colDef.dateStart,
    colDef.dateEnd,
    colDef.dateNotes,
    colDef.completeBool,
  ];  

  const OverviewTable = () => (
    <ViewTable
      columns={listColumns}
      listTable={listTable}
    />
  );

  return (
    <>
      <header className="w3-container" style={{paddingTop:"22px"}}>
        <Typography variant="h5" gutterBottom >
          <OverviewIcon /> Overview
        </Typography>
      </header>
      <PageContent>
        <FullPage>
          <OverviewTable />
        </FullPage>
      </PageContent>
    </>
  );
};

export default Overview;
