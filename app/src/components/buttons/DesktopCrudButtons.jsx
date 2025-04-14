import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from 'services/store';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';

const CrudButtons = ({ rowSelected, NewComp }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);

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
        onConfirm: () => updateButtonAction("revert", true)
      },
      delete: {
        title: "Delete row",
        description: "This will delete the object and all geometries",
        confirmButtonText: "Delete",
        confirmButtonColor: "error",
        onConfirm: () => updateButtonAction("delete", true)
      }
      // Add additional button configurations here if needed
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

  const MobileMenu = () => {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} style={{zIndex:1190}}  elevation={3}>
        <BottomNavigation showLabels >
          <BottomNavigationAction label="Revert" icon={<SettingsBackupRestoreIcon />} onClick={() => { handleOpenDialog('revert'); }} />
          <BottomNavigationAction label="New" icon={<AddIcon />} onClick={() => { updateButtonAction("new", true); }} />
          <BottomNavigationAction label="Save" icon={<SaveIcon />} onClick={() => { handleSave(); }} />
          <BottomNavigationAction label="Delete" icon={<DeleteForeverIcon />} onClick={() => { handleOpenDialog('delete'); }} />
        </BottomNavigation>
      </Paper>
    );
  }

  if(!rowSelected) {
    return (
      <Grid container spacing={1} >
        { isMobile ? (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} style={{zIndex:1190}}  elevation={3}>
            { NewComp ?
              <NewComp />
            :
              <BottomNavigation showLabels >
                <BottomNavigationAction label="New" icon={<AddIcon />} onClick={() => { updateButtonAction("new", true); }} />
              </BottomNavigation>
            }
          </Paper>
        ) : (
          <Grid size={{ xs: 12 }} >
            <Card >
              <CardActionArea>
              { NewComp 
              ? <NewComp />
              : <CardContent onClick={() => { updateButtonAction("new", true); }}>
                  <AddIcon />
                  <Typography gutterBottom variant="subtitle1">
                    New
                  </Typography>
                </CardContent>
              }
              </CardActionArea>
            </Card>
          </Grid>
        )}
        <Grid size={{ xs: 12 }} >
          <Typography variant="body1">
            No record selected. Add new or browse through existing.
          </Typography>
        </Grid>
      </Grid>
    )
  };

  return (
    <>
      { isMobile ? (
        <MobileMenu />
      ) : (
        <Grid container spacing={1} padding={1} sx={{ paddingTop: '22px' }}>
          <Grid size={{ xs: 3, sm: 3, md: 3, lg: 2 }} >
            <Card >
              <CardActionArea>
                <CardContent 
                  onClick={() => { handleOpenDialog('revert'); }} >
                  <SettingsBackupRestoreIcon />
                  <Typography gutterBottom variant="subtitle1" >
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
                  <Typography gutterBottom variant="subtitle1" >
                    New
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 3, sm: 3, md: 3, lg: 4 }}>
            <Card >
              <CardActionArea>
                <CardContent onClick={() => { updateButtonAction("save", true); }}>
                  <SaveIcon  />
                  <Typography gutterBottom variant="subtitle1" >
                    Save
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
                  <Typography gutterBottom variant="subtitle1" >
                    Delete
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

        </Grid>
      )}
      <ConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmButtonText={dialogConfig.confirmButtonText}
        confirmButtonColor={dialogConfig.confirmButtonColor}
      />
    </>
  );
};

export default CrudButtons;
