import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import { blueGrey, grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from 'services/store';
import { SelectTable, ViewTable } from 'components/layout/Table';

export default function TableDrawer({ columns, listTable, idCol, subCol, viewTable }) {
  const tableOpen = useStore(state => state.tableOpen);
  const setTableOpen = useStore(state => state.setTableOpen);
  const [loading, setLoading] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setTableOpen(open);
  };

  return (
    <Drawer
      anchor={'right'}
      open={tableOpen}
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: { width: isMobile ? '100vw' : '60%' },
      }}
    >
      {viewTable ?
        <ViewTable
          columns={columns}
          listTable={listTable}
          idCol={idCol}
        />
        :
        <SelectTable
          columns={columns}
          listTable={listTable}
          loading={loading}
          setLoading={setLoading}
          idCol={idCol}
          subCol={subCol}
        />
      }
      {isMobile && (
        <Zoom in={tableOpen} style={{ transitionDelay: tableOpen ? '200ms' : '0ms' }}>
          <Fab 
            color={blueGrey[300]}
            aria-label="add"
            onClick={toggleDrawer(false)}
            sx={{ position: 'absolute', bottom: 16, left: 16 }}
          >
            <CloseIcon />
          </Fab>
        </Zoom>
      )}
    </Drawer>
  );
}