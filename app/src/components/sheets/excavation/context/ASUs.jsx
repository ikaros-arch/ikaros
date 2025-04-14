import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  GridActionsCellItem,
} from '@mui/x-data-grid';

import { formatISO } from 'date-fns';
import Typography from '@mui/material/Typography';
import { makeRequest } from 'services/query';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import { EditTable } from 'components/layout/Table';
import { ScrollSheet } from 'components/layout/Sheets';
import { colDef, standardColDef } from '@/helpers/tableRenders';


export const EditASUs = ({ currData, parent }) => {
  console.log("Render ASUs");
  console.log(currData?.uuid);

  const currASU = useStore(state => state.currASU);
  const setCurrASU = useStore(state => state.setCurrASU);
  const [query, setQuery] = useState(null);
  const { loadAllData } = useDataLoader();
  const terms = useStore(state => state.terms);

  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);
  const [rowsForDeletion, setRowsForDeletion] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currData && currData.uuid) {
      setQuery(`edit_context_asu?parent=eq.${currData.uuid}`);
    }
  }, [currData]);

  useEffect(() => {
    loadAllData(query, setCurrASU);
  }, [query]);


  const columns = [
    colDef.uuid,
    standardColDef('identifier', 'Id', 1, true),
    {
      field: 'type',
      headerName: 'Type',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.asu_type
    },
    standardColDef('title', 'Title', 2, true),
    standardColDef('comment', 'Comment', 3, true),
    {
      field: 'status',
      headerName: 'Status',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.context_status
    },
  ];

  const handleSave = async () => {
    console.log('Saving ASUs');
    try {
      const updateData = currASU.map(asu => {
        const {  ...rest } = asu;
        return {
          ...asu,
          parent: currData.uuid,
          updated_at: formatISO(new Date()),
          updated_by: activeActor?.uuid || null
        };
      });
      const updatedRow = await makeRequest(
        'POST', 
        `edit_context_asu`,
        updateData, 
        "Prefer: resolution=merge-duplicates,return=representation"
      );
      console.log('Data updated: ', updatedRow);
      if(rowsForDeletion){
        console.log(rowsForDeletion)
        let numberDeletions = rowsForDeletion.length;
        const deletedRows = await makeRequest('DELETE', `edit_context_asu?uuid=eq(any).{${rowsForDeletion}}&limit=${numberDeletions}&order=uuid`,'{}', "Prefer: return=representation");
        console.log(`${numberDeletions} row(s) deleted: ${deletedRows}`);
        setRowsForDeletion([]);
      }
      setSnackbarData ({
        "actionType": "save",
        "messageType": "success",
        "messageText": "ASUs updated."
      });
    } catch (error) {
      console.log('Error saving data: ', error);
      setSnackbarData ({
        "actionType": "save",
        "messageType": "error",
        "messageText": "Save failed: \n\n" + error.message + " \n " + error.response?.data.message
      });
    }
    setSnackbarOpen(true)
  };


  if (!currData) {
    return (
       <ScrollSheet id="asu">
        <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
          No data loaded.
        </Typography>
      </ScrollSheet>
    );
  }

  return (
    <div className="halfheight" id="asu" style={{overflow:"auto"}}>
      <EditTable columns={columns} rows={currASU} setRows={setCurrASU} setRowsForDeletion={setRowsForDeletion} handleSave={handleSave} />
    </div>
  );
};
