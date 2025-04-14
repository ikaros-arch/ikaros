import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useStore } from 'services/store';

export const ActionSnack = () => {
  const snackbarOpen = useStore(state => state.snackbarOpen);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const snackbarData = useStore(state => state.snackbarData);

  const handleClose = (_, reason) => {
    // Don't close the snackbar when clicked away by user
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false)
  };


  return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarData.messageType || "success"}
          //variant="filled"
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {snackbarData.messageText}
        </Alert>
      </Snackbar>
  );
}
