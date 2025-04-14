import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeRequest } from 'services/query';
import { useStore } from 'services/store';
import { formatISO } from 'date-fns';
import { 
  goToRecord
} from 'helpers/buttonActions';


export default function useCrudActions(
  { setSelectedRowData, selectedRowData, viewTable, editTable }
) {
//hooks
  const navigate = useNavigate();
  const { type, id } = useParams()
//States
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);


// Functions for CRUD button actions
  const actions = {
    new: async () => {
      console.log('New');
      updateButtonAction("new", false);
      try {
        const newRow = await makeRequest(
                                  'POST', 
                                  `${editTable}`,
                                  '',
                                  "Prefer: return=representation"
                                );
        if (type){
          console.log(`Navigate to: ${type}/${newRow[0].uuid}`)
          goToRecord(navigate, `${type}/${newRow[0].uuid}`)
        } else {
          goToRecord(navigate, newRow[0]?.entry_id ? newRow[0].entry_id : newRow[0].uuid)
        }
        
        setSnackbarData ({
          "actionType": "new",
          "messageType": "success",
          "messageText": "Record created."
        });
      } catch (error) {
        console.log('Error saving data: ', error);
        setSnackbarData ({
          "actionType": "new",
          "messageType": "error",
          "messageText": "Record creation failed: \n\n" + error.message + " \n " + error.response.data.message
        });
      }
     setSnackbarOpen(true)
    },
    save: async () => {
      console.log('Save');
      updateButtonAction("save", false);
      try {
        const updateData = {...selectedRowData, updated_at: formatISO(new Date()), updated_by: activeActor?.uuid || null};
        const updatedRow = await makeRequest(
                                  'PATCH', 
                                  `${editTable}?uuid=eq.${selectedRowData.uuid}`,
                                  updateData, 
                                  "Prefer: return=representation"
                                );
        console.log('Data updated: ', updatedRow);
        setSnackbarData ({
          "actionType": "save",
          "messageType": "success",
          "messageText": "Data saved."
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
    },
    revert: async () => {
      console.log('Revert');
      updateButtonAction("revert", false);
      try {
        const data = await makeRequest('get', `${viewTable}?uuid=eq.${selectedRowData.uuid}`, {}, {});
        setSelectedRowData(data[0]);
        setSnackbarData ({
          "actionType": "revert",
          "messageType": "info",
          "messageText": "Data reverted."
        });
      } catch (error) {
        console.log('Error reverting data. ');
        setSnackbarData ({
          "actionType": "revert",
          "messageType": "error",
          "messageText": "Revert failed."
        });
      }      
      setSnackbarOpen(true)
    },
    delete: async () => {
      console.log('Delete ', selectedRowData?.uuid);
      updateButtonAction("delete", false);
      try {
        const deletedRow = await makeRequest('DELETE', `${editTable}?uuid=eq.${selectedRowData.uuid}`,'{}', "Prefer: return=representation");
        console.log("Row deleted: ", deletedRow[0].uuid)
        setSelectedRowData(null);
        goToRecord(navigate, './')
        setSnackbarData ({
          "actionType": "delete",
          "messageType": "success",
          "messageText": "Row " + (deletedRow[0]?.entry_id ? deletedRow[0].entry_id : deletedRow[0].uuid) + " deleted."
        });
        setSnackbarOpen(true)
      } catch (error) {
        console.log('Error deleting data: ', error);
        setSnackbarData ({
          "actionType": "delete",
          "messageType": "error",
          "messageText": "Delete failed: \n\n" + error.message + " \n " + error.response?.data.message
        });
      };
    },
  };

// Change actionButton state
  const updateButtonAction = (actionName, value) => {
    const updatedAction = { ...buttonAction, [actionName]: value };
    setButtonAction(updatedAction);
  };


// Running function on CRUD action button change
  useEffect(() => {
//    console.log('Current buttonAction:', buttonAction);

    const runAction = async (action) => {
      if (actions[action]) {
        await actions[action]();
      }
    };
  
    Object.keys(buttonAction).forEach((action) => {
      if (buttonAction[action]) {
        runAction(action);
      }
    });
  }, [buttonAction, selectedRowData ]);
};