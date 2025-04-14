import React from 'react';
import Grid from '@mui/material/Grid2';
import Typography from "@mui/material/Typography";

export const InputWrapper = ({ children, label }) => {
  return (
    <Grid container spacing={1} padding={1}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1">
          {label}
        </Typography>
      </Grid>
      {children}
    </Grid>
  );
};