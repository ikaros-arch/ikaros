import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardContent from '@mui/material/CardContent';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from 'services/store';

const NewMenu = ({ setEditTable, terms, parent }) => {
  const buttonAction = useStore(state => state.buttonAction);
  const setButtonAction = useStore(state => state.setButtonAction);
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelection = (value) => {
    setEditTable(`edit_${parent}_${value}`);
    const updatedAction = { ...buttonAction, "new": true };
    setButtonAction(updatedAction);
    handleClose();
    navigate(parent);
  };

  return (
    <div>
      {isMobile ? (
        <BottomNavigation showLabels >
          <BottomNavigationAction label="New" icon={<AddIcon />} onClick={handleClick} />
        </BottomNavigation>
      ) : (
        <CardContent onClick={handleClick}>
          <AddIcon />
          <Typography gutterBottom variant="b" component="p">
            New
          </Typography>
        </CardContent>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: anchorEl ? ( isMobile ? '100vw' : anchorEl.clientWidth ) : undefined,
            height: anchorEl && isMobile ? '100vh' : undefined,
          },
        }}
      >
        {terms
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <MenuItem key={item.value} onClick={() => handleSelection(item.label)}>
              <Typography variant="button">
                {item.label}
              </Typography>
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

export default NewMenu;
