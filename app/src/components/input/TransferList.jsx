import React, { useState } from 'react';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

function not(a, b) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

export default function TransferList() {
  const [checked, setChecked] = useState([]);
  const [items, setItems] = useState({
    'Workflows': false,
    'Context': false,
    'Trench': false,
    'Find': false,
    'Bag': true,
    'Topo': true,
    'Vocabulary': true,
    'Apothiki': true,
  });

  const left = Object.keys(items).filter((key) => !items[key]);
  const right = Object.keys(items).filter((key) => items[key]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    const newItems = { ...items };
    left.forEach((key) => {
      newItems[key] = true;
    });
    setItems(newItems);
    setChecked(not(checked, left));
  };

  const handleCheckedRight = () => {
    const newItems = { ...items };
    leftChecked.forEach((key) => {
      newItems[key] = true;
    });
    setItems(newItems);
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const newItems = { ...items };
    rightChecked.forEach((key) => {
      newItems[key] = false;
    });
    setItems(newItems);
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    const newItems = { ...items };
    right.forEach((key) => {
      newItems[key] = false;
    });
    setItems(newItems);
    setChecked(not(checked, right));
  };

  const customList = (items, heading) => (
    <Paper sx={{ width: 200, height: 350, overflow: 'auto' }}>
      <Typography variant="body1" sx={{ textAlign: 'center', paddingTop: 1 }}>
        {heading}
      </Typography>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value}-label`;

          return (
            <ListItemButton
              key={value}
              role="listitem"
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(value)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <Grid
      container
      spacing={2}
      sx={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <Grid>{customList(left, 'Available')}</Grid>
      <Grid>
        <Grid container direction="column" sx={{ alignItems: 'center' }}>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid>{customList(right, 'Selected')}</Grid>
    </Grid>
  );
}
