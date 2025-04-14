import React from 'react';
import { MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import {
  GridToolbarExportContainer,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
  useGridApiContext,
} from '@mui/x-data-grid';

const config = {
    columnNames: [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Gender',
      'IP Address',
    ],
    keys: ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address'],
    fileName: 'data.xlsx',
    sheetName: 'Personal Info',
  };

function getExcelData(apiRef) {
  // Select rows and columns
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
  const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

  // Format the data. Here we only keep the value
  const data = filteredSortedRowIds.map((id) => {
    const row = {};
    visibleColumnsField.forEach((field) => {
      row[field] = apiRef.current.getCellParams(id, field).value;
    });
    return row;
  });

  return data;
}

function handleExport(apiRef) {
  const data = getExcelData(apiRef);

  const rows = data.map((row) => {
    const mRow = {};
    for (const key of config.keys) {
      mRow[key] = row[key];
    }
    return mRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.sheet_add_aoa(worksheet, [[...config.columnNames]], {
    origin: 'A1',
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);
  XLSX.writeFile(workbook, config.fileName, { compression: true });
}

export function ExportMenuItem(props) {
  const apiRef = useGridApiContext();
  const { hideMenu } = props;

  return (
    <MenuItem
      onClick={() => {
        handleExport(apiRef);
        // Hide the export menu after the export
        hideMenu?.();
      }}
    >
      Download Excel
    </MenuItem>
  );
}

export function ExportButton(props) {
  return (
    <GridToolbarExportContainer {...props}>
      <ExportMenuItem />
    </GridToolbarExportContainer>
  );
}

export function CustomToolbar(props) {
    return (
      <GridToolbarContainer {...props}>
        <ExportButton />
      </GridToolbarContainer>
    );
  }