import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { 
  goToRecord
} from 'helpers/buttonActions';

export const EntryNavigator = ({ navigate, entryId }) => {

  if (!entryId) return null;

  const updateEntryId = (increment) => {
    const prefix = entryId?.match(/[a-zA-Z]+/)[0];
    const number = parseInt(entryId.match(/\d+/)[0], 10);
    const newNumber = increment ? number + 1 : number - 1;
    goToRecord(navigate, `${prefix}${newNumber}`)
  };

  const disabled = parseInt(entryId?.match(/\d+/)[0], 10) === 1;

  return (
    <Box style={{ position: 'absolute', left: 35, bottom: 100, zIndex: 1010 }}>
    <ButtonGroup variant="contained" orientation="vertical" aria-label="entry navigation buttons" >
      <Button
        onClick={() => updateEntryId(false)}
        disabled={disabled}
        size="large"
        color="info"
      >
        Previous<br /> record
      </Button>
      <Button 
        onClick={() => updateEntryId(true)}
        size="large"
        color="info"
      >
        Next<br /> record
      </Button>
    </ButtonGroup>
    </Box>
  );
};