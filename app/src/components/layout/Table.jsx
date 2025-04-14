import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import {
  DataGrid, 
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridToolbarExport,
  gridFilteredSortedRowIdsSelector,
  gridFilteredSortedRowEntriesSelector,
  useGridApiRef 
} from '@mui/x-data-grid';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { getAddressString } from 'helpers/transformers';

// Custom toolbar component
const CustomToolbar = ({ apiRef }) => {
  const userRole = useStore(state => state.userRole);
  return (
    <div>
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        { !isMobile && (
        <Box sx={{ flexGrow: 1 }} >
          <GridToolbarQuickFilter />
        </Box>
        )}
        {(userRole === 'admin' || userRole === 'read_write') && 
          <GridToolbarExport
          csvOptions={{ getRowsToExport: () => gridFilteredSortedRowIdsSelector(apiRef) }}
          printOptions={{
            hideFooter: true,
            hideToolbar: true,
            allColumns: true,
            fileName: 'Keros - Export',
            getRowsToExport: () => gridFilteredSortedRowIdsSelector(apiRef)
          }}
           />
        }
        { isMobile && (
        <Box sx={{ flexGrow: 1 }} >
          <GridToolbarQuickFilter />
        </Box>
        )}
      </GridToolbarContainer>
    </div>
  );
};

const SelectTable = ({ columns, listTable, loading, setLoading, idCol, subCol }) => {
    const setTableOpen = useStore(state => state.setTableOpen);  
  
  const [rows, setRows] = useState([]);
  const apiRef = useGridApiRef(); 

  let idField = 'uuid';
  if (idCol) {
    idField = idCol;
  }

  const navigate = useNavigate();
  const { type, id } = useParams();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await makeRequest('get', listTable, {}, {});
        setRows(data);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    if(listTable){
      getData();
      console.log("listTable has changed:", listTable) 
    }
  }, [listTable]);

  const handleRowSelected = async (selectionModel) => {
    console.log("Row change detected")

    if(subCol) {
      const selectedRowsData = rows.filter(row =>
        selectionModel.includes(row[idField])
      );
      console.log(selectedRowsData)
      console.log(selectedRowsData[0][subCol])
      console.log(subCol)
      if(selectedRowsData[0][subCol]){
        const parent = getAddressString(selectedRowsData[0][subCol]);
        navigate(`${parent}/${selectionModel[0]}`);
        return
      }
    }
    if(type){
      navigate(`${type}/${selectionModel[0]}`);
    } else {
      navigate(`./${selectionModel[0]}`);
    }
    setTableOpen(false);
  };

  return (
    <DataGrid 
      rows={rows}
      columns={columns}
      apiRef={apiRef}
      getRowId={(row) => row[idField]}
      onRowSelectionModelChange={handleRowSelected}
      slots={{
        toolbar: CustomToolbar,
      }}
        slotProps={{
          toolbar: { 
            apiRef: apiRef,
          },
        }}
      loading={loading}
      initialState={{
        filter: {
          filterModel: {
            items: [],
            quickFilterExcludeHiddenColumns: true,
          },
        },
        columns: {
          columnVisibilityModel: {
            // Hide column uuid, the other columns will remain visible
            uuid: false,
          },
        },
      }}
    />
  );
}

const ViewTable = ({ columns, listTable, idCol }) => {
  console.log("Render ViewTable");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const apiRef = useGridApiRef();
  const setFilteredRows = useStore(state => state.setFilteredRows);
  const selRow = useStore(state => state.selRow);
  const setSelRow = useStore(state => state.setSelRow);
  const rowCountRef = useRef();


  let idField = 'uuid';
  if (idCol) {
    idField = idCol
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await makeRequest('get', listTable, {}, {});
        setRows(data);
        setFilteredRows(data);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      };
    };
    getData();
    console.log("listTable has changed:", listTable);
  }, [listTable]);

  useEffect(() => {
    if (selRow) {
      setSelectionModel([selRow[idField]]);
    }
  }, [selRow, idField]);

  useEffect(() => {
    console.log("New selection model:", selectionModel);
  }, [selectionModel]);

  const handleRowSelected = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    if (newSelectionModel.length === 0) {
      console.log("Row change detected");
    } else {
      console.log("Row change detected");
      const selectedRow = rows.find(row => row[idField] === newSelectionModel[0]);
      setSelRow(selectedRow);
    }
  };

  useEffect(() => {
    const handleStateChange = (state) => {
      if (state.pagination.rowCount !== rowCountRef.current) {
        rowCountRef.current = state.pagination.rowCount;
        console.log("Filter model change detected");
        const filteredSortedRowsAndIds = gridFilteredSortedRowEntriesSelector(apiRef.current.state);
        const filteredRows = filteredSortedRowsAndIds.map(entry => entry.model);
        setFilteredRows(filteredRows);
        console.log("Filtered rows and ids");
        console.log(filteredSortedRowsAndIds);
      }
    };

    const unsubscribe = apiRef.current.subscribeEvent('stateChange', handleStateChange);
    return () => unsubscribe();
  }, [apiRef, setFilteredRows]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      apiRef={apiRef}
      getRowId={(row) => row[idField]}
      onRowSelectionModelChange={handleRowSelected}
      rowSelectionModel={selectionModel}
      slots={{
        toolbar: CustomToolbar,
      }}
      slotProps={{ toolbar: { showQuickFilter: true } }}
      loading={loading}
      initialState={{
        filter: {
          filterModel: {
            items: [],
            quickFilterExcludeHiddenColumns: true,
          },
        },
        columns: {
          columnVisibilityModel: {
            // Hide column uuid, the other columns will remain visible
            uuid: false,
          },
        },
      }}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

// Assumes each column that requires data has defined the field
const createEmptyRow = (columns) => {
  const newRow = {};
  columns.forEach((column) => {
    // Field 'id' is a special case and is often handled differently
    // For other fields, simply initialize them with default values
    if (column.field !== 'uuid') {
      newRow[column.field] = column.default || '';
    };
  });
  // The createId function is responsible for providing a unique ID
  newRow.uuid = uuidv4();
  return newRow;
};

function EditToolbar(props) {
  const { setRows, rowSelectionModel, setRowSelectionModel, columns, handleSave, setRowsForDeletion } = props;

  const handleAdd = () => {
    const addRow = createEmptyRow(columns);
    console.log("Adding row");
    console.log(addRow);
    setRows((oldRows) => [...oldRows, addRow]);
  };
  
  const handleDelete = () => {
    setRows(prevRows => prevRows.filter(row => !rowSelectionModel.includes(row.uuid)));
    setRowsForDeletion((oldRows) => [...oldRows, ...rowSelectionModel]);
    setRowSelectionModel([]);
  };


  return (
    <GridToolbarContainer>
      <Button color="secondary" startIcon={<AddIcon />} onClick={handleAdd}>
        Add record
      </Button>
      <Button color="secondary" startIcon={<DeleteIcon />} onClick={handleDelete}>
        Remove selected
      </Button>
      <Button color="primary" startIcon={<SaveIcon />} onClick={handleSave}>
        Save changes
      </Button>
    </GridToolbarContainer>
  );
};

const EditTable = ({ columns, rows, setRows, handleSave, setRowsForDeletion }) => {
  console.log("Render EditTable");
  console.log("Rows: ", rows);
  //const [rows, setRows] = useState([]);
  //const [rowModesModel, setRowModesModel] = useState({});
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [loading, setLoading] = useState(false);

//  useEffect(() => {
//    const getData = async () => {
//      setLoading(true);
//      try {
//        const data = await makeRequest('get', listTable, {}, {});
//        setRows(data);
//      } catch (error) {
//        // Handle error
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    getData();
//    console.log("listTable has changed:", listTable);
//  }, [listTable]);

  const processRowUpdate = async (updatedRow) => {
    console.log("Row change detected");
    const updatedRows = rows.map((row) => (row.uuid === updatedRow.uuid ? updatedRow : row));
    setRows(updatedRows);
    return updatedRow;
  };

  const handleProcessRowUpdateError = (error) => {
    // Do something with the error (e.g. display an error message to the user)
    console.error(error);
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row['uuid']}
      loading={loading}
      //editMode="row"
      //rowModesModel={rowModesModel}
      //onRowModesModelChange={handleRowModesModelChange}
      //onRowEditStop={handleRowEditStop}
      checkboxSelection
      onRowSelectionModelChange={(newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
      }}
      rowSelectionModel={rowSelectionModel}
      processRowUpdate={ (updatedRow, originalRow) => processRowUpdate(updatedRow)}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      slots={{
        toolbar: EditToolbar,
      }}
      slotProps={{
        toolbar: { setRows, rowSelectionModel, setRowSelectionModel, columns, handleSave, setRowsForDeletion },
      }}
    />
  );
};


const SearchTable = ({ listData, searchCol, listCol, columns, apiTable }) => {
  console.log("Render SearchTable");
  const [loading, setLoading] = useState(false);
  const [listTable, setListTable] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchFilter, setSearchFilter] = useState(null);
  const [selValue, setSelValue] = useState(null);

  function handleTypeChange(event, newValue) {
    if(newValue){
      setTypeFilter(`${listCol}=eq.${newValue}`);
    } else {
      setTypeFilter(null);
    };
    setSelValue(newValue);
  };

  function handleSearchChange(data) {
    console.log(data.target.value);
    if(data.target.value){
      setSearchFilter(`${searchCol}=ilike.%${data.target.value}%`);
    } else {
      setSearchFilter(null);
    };
  };

  useEffect(() => {
    let queryStringParts = [];
    if (typeFilter) {
      queryStringParts.push(typeFilter);
    };
    if (searchFilter) {
      queryStringParts.push(searchFilter);
    };
    let queryString = `${apiTable}${queryStringParts.length > 0 ? '?' : ''}${queryStringParts.join('&')}`;
    setListTable(queryString);
  }, [typeFilter, searchFilter, apiTable]);

  return (
    <Grid container spacing={1} padding={1} >
      <Grid size={{ xs: 12, sm: 6, md: 6 }} order={{ xs: 6 }}>
          <TextField
            label="Search"
            variant="outlined"
            id="search_term"
            name="search"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                </InputAdornment>
              ),
            }}
            onChange={(data) => handleSearchChange(data)}
          />
      </Grid>
      { listCol &&
      <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6 }}>
        <Autocomplete
          id="select_type"
          options={listData}
          value={selValue}
          onChange={(event, newValue) => handleTypeChange(event, newValue)}
          renderInput={(params) => <TextField {...params} label="Select type" />}
          renderOption={(props, option) => <li {...props}>{option}</li>} 
        />
      </Grid>
      }
      <Grid size={{ xs: 12 }} order={{ xs: 6 }}>
        <SelectTable
          columns={columns}
          listTable={listTable}
          loading={loading}
          setLoading={setLoading}
        />
      </Grid>
    </Grid>
  );
};

export { SelectTable, ViewTable, EditTable, SearchTable };
