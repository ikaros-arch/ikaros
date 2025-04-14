import React, { useEffect, useState } from 'react';
import { formatISO } from 'date-fns';
import Typography from '@mui/material/Typography'; 
import { makeRequest } from 'services/query';
import { useStore } from 'services/store';
import { EditTable } from 'components/layout/Table';
import { standardColDef, selectColDef } from 'helpers/tableRenders';
import RelationshipGraph from 'components/visualisations/mima/RelationshipGraph';
import { ScrollSheet } from 'components/layout/Sheets';

const Relationships = ({ currUUID, parent }) => {
  console.log("Render Relationships")
  const recordLookup = useStore(state => state.recordLookup);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);  
  const activeActor = useStore(state => state.activeActor);
  const [rowsForDeletion, setRowsForDeletion] = useState([]);
  const [rels, setRels] = useState([]);


  useEffect(() => {
    if (currUUID){
      const getData = async () => {
        const data = await makeRequest('get', `v_crosslist?or=(parent_uuid.eq.${currUUID},child_uuid.eq.${currUUID})`, {}, {});
        setRels(data);
      };
      getData();
      console.log("Relationships loaded.")
    }
  }, [currUUID,setSnackbarOpen]);

  const columns = [
    selectColDef("parent_uuid", "Parent", recordLookup),
    selectColDef("child_uuid", "Child", recordLookup),
    standardColDef('relationship', 'Relationship', 3, true),
    standardColDef('comment', 'Comment', 4, true),
  ]  
  
  const handleSave = async () => {
    console.log('Saving Relationships');
    // Validation
    const invalidRel = rels.find(rel => !rel.parent_uuid || !rel.child_uuid);
    if (invalidRel) {
      console.log(`Error saving data: Missing ${invalidRel.parent_uuid ? 'child_uuid' : 'parent_uuid'}.`);
      setSnackbarData({
        "actionType": "save",
        "messageType": "error",
        "messageText": `Save failed: All relationships must have both parent and child values. Missing ${invalidRel.parent_uuid ? 'child' : 'parent'} value.`
      });
      setSnackbarOpen(true)
      return; // Prevent save operation
    }

    try {
      const updateData = rels.map(rel => {
        const { parent, child, ...rest } = rel;
        return {
          ...rest,
          updated_at: formatISO(new Date()),
          updated_by: activeActor?.uuid || null
        };
      });

      const updatedRow = await makeRequest(
                                'POST', 
                                `edit_crosslist`,
                                updateData, 
                                "Prefer: resolution=merge-duplicates,return=representation"
                              );
      console.log('Data updated: ', updatedRow);
      if(rowsForDeletion){
        console.log(rowsForDeletion)
        let numberDeletions = rowsForDeletion.length;
        const deletedRows = await makeRequest('DELETE', `edit_crosslist?uuid=eq(any).{${rowsForDeletion}}&limit=${numberDeletions}&order=uuid`,'{}', "Prefer: return=representation");
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

  if (!currUUID) {
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
      <RelationshipGraph rels={rels} currUUID={currUUID} />
     </div>
     <div className="halfheight" id="reltable" style={{overflow:"auto"}}>
      <EditTable 
        columns={columns} 
        rows={rels} 
        setRows={setRels} 
        setRowsForDeletion={setRowsForDeletion} 
        handleSave={handleSave} 
      />
     </div>
    </>
  );
};

export default Relationships;