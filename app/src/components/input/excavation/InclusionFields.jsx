import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import { InputWrapper } from '@/components/layout/InputWrapper';
import {
  InputText,
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

export const InclusionBuildingFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of building stone in percent.'
      />
      <InputSizeMulti
        options={terms.size_stone}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of building stone inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionUnworkedFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of unworked stone (not from building) in percent.'
      />
      <InputSizeMulti
        options={terms.size_stone}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of unworked, non-building stone inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionMortarFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of plaster or mortar in percent.'
      />
    </InputWrapper> 
  );
};

export const InclusionMudbrickFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of mudbrick in percent.'
      />
    </InputWrapper> 
  );
};

export const InclusionTileFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of tile in percent.'
      />
    </InputWrapper> 
  );
}; 

export const InclusionCeramicFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of pottery and ceramics in percent.'
      />
      <InputSizeMulti
        options={terms.size_sherds}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of ceramic inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionObsidianFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of obsidian in percent.'
      />
    </InputWrapper> 
  );
};

export const InclusionShellFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of shell in percent.'
      />
      <InputSizeSingle
        options={terms.size_shell_bone}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of shell inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionBoneFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of bone in percent.'
      />
      <InputSizeSingle
        options={terms.size_shell_bone}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of bone inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionCarbonFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of carbon, charcoal and ash in percent.'
      />
      <InputSizeSingle
        options={terms.size_charcoal}
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Size of carbon, charcoal and ash inclusions.'
      />
    </InputWrapper> 
  );
};

export const InclusionOtherFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions of carbon, charcoal and ash in percent.'
      />
      <Grid size={{ xs: 8, sm: 9, md: 9 }}>
        <InputText
          name="definition"
          label="Definition"
          value={localData?.definition}
          onBlur={(event) => setLocalData((prevData) => ({
            ...prevData,
            [event.target.name]: event.target.value
          }))}
          inputProps={{
            type: 'text'
          }}
          toolTip='Other inclusions: define if present.'
        />
      </Grid>
    </InputWrapper> 
  );
};

export const InclusionOverallFields = ({ currData, setCurrData, name, label, terms }) => {
  const [localData, setLocalData] = useState(currData?.inclusions[name]);

  useEffect(() => {
    handleJSONChange(localData, currData, setCurrData, name, 'inclusions')
  }, [localData]);

  return (
    <InputWrapper label={label}>
      <InputAmount
        localData={localData}
        setLocalData={setLocalData}
        toolTip='Inclusions overall: The overall percentage of inclusions.'
      />
      <Grid size={{ xs: 8, sm: 9, md: 9 }}>
        <SingleSelect
          name="sorting"
          label="Sorting"
          currData={localData}
          setCurrData={setLocalData}
          options={terms.inclusion_sorting}
          optionLabel="label"
          optionValue="value"
          toolTip='Sorting of the inclusions: the degree of sorting is a measure of the frequency with which inclusions of the same size occur.'
        />
      </Grid>
    </InputWrapper> 
  );
};