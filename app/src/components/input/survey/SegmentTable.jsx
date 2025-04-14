import React, { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, useMediaQuery, useTheme, Box } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
 
function SegmentTable( {rows, setRows}) {

  const theme = useTheme();
  const xsScreen = useMediaQuery(theme.breakpoints.down('sm'));


  const deleteRow = (uuid) => {
    setRows(rows.filter((row) => row.uuid !== uuid));
  };  

  function CustomNoRowsOverlay() {
    return (
      <Box sx={{ mt: 1 }}>No Segments Added</Box>
    );
  }
  

const handleRowUpdate = (updatedRow) => {
  const newRows = rows.map((row) =>
    row.uuid === updatedRow.uuid ? updatedRow : row
  );
  setRows(newRows);
};

useEffect(() => {
  console.log('Rows updated:', rows);
}, [rows]);


  const columns = [
    { field: 'segment_no', 
      headerName: xsScreen ? 'Seg#' : 'Segment', 
      flex: 1, 
      type: 'integer', 
      editable: true, 
      disableColumnMenu: true, 
      sortable: false  
    },
    { field: 'count_pottery', 
      headerName: xsScreen ? 'Pot' : 'Pottery', 
      flex: 1, 
      type: 'integer', 
      editable: true, 
      disableColumnMenu: true, 
      sortable: !xsScreen  
    },
    { field: 'count_obsidian', 
      headerName: xsScreen ? 'Obs' : 'Obsidian', 
      flex: 1, 
      type: 'integer', 
      editable: true, 
      disableColumnMenu: true, 
      sortable: !xsScreen  
    },
    { field: 'count_pottery_bags', 
      headerName: xsScreen ? 'PBag' : 'Pot Bags', 
      flex: 1, 
      type: 'integer', 
      editable: false, 
      disableColumnMenu: true, 
      sortable: !xsScreen  
    },
    { field: 'count_other_bags', 
      headerName: xsScreen ? 'OBag' : 'Other Bags', 
      flex: 1, 
      type: 'integer', 
      editable: false, 
      disableColumnMenu: true, 
      sortable: !xsScreen  },
    { field: 'notwalked', 
      headerName: xsScreen ? 'NW' : 'Not Walked', 
      flex: 1, 
      type: 'boolean', 
      editable: true, 
      disableColumnMenu: true, 
      sortable: !xsScreen  
    },
    {
      field: ' ',
      disableColumnMenu: true,
      sortable: false,
      width: 15,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <>
            <IconButton onClick={() => deleteRow(params.row.uuid)}>
              <DeleteForeverIcon />
            </IconButton>
          </>
        );
      },
    },    
  ];

  return (
    <div style={{  width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid 
        rows={rows}
        columns={columns}
        getRowId={(row) => row.uuid}
        hideFooter
        processRowUpdate={(updatedRow, originalRow) => handleRowUpdate(updatedRow)}        
        sx={{
          '.MuiDataGrid-virtualScroller': {
            overflowY: 'auto !important',
            // example of maxHeight
            maxHeight: 'calc(250px) !important',
          },
          '--DataGrid-overlayHeight': '50px' 
        }}
      />
    </div>
  );
}
export default SegmentTable;
