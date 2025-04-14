import React, { useState } from 'react';
import { formatISO } from 'date-fns';
import { isMobile } from 'react-device-detect';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';

const CrudButtons = ({ currNoteId, currData, navigate, activeActor, editTable }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);

  const handleSave = async () => {
    console.log('Save');

    if(currNoteId){
        try {
            const updateData = {...currData, updated_at: formatISO(new Date()), updated_by: activeActor?.uuid || null};
            const updatedRow = await makeRequest(
                                      'PATCH', 
                                      `${editTable}?uuid=eq.${currNoteId}`,
                                      updateData, 
                                      "Prefer: return=representation"
                                    );
            console.log('Data updated: ', updatedRow);
            setSnackbarData ({
              "actionType": "save",
              "messageType": "success",
              "messageText": "Note updated."
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
    } else {
        try {
            const updateData = {...currData, updated_at: formatISO(new Date()), updated_by: activeActor?.uuid || null};
            const updatedRow = await makeRequest(
                                      'POST', 
                                      `${editTable}`,
                                      updateData, 
                                      "Prefer: return=representation"
                                    );
            console.log('Note sent: ', updatedRow);
            setSnackbarData ({
              "actionType": "save",
              "messageType": "success",
              "messageText": "Note sent."
            });
            navigate(updatedRow.uuid);
          } catch (error) {
            console.log('Error saving data: ', error);
            setSnackbarData ({
              "actionType": "save",
              "messageType": "error",
              "messageText": "Save failed: \n\n" + error.message + " \n " + error.response?.data.message
            });
          }
         setSnackbarOpen(true)
    }
  };

  const handleDelete = async () => {
      if(currNoteId){
        console.log('Delete note ', currNoteId);
        try {
          const deletedRow = await makeRequest('DELETE', `${editTable}?uuid=eq.${currNoteId}`,'{}', "Prefer: return=representation");
          console.log("Row deleted: ", deletedRow[0].uuid)
          setSnackbarData ({
            "actionType": "delete",
            "messageType": "success",
            "messageText": "Note " + (deletedRow[0]?.entry_id ? deletedRow[0].entry_id : deletedRow[0].uuid) + " deleted."
          });
          setSnackbarOpen(true);
          navigate('./');
        } catch (error) {
          console.log('Error deleting data: ', error);
          setSnackbarData ({
            "actionType": "delete",
            "messageType": "error",
            "messageText": "Delete failed: \n\n" + error.message + " \n " + error.response?.data.message
          });
        };
      } else{
        navigate('./');
    }
  };

  const handleOpenDialog = (type) => {
    const configs = {
      new: {
        title: "Add new",
        description: "Add new row?",
        confirmButtonText: "Add new",
        confirmButtonColor: "primary",
        onConfirm: () => updateButtonAction("new", true)
      },
      save: {
        title: "Save",
        description: "Changes will be saved to database.",
        confirmButtonText: "Save",
        confirmButtonColor: "primary",
        onConfirm: () => updateButtonAction("save", true)
      },
      revert: {
        title: "Revert Changes",
        description: "All unsaved changes will be lost.",
        confirmButtonText: "Revert",
        confirmButtonColor: "primary",
        onConfirm: () => navigate(currNoteId ? currNoteId : './')
      },
      delete: {
        title: "Delete note",
        description: "This will delete the current note",
        confirmButtonText: "Delete",
        confirmButtonColor: "error",
        onConfirm: () => handleDelete()
      }
    };

    setOpenDialog(true);
    setDialogConfig(configs[type] || {});
  };

  const updateButtonAction = (actionName, value) => {
    setOpenDialog(false);
    const updatedAction = { ...buttonAction, [actionName]: value };
    setButtonAction(updatedAction);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (isMobile) {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels >
          <BottomNavigationAction label="Revert" icon={<SettingsBackupRestoreIcon />} onClick={() => { handleOpenDialog('revert'); }} />
          <BottomNavigationAction label="New" icon={<AddIcon />} onClick={() => { updateButtonAction("new", true); }} />
          <BottomNavigationAction label="Send" icon={<SendIcon />} onClick={() => { handleSave(); }} />
          <BottomNavigationAction label="Delete" icon={<DeleteForeverIcon />} onClick={() => { handleOpenDialog('delete'); }} />
          <ConfirmationDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onConfirm={dialogConfig.onConfirm}
            title={dialogConfig.title}
            description={dialogConfig.description}
            confirmButtonText={dialogConfig.confirmButtonText}
            confirmButtonColor={dialogConfig.confirmButtonColor}
          />
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
      <Grid size={{ xs: 3, sm: 3, md: 3, lg: 2 }}>
        <Card >
          <CardActionArea>
            <CardContent 
              onClick={() => { handleOpenDialog('revert'); }} >
              <SettingsBackupRestoreIcon  />
              <Typography gutterBottom component="p">
                Revert
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid size={{ xs: 3, sm: 3, md: 3, lg: 4 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => { updateButtonAction("new", true); }}>
              <AddIcon />
              <Typography gutterBottom variant="b" component="p">
                New
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> 
      </Grid>
      <Grid size={{ xs: 3, sm: 3, md: 3, lg: 4 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => { handleSave(); }}>
              <SendIcon  />
              <Typography gutterBottom variant="i" component="p">
                Send
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid size={{ xs: 3, sm: 3, md: 3, lg: 2 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => { handleOpenDialog('delete'); }}>
              <DeleteForeverIcon />
              <Typography gutterBottom  component="p">
                Delete
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <ConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmButtonText={dialogConfig.confirmButtonText}
        confirmButtonColor={dialogConfig.confirmButtonColor}
      />
    </Grid>
  );
};

export default CrudButtons;
