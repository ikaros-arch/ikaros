import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gridStringOrNumberComparator } from '@mui/x-data-grid';
import { parseISO } from 'date-fns';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import { green, red } from '@mui/material/colors';
import { 
  extractRangeDate,
  getAddressString
} from 'helpers/transformers';
import { 
  goToRecord
} from 'helpers/buttonActions';
/**
 * Renders a boolean cell with a check circle icon for true values and a cancel icon for false values.
 *
 * @param {Object} params - The parameters object.
 * @param {boolean} params.value - The boolean value to render.
 * @returns {JSX.Element} The rendered cell with the appropriate icon.
 */
export function renderBooleanCell(params) {
  return params.value ? (
    <CheckCircle style={{ color: green[500] }} />
  ) : (
    <Cancel style={{ color: red[500] }} />
  );
}

/**
 * RenderInternalLink component renders an icon button that navigates to a specified path when clicked.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The value to append to the path for navigation.
 * @param {string} [props.path] - The base path to navigate to. If not provided, the current path is used.
 *
 * @returns {JSX.Element} The rendered icon button component.
 */
export function RenderInternalLink({ value, path }) {
  const navigate = useNavigate();

  const goToLink = () => {
    if (path) {
      const editedPath = getAddressString(path);
      navigate(`${editedPath}/${value}`);
    } else {
      goToRecord(navigate, value);
    }
  };

  return (
    <IconButton aria-label="Open" onClick={goToLink}>
      <LaunchIcon />
    </IconButton>
  );
}

/**
 * RenderAuthorities component renders a list of authority chips.
 * Each chip is clickable and opens the corresponding authority URI in a new tab.
 * 
 * The authorities object should have the following structure:
 * {
 *   'source1': {
 *     'dc:identifier': 'uri1',
 *     ...
 *   },
 *   'source2': {
 *     'dc:identifier': 'uri2',
 *     ...
 *   },
 *   ...
 * }
 * 
 * If no authorities are present, a message indicating no data is displayed.
 *
 * @internal Used for rendering authority chips in table cells
 * @param {Object} props - The properties object.
 * @param {Object} props.value - The authorities object where keys are source names and values are objects containing 'dc:identifier'.
 * @returns {JSX.Element} A list of chips or a message indicating no data.
 */
export function RenderAuthorities(props) {
  const authorities = props.value;
  const handleClick = (uri) => {
    window.open(uri, '_blank');
  };
  if(authorities){
    return (
      <>
        {Object.entries(authorities).filter(([_, value]) => value['dc:identifier']).map(([sourceName, { 'dc:identifier': identifier }]) => (
          <Chip
            key={sourceName}
            label={sourceName}
            onClick={() => handleClick(identifier)}
            sx={{ margin: 0.2 }}
            size="small"
            variant="outlined"
          />
        ))}
      </>
    );
  };
  return <span>No data</span>; 
}

/**
 * TextCellExpand component renders a text cell that expands into a popover when clicked.
 * 
 * @internal Used for expanding text content in table cells
 * @component
 * @param {Object} props - The properties object.
 * @param {string} props.value - The text value to be displayed in the cell and popover.
 * 
 * @returns {JSX.Element} The rendered TextCellExpand component.
 */
export function TextCellExpand(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <div 
        onClick={handleClick} 
        style={{
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {props.value}
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ overflow: 'auto', paddingRight: 4}}>{props.value}</Typography>
        </Box>
      </Popover>
    </div>
  );
}

/**
 * Generates a sort comparator function for years, treating empty values as the largest possible value 
 * (always sorted last in the table).
 *
 * @param {string} sortDirection - The direction of the sort ('asc' or 'desc').
 * @returns {Function} - The comparator function.
 */
export const getYearSortComparator = (sortDirection) => {
  const modifier = sortDirection === 'desc' ? -1 : 1;
  return (value1, value2, cellParams1, cellParams2) => {
    if (value1 === null || value1 === undefined || value1 === '') {
      return 1;
    }
    if (value2 === null || value2 === undefined || value2 === '') {
      return -1;
    }
    return (
      modifier *
      gridStringOrNumberComparator(value1, value2, cellParams1, cellParams2)
    );
  };
};

/**
 * JsonCellExpand is a React component that displays a JSON object in a cell.
 * When the cell is clicked, a popover appears showing the formatted JSON.
 *
 * @internal Used for expanding JSON content in table cells
 * @component
 * @param {Object} props - The properties object.
 * @param {Object} props.value - The JSON object to be displayed and formatted.
 *
 * @example
 * <JsonCellExpand value={{ key1: 'value1', key2: 'value2' }} />
 *
 * @returns {JSX.Element} The rendered component.
 */
export function JsonCellExpand(props) {
  const formatJson = (json) => {
    if (typeof json !== 'object' || json === null) {
      return json;
    }
    return Object.entries(json)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <div 
        onClick={handleClick} 
        style={{
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatJson(props.value)}
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography component="pre" sx={{ overflow: 'auto', margin: 0, fontFamily: 'monospace', p: 2 }}>{JSON.stringify(props.value, 0, 2)}</Typography>
        </Box>
      </Popover>
    </div>
  );
}

export const selectColDef = (field, headerName, options, flex = 1) => ({
    field: field,
    headerName: headerName,
    flex: flex, 
    editable: true,
    renderCell: (params) => {
      const match = options.find(option => option.value === params.value);
      return match ? match.label : params.value;
    },
    renderEditCell: (params) => {
      return (
        <Autocomplete
          style={{ flex: 1 }}
          options={options}
          getOptionLabel={(option) => option.label || ''}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          value={options.find(option => option.value === params.value) || null}
          onChange={(event, newValue) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue?.value || null });
          }}
          renderInput={(params) => <TextField {...params} />}
          renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
        />
      );
    },
  });
/**
 * Generates a standard column definition object for a text field in a table.
 * 
 * @param {string} field - The field name for the column.
 * @param {string} headerName - The display name for the column header.
 * @param {number} [flex=1] - The flex value for the column width.
 * @returns {Object} The column definition object.
 */
export const standardColDef = (field, headerName, flex = 1, editable = false) => ({
  field: field,
  headerName: headerName,
  flex: flex,
  type: 'text',
  editable: editable,
  disableColumnMenu: false,
  sortable: true,
});

/**
 * Creates a column definition object for a date field in a data grid.
 *
 * @param {string} field - The field name for the column.
 * @param {string} headerName - The header name to display for the column.
 * @param {number} [flex=1] - The flex value for the column width.
 * @param {boolean} [editable=false] - Whether the column is editable.
 * @returns {Object} The column definition object.
 */
export const dateColDef = (field, headerName, type = 'date', flex = 1, editable = false) => ({
  field: field,
  headerName: headerName,
  flex: flex,
  type: type,
  valueGetter: (value) => value ? parseISO(value) : null,
  editable: editable,
  disableColumnMenu: false,
  sortable: true,
});

/**
 * Generates a column definition object for a JSON field in a table.
 * Clicking on the cell will display formatted JSON data in a popover,
 * using the JsonCellExpand component.
 *
 * @param {string} field - The field name for the column.
 * @param {string} headerName - The header name for the column.
 * @param {number} [flex=4] - The flex value for the column width.
 * @returns {Object} The column definition object.
 */
export const jsonColDef = (field, headerName, flex = 4) => ({
  field: field, 
  headerName: headerName,
  renderCell: (params) => {
    return <JsonCellExpand value={params.row[field]} />;
  },
  valueGetter: (value) => JSON.stringify(value),
  flex: flex, 
  type: 'text', 
  editable: false, 
  disableColumnMenu: false, 
  sortable: true
});

/**
 * Generates a column definition for a link field in a table.
 *
 * @param {string} [linkField='uuid'] - The field in the row data that contains the link value.
 * @param {string} pathField - The field in the row data that contains the path to be used for the link.
 * @returns {Object} The column definition object for the link field.
 */
export const linkColDef = (linkField='uuid', pathField) => ({
  field: 'link',
  headerName: '',
  width: 50, 
  renderCell: (params) => (
    <RenderInternalLink value={params.row[linkField]} path={params.row[pathField]} />
  ),
});

/**
 * Generates a column definition object for a boolean field in a data grid.
 *
 * @param {string} field - The field name for the column.
 * @param {string} headerName - The display name for the column header.
 * @returns {Object} The column definition object with properties for rendering a boolean field.
 *
 * @property {string} field - The field name for the column.
 * @property {string} headerName - The display name for the column header.
 * @property {number} width - The width of the column (default is 100).
 * @property {string} type - The type of the column (set to 'boolean').
 * @property {Function} renderCell - A function to render the cell content, using `renderBooleanCell`.
 * @property {boolean} editable - Indicates whether the column is editable (set to false).
 * @property {boolean} disableColumnMenu - Indicates whether the column menu is disabled (set to false).
 * @property {boolean} sortable - Indicates whether the column is sortable (set to true).
 */
export const boolColDef = (field, headerName) => ({
  field: field,
  headerName: headerName,
  width: 100,
  type: 'boolean',
  renderCell: (params) => {
    return renderBooleanCell(params);
  },
  editable: false,
  disableColumnMenu: false,
  sortable: true,
});

/**
 * Column definitions used in multiple tables.
 * For unique columns, see the standardColDef and jsonColDef functions.
 * 
 * @typedef {Object} ColDef
 * @property {Object} uuid - UUID column definition.
 * @property {Object} id - ID column definition.
 * @property {Object} link - Link column definition.
 * @property {Object} entryName - Entry name column definition.
 * @property {Object} name - Name column definition.
 * @property {Object} authorities - Authorities column definition.
 * @property {Object} inventory - Inventory column definition.
 * @property {Object} placeName - Place name column definition.
 * @property {Object} dateStart - Start year of a date range input column definition.
 * @property {Object} dateEnd - End year of a date range input column definition.
 * @property {Object} dateNotes - Date notes column definition.
 * @property {Object} indexTopics - Index topics column definition.
 * @property {Object} tags - Tags column definition.
 * @property {Object} completeBool - Complete boolean column definition.
 * @property {Object} visitedBool - Visited boolean column definition.
 */
export const colDef = {
  uuid: {
    field: 'uuid',
    headerName: 'UUID',
    flex: 2,
    type: 'text',
    editable: false,
    disableColumnMenu: false,
    sortable: false,
    filterable: false
  },
  id: {
    field: 'sort_id',
    headerName: 'Id',
    width: 75,
    type: 'text',
    editable: false,
    disableColumnMenu: false,
    sortable: true,
    renderCell: (params) => (
      <span>{params.row.entry_id}</span>
    ),
  },
 link: {
    field: 'link',
    headerName: '',
    width: 50,
    renderCell: (params) => (
      <RenderInternalLink value={params.row.entry_id} />
    ),
  },
  entryName: {
    field: 'entry_name',
    headerName: 'Name',
    flex: 2,
    type: 'text',
    editable: false,
    disableColumnMenu: false,
    sortable: true,
    renderCell: (params) => {
      return <TextCellExpand value={params.value} />;
    },
  },
  name: standardColDef('name', 'Name', 2),
  authorities: {
    field: 'authorities',
    headerName: 'Authority',
    flex: 1,
    type: 'text',
    editable: false,
    disableColumnMenu: false,
    sortable: true,
    renderCell: (params) => {
      return <RenderAuthorities value={params.value} />;
    },
  },
  inventory: {
    field: 'inventory',
    headerName: 'Inventory',
    flex: 2,
    editable: false,
    disableColumnMenu: false,
    sortable: true,
    renderCell: (params) => {
      return <TextCellExpand value={params.value} />;
    },
  },
  placeName: standardColDef('placename', 'Place', 2),
  dateStart: {
    field: 'dateStart',
    headerName: 'After Year',
    flex: 1,
    type: 'number',
    editable: false,
    disableColumnMenu: false,
    sortable: true,
    valueGetter: (_, row) => {
      const year = extractRangeDate(row?.dating, 'TPQ', 'year');
      return year.yearInt
    },
    renderCell: (params) => {
      const year = extractRangeDate(params.row?.dating, 'TPQ', 'year');
      return year.yearStr; // Use yearStr for rendering
    },
    getSortComparator: (sortDirection) => getYearSortComparator(sortDirection),
  },
  dateEnd: {
    field: 'dateEnd',
    headerName: 'Before Year',
    flex: 1,
    type: 'number',
    valueGetter: (_, row) => {
      const year = extractRangeDate(row?.dating, 'TAQ', 'year');
      return year.yearInt
    },
    renderCell: (params) => {
      const year = extractRangeDate(params.row?.dating, 'TAQ', 'year');
      return year.yearStr; // Use yearStr for rendering
    },
    getSortComparator: (sortDirection) => getYearSortComparator(sortDirection),
  },
  dateNotes: { 
    field: 'dating_notes', 
    headerName: 'Date notes', 
    flex: 1,
    renderCell: (cellValues) => {
      return <TextCellExpand value={cellValues.value} />;
    },
  },
  indexTopics: standardColDef('index_topic_names', 'Index topics'),
  tags: standardColDef('tag_namess', 'Tags'),
  completeBool: {
    field: 'complete',
    headerName: 'Complete',
    type: 'boolean',
    renderCell: renderBooleanCell,
    width: 100,
    sortable: true
  },
  visitedBool: {
    field: 'visited',
    headerName: 'Visited',
    type: 'boolean',
    renderCell: renderBooleanCell,
    width: 100,
    sortable: true
  },
};

export const surveyColDefs = {
  name: standardColDef('name', 'Name'),
  parent: standardColDef('parent', 'Parent'),
  type: standardColDef('type', 'Type'),
}
