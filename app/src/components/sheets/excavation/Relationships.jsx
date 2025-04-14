import React, { useEffect, useState } from 'react';
import { formatISO } from 'date-fns';
import Typography from '@mui/material/Typography'; 
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { makeRequest } from 'services/query';
import { useStore } from 'services/store';
import { EditTable } from 'components/layout/Table';
import { ScrollSheet } from 'components/layout/Sheets';
import RelationshipGraph from 'components/visualisations/excavation/RelationshipGraph';

export const EditRelationships = ({ currData, parent }) => {
  console.log("Render Relationships");
  console.log(currData?.uuid);
  const contexts = useStore(state => state.contexts);
  const relations = useStore(state => state.relations);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);
  const [rowsForDeletion, setRowsForDeletion] = useState([]);
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(false);

  var getReq = '';

  switch (parent) {
    case 'trench':
      getReq = `list_relationships?trench_uuid=eq.${currData?.uuid}`;
      break;
    case 'context':
      getReq = `list_relationships?or=(parent_uuid.eq.${currData?.uuid},child_uuid.eq.${currData?.uuid})`;
      break;
    default:
      getReq = 'list_relationships';
  }


  useEffect(() => {
    if (currData){
      const getData = async () => {
        setLoading(true);
        const data = await makeRequest('get', getReq, {}, {});
        setRels(data);
        setLoading(false);
      };
      getData();
      console.log("Relationships loaded.");
    }
  }, [currData]);

  const columns = [
    {
      field: 'parent_uuid',
      headerName: 'Parent',
      flex: 1,
      editable: true,
      renderCell: (params) => {
        const match = contexts.find(option => option.value === params.value);
        return match ? match.label : params.value;
      },
      renderEditCell: (params) => {
        return (
          <Autocomplete
            style={{ flex: 1 }}
            id='parent_uuid'
            options={contexts}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={contexts.find(option => option.value === params.value) || null}
            onChange={(event, newValue) => {
              params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue?.value || null });
            }}
            renderInput={(params) => <TextField {...params} />}
            renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}

          />
        );
      },
    },
    {
      field: 'child_uuid',
      headerName: 'Child',
      flex: 1, 
      editable: true,
      renderCell: (params) => {
        const match = contexts.find(option => option.value === params.value);
        return match ? match.label : params.value;
      },
      renderEditCell: (params) => {
        return (
          <Autocomplete
            style={{ flex: 1 }}
            options={contexts}
            getOptionLabel={(option) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={contexts.find(option => option.value === params.value) || null}
            onChange={(event, newValue) => {
              params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue?.value || null });
            }}
            renderInput={(params) => <TextField {...params} />}
            renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
          />
        );
      },
    },
    {
      field: 'relation_uuid',
      headerName: 'Relationship',
      flex: 1, 
      editable: true,
      renderCell: (params) => {
        const match = relations.find(option => option.value === params.value);
        return match ? match.label : params.value;
      },
      renderEditCell: (params) => {
        return (
          <Autocomplete
            style={{ flex: 1 }}
            options={relations}
            getOptionLabel={(option) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={relations.find(option => option.value === params.value) || null}
            onChange={(event, newValue) => {
              params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue?.value || null });
            }}
            renderInput={(params) => <TextField {...params} />}
            renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
          />
        );
      },
    }
  ];
  const handleSave = async () => {
    console.log('Saving Relationships');
    try {
      const updateData = rels.map(rel => {
        const { parent, parent_type, child, child_type, label_active, label_passive, trench, trench_uuid, ...rest } = rel;
        return {
          ...rest,
          relationship_type: parent,
          updated_at: formatISO(new Date()),
          updated_by: activeActor?.uuid || null
        };
      });

      const updatedRow = await makeRequest(
        'POST', 
        `edit_relationships`,
        updateData, 
        "Prefer: resolution=merge-duplicates,return=representation"
      );
      console.log('Data updated: ', updatedRow);
      if(rowsForDeletion){
        console.log(rowsForDeletion)
        let numberDeletions = rowsForDeletion.length;
        const deletedRows = await makeRequest('DELETE', `edit_relationships?uuid=eq(any).{${rowsForDeletion}}&limit=${numberDeletions}&order=uuid`,'{}', "Prefer: return=representation");
        console.log(`${numberDeletions} row(s) deleted: ${deletedRows}`);
        setRowsForDeletion([]);
      }  
      setSnackbarData ({
        "actionType": "save",
        "messageType": "success",
        "messageText": "Relationships updated."
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
      <ScrollSheet id="rel">
        <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
          No entry loaded.
        </Typography>
      </ScrollSheet>
    );
  }

  return (
    <>
     <div className="thirtyheight" id="rel">
      <RelationshipGraph rels={rels} currUUID={currData?.uuid || ''} />
     </div>
     <div className="halfheight" id="reltable" style={{overflow:"auto"}}>
      <EditTable columns={columns} rows={rels} setRows={setRels} setRowsForDeletion={setRowsForDeletion} handleSave={handleSave} />
     </div>
    </>
  );
};

export const ViewRelationships = ({ currData, parent }) => {
  console.log("Render View Relationship Sheet");
  console.log(currData?.uuid)
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(false);

  var getReq = '';

  switch (parent) {
    case 'trench':
      getReq = `list_relationships?trench_uuid=eq.${currData?.uuid}`;
      break;
    case 'context':
      getReq = `list_relationships?or=(parent_uuid.eq.${currData?.uuid},child_uuid.eq.${currData?.uuid})`;
      break;
    default:
      getReq = 'list_relationships';
  }

  useEffect(() => {
    if (currData) {
      const getData = async () => {
        setLoading(true);
        const data = await makeRequest('get', getReq, {}, {});
        setRels(data);
        setLoading(false);
      };
      getData();
      console.log("Relationships loaded.");
    }
  }, [currData]);

  if (!currData) {
    return (
      <ScrollSheet id="rel">
        <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
          No entry loaded.
        </Typography>
      </ScrollSheet>
    );
  }

  return (
    <ScrollSheet id="rel">
      <RelationshipGraph rels={rels} currUUID={currData?.uuid || ''} />
    </ScrollSheet>
  );
};
