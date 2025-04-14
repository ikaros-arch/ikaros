import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

export function CircularLoading() {
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        width: '100%',
        height: '100vh', // Adjust height to center considering the top margin
      }}
    >
      <CircularProgress />
    </Box>
  );
}


export function LinearLoading() {
  return (
    <Box sx={{ width: '100%', marginTop: 2 }}>
      <LinearProgress color="grey.500" />

    </Box>
  );
}