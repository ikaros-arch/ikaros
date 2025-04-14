import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from '@mui/material/CardActionArea';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import {useStore} from 'services/store';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';


const CrudButtons = () => {
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

  return (
    <>
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 7 }}>
        <Card >
          <CardActionArea>
            <CardContent 
              onClick={() => { handleOpenDialog('revert'); }} >
              <SettingsBackupRestoreIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
                Revert
              </Typography>                  
            </CardContent>
          </CardActionArea>
        </Card>        
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 8 }} order={{ xs: 8, sm: 7 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => { updateButtonAction("save", true); }}>
              <SaveIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
                Save
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> 
      </Grid>        
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }} order={{ xs: 7, sm: 8 }}>
        <Card >
          <CardActionArea>
            <CardContent onClick={() => { handleOpenDialog('delete'); }}>
              <DeleteForeverIcon sx={{ fontSize: 60 }} />
              <Typography gutterBottom variant="h5" component="p">
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
    </>
  );
};

export default CrudButtons;
