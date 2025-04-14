import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';
import ToolTipButton from "components/buttons/ToolTipButton"
import { 
  handleAutocompleteChange, 
  handleMultiAutocompleteChange,
  handleArrayChange,
  handleCheckChange,
  handleDateChange,
  handleDateRangeChange
} from 'helpers/buttonActions';
import { 
  parsePostgresDateRange
} from 'helpers/transformers';

/**
 * InputText component renders a text input field with validation and tooltip support.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.value - The value of the input field from the parent component.
 * @param {function} props.onChange - The function to call when the input value changes.
 * @param {function} props.onBlur - The function to call when the input field loses focus.
 * @param {Object} props.InputProps - Additional properties to pass to the TextField component.
 * @param {string} props.validation - The type of validation to apply ('integer' or 'percent').
 * @param {string} props.toolTip - The tooltip text to display.
 *
 * @returns {JSX.Element} The rendered InputText component.
 */
export const InputText = ({ name, label, value: parentValue, onChange, onBlur, inputProps, validation, toolTip }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const numericValue = parseInt(value, 10);

  useEffect(() => {
    switch (validation) {
      case 'integer':
        if (!/^\d*$/.test(value)) {
          setError('Only whole numbers (integers) are allowed.');
        } else {
          setError(null);
        }
        break;
      case 'percent':
        if (numericValue < 0 || numericValue > 100) { //integer values between 0 and 100
          setError('Value must be a whole percent between 0 and 100.');
        } else {
          setError(null);
        }
        break;
      default:
        setError(null);
        break;
    }
  }, [value]);

  useEffect(() => {
    setValue(parentValue || '');
  }, [parentValue]);

  const handleLocalChange = (e) => {
    setValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleLocalBlur = (e) => {
    // Call the parent's onBlur if it exists
    if (onBlur) onBlur(e);
  };

  return (
    <ToolTipButton
    toolTip={toolTip}
    >
      <TextField
        label={label}
        variant="outlined"
        fullWidth
        id={name}
        name={name}
        value={value}
        onChange={handleLocalChange}
        onBlur={handleLocalBlur}
        InputProps={{ ...inputProps }}
        helperText={error ? error : ''}
      />
    </ToolTipButton>
  );
};

// Add PropTypes validation
InputText.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  inputProps: PropTypes.object,
  validation: PropTypes.oneOf(['integer', 'percent']),
  toolTip: PropTypes.string
};

/**
 * InputTextMulti component renders a multiline text input field with a tooltip.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.value - The value of the input field from the parent component.
 * @param {function} props.onChange - The function to call when the input value changes.
 * @param {function} props.onBlur - The function to call when the input loses focus.
 * @param {number} props.rows - The number of rows for the multiline input.
 * @param {string} props.toolTip - The tooltip text to display.
 *
 * @returns {JSX.Element} The rendered InputTextMulti component.
 */
export const InputTextMulti = ({ name, label, value: parentValue, onChange, onBlur, rows, toolTip }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(parentValue || '');
  }, [parentValue]);

  const handleLocalChange = (e) => {
    setValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleLocalBlur = (e) => {
    // Call the parent's onBlur if it exists
    if (onBlur) onBlur(e);
  };

  return (
    <ToolTipButton
    toolTip={toolTip}
    >
      <TextField
        label={label}
        variant="outlined"
        multiline
        fullWidth
        rows={rows}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleLocalChange}
        onBlur={handleLocalBlur}
      />
    </ToolTipButton>
  );
};

// Add PropTypes validation
InputTextMulti.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  rows: PropTypes.number,
  toolTip: PropTypes.string
};

/**
 * SingleSelect component renders a single select dropdown using Material-UI's Autocomplete component.
 * It supports both array of objects and array of strings as options.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the select input.
 * @param {string} props.label - The label for the select input.
 * @param {Array} [props.options=[]] - The options for the select input, can be an array of objects or strings.
 * @param {string} props.optionLabel - The key for the label in the option object.
 * @param {string} props.optionValue - The key for the value in the option object.
 * @param {Object} props.currData - The current data object containing the selected value.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {React.ReactNode} [props.endAdornment] - The custom end adornment for the input field.
 * @param {string} [props.toolTip] - The tooltip text for the input field.
 * @returns {JSX.Element} The rendered SingleSelect component.
 */
export const SingleSelect = ({ name, label, options = [], optionLabel, optionValue, currData, setCurrData, endAdornment, toolTip }) => {
  // Check if options exists, and it it is an array of objects or strings
  if (!options || options.length === 0) {
    return (
      <TextField label={`${label} (No options)`} variant="outlined" disabled fullWidth  />
    );
  }
  const isOptionObject = options.length > 0 && typeof options[0] === 'object';
  
  return (
    <Autocomplete
      style={{ flex: 1 }}
      id={name}
      options={options}
      getOptionLabel={
        isOptionObject 
        ? (option) => option[optionLabel] 
        : (option) => option
      }
      isOptionEqualToValue={
        isOptionObject 
        ? (option, value) => option[optionValue] === value[optionValue] 
        : (option, value) => option === value
      }
      value={
        currData 
        ? (isOptionObject 
          ? options.find(option => option[optionValue] === currData[name]) 
          : currData[name]) || null 
        : null
      }
      onChange={(event, newValue) => 
        handleAutocompleteChange(event, newValue, name, currData, setCurrData)
      }
      renderInput={(params) => (
        <ToolTipButton
        toolTip={toolTip}
        >
          <TextField 
            {...params} 
            label={label} 
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {params.InputProps.endAdornment} {/* Preserve other adornments */}
                  {endAdornment} {/* Pass custom adornment */}
                </React.Fragment>
              ),
            }} 
          />
        </ToolTipButton>
      )}
      renderOption={(props, option) => (
        <li {...props} key={isOptionObject ? option[optionValue] : option}>
          {isOptionObject ? option[optionLabel] : option}
        </li>
      )} 
    />
  );
};

// Add PropTypes validation
SingleSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array,
  optionLabel: PropTypes.string,
  optionValue: PropTypes.string,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  endAdornment: PropTypes.node,
  toolTip: PropTypes.string
};

/**
 * MultiSelect component renders a multi-select dropdown using Autocomplete from Material-UI.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {Array} [props.options=[]] - The array of options to display in the dropdown.
 * @param {string} props.optionLabel - The key in the options object to use as the display label.
 * @param {string} props.optionValue - The key in the options object to use as the value.
 * @param {Object} props.currData - The current data object containing selected values.
 * @param {Function} props.setCurrData - The function to update the current data object.
 * @param {string} [props.toolTip] - The tooltip text to display.
 * @returns {JSX.Element} The rendered MultiSelect component.
 */
export const MultiSelect = ({ name, label, options = [], optionLabel, optionValue, currData, setCurrData, toolTip }) => {
  if (!options || options.length === 0) {
    return (
      <TextField label={`${label} (No options)`} variant="outlined" disabled fullWidth  />
    );
  }

  return (
      <Autocomplete
        disablePortal
        multiple
        disableCloseOnSelect
        id={name}
        fullWidth
        options={options}
        getOptionLabel={(option) => option[optionLabel]}
        isOptionEqualToValue={(option, value) => option[optionValue] === value[optionValue]}             
        value={ 
          currData && currData[name] 
          ? options.filter(option => currData[name].includes(option[optionValue])) 
          : [] 
        }
        onChange={(event, newValue) => handleMultiAutocompleteChange(event, newValue, name, currData, setCurrData)}
        renderInput={(params) => (
          <ToolTipButton
          toolTip={toolTip}
          >         
            <TextField {...params} label={label} />
          </ToolTipButton> 
          )}
        renderOption={(props, option) => <li {...props} key={option[optionValue]}>{option[optionLabel]}</li>} 
      />
   )
};

// Add PropTypes validation
MultiSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array,
  optionLabel: PropTypes.string.isRequired,
  optionValue: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};

/**
 * MultiFree component renders an Autocomplete input field with multiple selection and free solo options.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {Object} props.currData - The current data object containing the input values.
 * @param {Function} props.setCurrData - The function to update the current data object.
 * @param {string} props.toolTip - The tooltip text to be displayed.
 * @returns {JSX.Element} The rendered MultiFree component.
 */
export const MultiFree = ({ name, label, currData, setCurrData, toolTip }) => {
    return (
      <Autocomplete
        disablePortal
        multiple
        freeSolo
        autoSelect
        options={[]}
        id={name}
        fullWidth
        value={ 
          currData && currData[name] 
          ? currData[name] 
          : [] 
        }
        onChange={(event, newValue) => handleArrayChange(newValue, name, currData, setCurrData)}
        renderInput={(params) => (
          <ToolTipButton
          toolTip={toolTip}
          >
            <TextField {...params} label={label} />
          </ToolTipButton>
        )}       
      />
   )
};

// Add PropTypes validation
MultiFree.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};

/**
 * CheckInput component renders a checkbox with a label and a tooltip.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the checkbox input.
 * @param {string} props.label - The label for the checkbox input.
 * @param {Object} props.currData - The current data object containing the checkbox state.
 * @param {Function} props.setCurrData - The function to update the current data object.
 * @param {string} props.toolTip - The tooltip text to be displayed.
 * @returns {JSX.Element} The rendered CheckInput component.
 */
export const CheckInput = ({ name, label, currData, setCurrData, toolTip }) => {
  return (
    <ToolTipButton toolTip={toolTip}>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!(currData && currData[name])} // Ensure checked is always a boolean
            onChange={(event) => handleCheckChange(event, name, currData, setCurrData)}
            color='primary'
          />
        }
        label={label}
      />
    </ToolTipButton>
  );
};

// Add PropTypes validation
CheckInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};

/**
 * SingleSelectLocal component renders an Autocomplete input field with options.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {Array} props.options - The options for the Autocomplete, can be an array of objects or strings.
 * @param {string} props.optionLabel - The key for the label in the options objects.
 * @param {string} props.optionValue - The key for the value in the options objects.
 * @param {string} props.currData - The current selected value.
 * @param {Function} props.setCurrData - The function to update the current selected value.
 * @param {React.ReactNode} [props.endAdornment] - The custom end adornment for the input field.
 * @param {string} [props.toolTip] - The tooltip text for the input field.
 * @returns {JSX.Element} The rendered SingleSelectLocal component.
 */
export const SingleSelectLocal = ({ name, label, options, optionLabel, optionValue, currData, setCurrData, endAdornment, toolTip }) => {
  // Check if options is an array of objects or strings
  const isOptionObject = options.length > 0 && typeof options[0] === 'object';

  const handleChange = (newValue) => {
    setCurrData(newValue?.value || '')
  };
  return (
    <Autocomplete
        style={{ flex: 1 }}
        id={name}
        options={options}
        getOptionLabel={
          isOptionObject 
          ? (option) => option[optionLabel] 
          : (option) => option
        }
        isOptionEqualToValue={
          isOptionObject 
          ? (option, value) => option[optionValue] === value[optionValue] 
          : (option, value) => option === value
        }
        value={
          currData 
          ? (isOptionObject 
            ? options.find(option => option[optionValue] === currData) 
            : currData) || null 
          : null
        }
        onChange={(event, newValue) => 
          handleChange(newValue)
        }
        renderInput={(params) => (
          <ToolTipButton
          toolTip={toolTip}
          >  
            <TextField 
              {...params} 
              label={label} 
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {params.InputProps.endAdornment} {/* Preserve other adornments */}
                    {endAdornment} {/* Pass custom adornment */}
                  </React.Fragment>
                ),
              }} 
            />
          </ToolTipButton>
        )}
        renderOption={(props, option) => <li {...props} key={option[optionValue]}>{option[optionLabel]}</li>} 
    />
  );
};

// Add PropTypes validation
SingleSelectLocal.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array,
  optionLabel: PropTypes.string,
  optionValue: PropTypes.string,
  currData: PropTypes.string,
  setCurrData: PropTypes.func.isRequired,
  endAdornment: PropTypes.node,
  toolTip: PropTypes.string
};

/**
 * ToggleButtons component renders a group of toggle buttons with tooltips.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the field.
 * @param {string} props.label - The label for the toggle button group.
 * @param {Array} props.options - The array of options for the toggle buttons.
 * @param {string} props.optionLabel - The key for the option label.
 * @param {string} props.optionValue - The key for the option value.
 * @param {Object} props.currData - The current data object.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {string} props.toolTip - The tooltip text.
 * @returns {JSX.Element} The rendered ToggleButtons component.
 */
export const ToggleButtons = ({ name, label, options, optionLabel, optionValue,currData, setCurrData, toolTip }) => {
  const selectedValue = currData[name] || '';

  return (
    <ToolTipButton
    toolTip={toolTip}
    >  
      <ToggleButtonGroup
        value={selectedValue}
        exclusive
        onChange={(event, newValue) => 
          handleAutocompleteChange(event, newValue, name, currData, setCurrData)
        }
        aria-label={label}
      >
        {options.map(option => (
          <ToggleButton 
            key={option[optionValue]} 
            value={option[optionValue]} 
            aria-label={option[optionLabel]}
            sx={{
              padding: '6px 10px',
              minWidth: 80,   // Adjust width of each button
              backgroundColor: selectedValue === option.value ? 'primary.main' : 'grey.300',
              color: selectedValue === option.value ? 'common.white' : 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'common.white',
              },
              '&:hover': {
                backgroundColor: selectedValue === option.value ? 'primary.dark' : 'grey.400',
              },
            }}
          >
            {option[optionLabel]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </ToolTipButton>
  );
};

// Add PropTypes validation
ToggleButtons.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  optionLabel: PropTypes.string.isRequired,
  optionValue: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};

/**
 * DateRange component renders two DatePicker components for selecting a date range.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.startLabel - The label for the start date picker.
 * @param {string} props.endLabel - The label for the end date picker.
 * @param {string} props.name - The name of the date range field.
 * @param {Object} props.currData - The current data object containing the date range.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {string} props.toolTip - The tooltip text to be displayed.
 * @returns {JSX.Element} The DateRange component.
 */
export const DateRange = ({ startLabel, endLabel, name, currData, setCurrData, toolTip }) => {
  const dateRange = parsePostgresDateRange(currData[name]);

  return (
    <ToolTipButton
    toolTip={toolTip}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DatePicker
          label={startLabel}
          value={dateRange[0]}
          onChange={(newValue) => 
            handleDateRangeChange([newValue, dateRange[1]], name, currData, setCurrData)
          }
        />
        <Box sx={{ mx: 1 }}>—</Box>
        <DatePicker
          label={endLabel}
          value={dateRange[1]}
          onChange={(newValue) => 
            handleDateRangeChange([dateRange[0], newValue], name, currData, setCurrData)
          }
        />
      </Box>
    </ToolTipButton>
  );
};

// Add PropTypes validation
DateRange.propTypes = {
  startLabel: PropTypes.string.isRequired,
  endLabel: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};

/**
 * DateTime component renders a DateTimePicker wrapped with a ToolTipButton.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the date field.
 * @param {string} props.label - The label for the DateTimePicker.
 * @param {Object} props.currData - The current data object containing date values.
 * @param {Function} props.setCurrData - The function to update the current data.
 * @param {string} props.toolTip - The tooltip text to be displayed.
 * @returns {JSX.Element} The rendered DateTime component.
 */
export const DateTime = ({ name, label, currData, setCurrData, toolTip }) => {
  const timeValue = currData ? (currData[name] ? parseISO(currData[name]): null) : null;

  return (
    <ToolTipButton
    toolTip={toolTip}
    >  
      <DateTimePicker
        label={label}
        value={timeValue}
        onChange={(date) => handleDateChange(date, name, currData, setCurrData)}
      />
    </ToolTipButton>
  );
};

// Add PropTypes validation
DateTime.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  currData: PropTypes.object,
  setCurrData: PropTypes.func.isRequired,
  toolTip: PropTypes.string
};
