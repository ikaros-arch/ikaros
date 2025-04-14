// buttonActions helper module
import { formatISO } from 'date-fns';
import { formatToPostgresDateRange } from 'helpers/transformers';
import { isUUID } from 'helpers/validation';


export function handlePress(navigate, target) {
  navigate(target);
};

export function handleInputChange(event, currData, setCurrData) {
  let { name, value } = event.target;
  try {
      let parsedValue = JSON.parse(value);
      // If parse is successful replace value with parsedValue
      value = parsedValue;
  } catch(e) {
      // Parsing failed, value was not JSON. Continue to use the original string value.
  }  
  let updatedData = { ...currData, [name]: value === '' ? null : value };
  setCurrData(updatedData);
};

export function handleJSONChange(localData, currData, setCurrData, type, parent) {
  let updatedData = { 
      ...currData, 
      [parent]: {
          ...currData[parent],
          [type]: {
              ...localData
          }
      }
  };
  setCurrData(updatedData);
};

export function handleDateChange(date, name, currData, setCurrData) {
    const isoDateString = formatISO(date);
    let updatedData = { ...currData, [name]: isoDateString };
    setCurrData(updatedData);
};

export function handleDateRangeChange(dateRange, name, currData, setCurrData) {
  let formattedDateRange = formatToPostgresDateRange(dateRange);
  let updatedData = { ...currData, [name]: formattedDateRange };
  setCurrData(updatedData);
}; 

export function handleCheckChange(event, name, currData, setCurrData) {
  let updatedData = { ...currData, [name]: event.target.checked };
  setCurrData(updatedData);
};

export function handleAutocompleteChange(event, newValue, name, currData, setCurrData) {
  const isValueObject = newValue && typeof newValue === 'object';

  let updatedData = { 
    ...currData, 
    [name]: 
      isValueObject 
      ? newValue.uuid 
        ? newValue.uuid 
        : newValue.value 
      : newValue
      || null
    };
  setCurrData(updatedData);
};

export function handleMultiAutocompleteChange(event, newValues, name, currData, setCurrData) {
  let selectedValues = null;
  console.log("newValues");
  console.log(newValues);
  if(newValues) {
    selectedValues = newValues.map(option =>  option.uuid ? option.uuid : option.value);
  }
  let updatedData = { ...currData, [name]: selectedValues};
  setCurrData(updatedData);
};

export function handleArrayChange(newValues, name, currData, setCurrData) {
  let updatedData = { ...currData, [name]: newValues};
  setCurrData(updatedData);
};

export function goToRecord(navigate, entry_id) {
  if (isUUID(entry_id)) {
    navigate(`./${entry_id}`);
  } else if (entry_id.startsWith('D')) {
    navigate(`/Documentary/${entry_id}`);
  } else if (entry_id.startsWith('L')) {
    navigate(`/Literary/${entry_id}`);
  } else if (entry_id.startsWith('A')) {
    navigate(`/Archaeological/${entry_id}`);
  } else if (entry_id.startsWith('V')) {
    navigate(`/Visual/${entry_id}`);
  } else {
    navigate(`./${entry_id}`)
  }
  return '';
};