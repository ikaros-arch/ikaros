import React from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import { ViewTable } from 'components/layout/Table';
import { useStore } from 'services/store';
import { isUUID } from 'helpers/validation';
import { standardColDef, jsonColDef } from 'helpers/tableRenders';
import { ScrollSheet } from 'components/layout/Sheets';


const Audit = ({ parent }) => {
  console.log("Render Audit");

  const { id } = useParams();
  const uuid = useStore(state => state.currUuid);

  var apiTable = null;
  if (isUUID(id)){
    apiTable = `v_audit?row_uuid=eq.${id}`;
  } else if (uuid){
    apiTable = `v_audit?row_uuid=eq.${uuid}`;
  }

  const idCol = 'event_id';

  const listColumns = [
    standardColDef('event_id', 'ID'),
    jsonColDef('changed_fields', 'Old'),
    jsonColDef('row_data', 'New'),
    standardColDef('action', 'Action'),
    standardColDef('action_tstamp_tx', 'Timestamp', 2),
    standardColDef('actor', 'Actor'),
  ];

  return (
    <ScrollSheet id="audit" >
      <div className="thirtyheight" >
        <ViewTable
          columns={listColumns}
          listTable={apiTable}
          idCol={idCol}
        />
      </div>
      <div className="halfheight" >
        <Grid container spacing={2} paddingTop={2} >
        </Grid>
      </div>
    </ScrollSheet>
  );
};

export default Audit;
