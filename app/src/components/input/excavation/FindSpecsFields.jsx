import React, {useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore } from 'services/store';
import { InputWrapper } from '@/components/layout/InputWrapper';
import {
  InputText,
  InputTextMulti,
  SingleSelect,
  MultiSelect
} from 'components/input/InputFields';
import { 
    handleJSONChange,
} from 'helpers/buttonActions';

   const InputAmount = ({ localData, setLocalData, toolTip }) => {
    return (
        <Grid size={{ xs: 4, sm: 3, md: 3 }}>
            <InputText
            name="amount"
            label="Amount (%)"
            value={localData?.amount}
            onBlur={(event) => setLocalData((prevData) => ({
                    ...prevData,
                    [event.target.name]: event.target.value
                }))}
            validation='percent'
            inputProps={{
                type: 'text',
                min: 0, 
                max: 100, 
                pattern: "^[0-9]*$",                
            }}          
            toolTip={toolTip}
            />        
        </Grid>
    );
  };

  const InputSizeMulti = ({ localData, setLocalData, options, toolTip }) => {
    return (
        <Grid size={{ xs: 8, sm: 9, md: 9 }}>
            <MultiSelect
            name="size"
            label="Size"
            currData={localData}
            setCurrData={setLocalData}
            options={options}
            optionLabel="label"
            optionValue="value"
            toolTip={toolTip}
            />
        </Grid>
    );
  };

  const InputSizeSingle = ({ localData, setLocalData, options, toolTip }) => {
    return (
        <Grid size={{ xs: 8, sm: 9, md: 9 }}>
            <SingleSelect
            name="size"
            label="Size"
            currData={localData}
            setCurrData={setLocalData}
            options={options}
            optionLabel="label"
            optionValue="value"
            toolTip={toolTip}
            />
        </Grid>
    );
  };

const FindSpecsFields = ({ currData, setCurrData, name, label, terms, handleDelete }) => {
  const [localData, setLocalData] = useState(currData?.specialist_evaluation[name]);
  const actors = useStore(state => state.actors);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'specialist_evaluation')
  }, [localData]);

 
  return (
    <InputWrapper
      label={label}
    >
      <Grid container spacing={2}
      sx={{ position: 'relative' }}>
        <IconButton
          onClick={() => handleDelete(name)}
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
          }}
        >
          <DeleteIcon />
        </IconButton>        
        <Grid size={{ xs: 12, sm: 6 }}>
          <SingleSelect
            name="class"
            label="Class"
            currData={localData}
            setCurrData={setLocalData}
            options={terms.artefact_class}
            optionLabel="label"
            optionValue="value"
            toolTip='Object classification.'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SingleSelect
            name="material"
            label="Material"
            currData={localData}
            setCurrData={setLocalData}
            options={terms.artefact_material}
            optionLabel="label"
            optionValue="value"
            toolTip='Object material.'
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <InputTextMulti
            name="comment"
            label="Comment"
            value={localData?.comment}
            onBlur={(event) => setLocalData((prevData) => ({
                ...prevData,
                [event.target.name]: event.target.value
            }))}
            inputProps={{
              type: 'text'
            }}
            rows={3}
            toolTip='Specialist comment.'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SingleSelect
            name="specialist_uuid"
            label="Specialist"
            currData={localData}
            setCurrData={setLocalData}
            options={actors}
            optionLabel="name"
            optionValue="uuid"
            toolTip='Specialist who evaluated the object.'
          />
        </Grid>
      </Grid>
    </InputWrapper>
  );
};

export default FindSpecsFields;