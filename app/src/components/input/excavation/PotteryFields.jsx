import React, { useState, useEffect } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Paper, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Autocomplete from '@mui/material/Autocomplete';
import { v4 as uuidv4 } from 'uuid';


import { formatISO } from 'date-fns';
import { makeRequest } from 'services/query';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import { EditTable } from 'components/layout/Table';
import { colDef, standardColDef } from '@/helpers/tableRenders';


import { DataSubEntry } from 'components/layout/Sheets';
import {
  InputText,
  ToggleButtons,
  InputTextMulti, 
  SingleSelect,
} from 'components/input/InputFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';

export const AnalysisFields = ({ currData, setCurrData }) => {
  console.log("Render AnalysisFields")
  console.log("currData", currData)
  const terms = useStore(state => state.terms);
  const [currentObjects, setCurrentObjects] = useState(null);
  const [analysisLevel, setAnalysisLevel] = useState('');
  const [query, setQuery] = useState(null);
  const { loadAllData } = useDataLoader();

  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);
  const [rowsForDeletion, setRowsForDeletion] = useState([]);
  const [loading, setLoading] = useState(false);


  const [potteryData, setPotteryData] = useState([]);
  const [sherdObjects, setSherdObjects] = useState([]);
  const [inputValues, setInputValues] = useState({
    currentFabric: '',
    currentShape: {},
    currentDecoration: {},
    sherdCount: {},
  });

  useEffect(() => {
    if (currData && currData.uuid) {
      setQuery(`edit_object_pottery?parent=eq.${currData.uuid}`);
    }
    console.log('Current data:', currData);
  }, [currData]);

  useEffect(() => {
    if (query) {
      loadAllData(query, setCurrentObjects);
    }
  }, [query]);

  useEffect(() => {
    console.log('Pottery data:', potteryData);
    console.log('Sherd objects:', sherdObjects);
  }, [potteryData, sherdObjects]);

  useEffect(() => {
    if (currData?.object_count) {
      // Create sherdObjects for the total number of object_count
      const initialSherdObjects = Array.from({ length: currData.object_count }, () => ({
        uuid: uuidv4(), // Generate a unique ID for each sherd
        pot_fabric: null,
        pot_shape_sherd: null,
        pot_decoration: null,
        pot_surface: null,
        size_sherd: null,
        description: null,
        status: null,
      }));
      setSherdObjects(initialSherdObjects);
      console.log('Initialized sherdObjects:', initialSherdObjects);
    }
  }, [currData?.object_count]);

  const handleLocalInputChange = (e, key, parentKey = null) => {
    if (parentKey) {
      setInputValues({
        ...inputValues,
        [parentKey]: {
          ...inputValues[parentKey],
          [key]: e.target.value,
        },
      });
    } else {
      setInputValues({
        ...inputValues,
        [key]: e.target.value,
      });
    }
  };
  const handleLocalInputChangeNew = (newValue, key, parentKey = null) => {
    if (parentKey) {
      setInputValues({
        ...inputValues,
        [parentKey]: {
          ...inputValues[parentKey],
          [key]: newValue,
        },
      });
    } else {
      setInputValues({
        ...inputValues,
        [key]: newValue,
      });
    }
  };

  const handleAddFabric = () => {
    const totalFabrics = potteryData.reduce((sum, fabric) => sum + fabric.count, 0);

    if (totalFabrics + parseInt(inputValues.sherdCount['fabric'], 10) > currData.object_count) {
      alert('Total number of fabrics exceeds the total count of the bag.');
      return;
    }

    let remainingSherdCount = parseInt(inputValues.sherdCount['fabric'], 10);

    const updatedSherds = sherdObjects.map(sherd => {
      if (!sherd.pot_fabric && remainingSherdCount > 0) {
        sherd.pot_fabric = inputValues.currentFabric;
        remainingSherdCount--;
      }
      return sherd;
    });

    setSherdObjects(updatedSherds);

    setPotteryData([
      ...potteryData,
      {
        fabric: inputValues.currentFabric,
        count: parseInt(inputValues.sherdCount['fabric'], 10),
        shapes: [],
      },
    ]);

    setInputValues({
      ...inputValues,
      currentFabric: '',
      sherdCount: { ...inputValues.sherdCount, fabric: 0 },
    });
  };

  const handleAddShape = (fabric) => {
    const fabricData = potteryData.find(f => f.fabric === fabric);
    const totalShapes = fabricData.shapes.reduce((sum, shape) => sum + shape.count, 0);

    if (totalShapes + parseInt(inputValues.sherdCount[fabric], 10) > fabricData.count) {
      alert('Total number of shapes exceeds the number of sherds for this fabric.');
      return;
    }

    let remainingSherdCount = parseInt(inputValues.sherdCount[fabric], 10); // Use a local variable to keep track of the remaining count

    const updatedSherds = sherdObjects.map(sherd => {
      if (sherd.pot_fabric === fabric && !sherd.pot_shape_sherd && remainingSherdCount > 0) {
        sherd.pot_shape_sherd = inputValues.currentShape[fabric];
        remainingSherdCount--;
      }
      return sherd;
    });

    setSherdObjects(updatedSherds);
    setPotteryData(potteryData.map(f => {
      if (f.fabric === fabric) {
        return {
          ...f,
          shapes: [...f.shapes, { shape: inputValues.currentShape[fabric], count: parseInt(inputValues.sherdCount[fabric], 10), decorations: [] }]
        };
      }
      return f;
    }));
    setInputValues({
      ...inputValues,
      currentShape: { ...inputValues.currentShape, [fabric]: '' },
      sherdCount: { ...inputValues.sherdCount, [fabric]: 0 },
    });
  };

  const handleAddDecoration = (fabric, shape) => {
    const fabricData = potteryData.find(f => f.fabric === fabric);
    const shapeData = fabricData.shapes.find(s => s.shape === shape);
    const totalDecorations = shapeData.decorations.reduce((sum, decoration) => sum + decoration.count, 0);

    if (totalDecorations + parseInt(inputValues.sherdCount[`${fabric}-${shape}`], 10) > shapeData.count) {
      alert('Total number of decorations exceeds the number of sherds for this shape.');
      return;
    }

    let remainingSherdCount = parseInt(inputValues.sherdCount[`${fabric}-${shape}`], 10); // Use a local variable to keep track of the remaining count

    const updatedSherds = sherdObjects.map(sherd => {
      if (sherd.pot_fabric === fabric && sherd.pot_shape_sherd === shape && !sherd.pot_decoration && remainingSherdCount > 0) {
        sherd.pot_decoration = inputValues.currentDecoration[`${fabric}-${shape}`];
        remainingSherdCount--;
      }
      return sherd;
    });

    setSherdObjects(updatedSherds);
    setPotteryData(potteryData.map(f => {
      if (f.fabric === fabric) {
        return {
          ...f,
          shapes: f.shapes.map(s => {
            if (s.shape === shape) {
              return {
                ...s,
                decorations: [...s.decorations, { decoration: inputValues.currentDecoration[`${fabric}-${shape}`], count: parseInt(inputValues.sherdCount[`${fabric}-${shape}`], 10) }]
              };
            }
            return s;
          })
        };
      }
      return f;
    }));
    setInputValues({
      ...inputValues,
      currentDecoration: { ...inputValues.currentDecoration, [`${fabric}-${shape}`]: '' },
      sherdCount: { ...inputValues.sherdCount, [`${fabric}-${shape}`]: 0 },
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Pottery data:', potteryData);
      console.log('Sherd objects:', sherdObjects);

      alert('Data submitted successfully');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data');
    }
  };

  const getAvailableOptions = (options, selectedOptions) => {
    return options.filter(option => !selectedOptions.includes(option));
  };

  const getFabricOptions = () => {
    return getAvailableOptions(['fabric1', 'fabric2'], potteryData.map(f => f.fabric));
  };

  const getShapeOptions = (fabric) => {
    const fabricData = potteryData.find(f => f.fabric === fabric);
    return getAvailableOptions(['shape1', 'shape2'], (fabricData?.shapes || []).map(s => s.shape));
  };

  const getDecorationOptions = (fabric, shape) => {
    const fabricData = potteryData.find(f => f.fabric === fabric);
    const shapeData = fabricData?.shapes.find(s => s.shape === shape);
    return getAvailableOptions(['decoration1', 'decoration2'], (shapeData?.decorations || []).map(d => d.decoration));
  };

  const columns = [
    colDef.uuid,
    standardColDef('identifier', 'Id', 1, true),
    {
      field: 'pot_fabric',
      headerName: 'Fabric',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.pot_fabric
    },
    {
      field: 'pot_shape_sherd',
      headerName: 'Shape',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.pot_shape_sherd
    },
    {
      field: 'pot_decoration',
      headerName: 'Decoration',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.pot_decoration
    },
    {
      field: 'pot_surface',
      headerName: 'Surface Treatment',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.pot_surface
    },
    standardColDef('size_sherd', 'Size', 2, true),
    standardColDef('description', 'Description', 3, true),
    {
      field: 'status',
      headerName: 'Status',
      flex: 2,
      editable: true,
      type: 'singleSelect',
      valueOptions: terms?.find_status
    },
  ];

    const handleSave = async () => {
      console.log('Saving Relationships');
      try {
        const updateData = rels.map(rel => {
          const {  ...rest } = rel;
          return {
            ...rest,
            parent: currData.uuid,
            updated_at: formatISO(new Date()),
            updated_by: activeActor?.uuid || null
          };
        });
  
        const updatedRow = await makeRequest(
          'POST', 
          `edit_object_pottery`,
          updateData, 
          "Prefer: resolution=merge-duplicates,return=representation"
        );
        console.log('Data updated: ', updatedRow);
        if(rowsForDeletion){
          console.log(rowsForDeletion)
          let numberDeletions = rowsForDeletion.length;
          const deletedRows = await makeRequest('DELETE', `edit_object_pottery?uuid=eq(any).{${rowsForDeletion}}&limit=${numberDeletions}&order=uuid`,'{}', "Prefer: return=representation");
          console.log(`${numberDeletions} row(s) deleted: ${deletedRows}`);
          setRowsForDeletion([]);
        }  
        setSnackbarData ({
          "actionType": "save",
          "messageType": "success",
          "messageText": "Relationships updated."
        });
      } catch (error) {
        console.log('Error saving data: ', error);
        setSnackbarData ({
          "actionType": "save",
          "messageType": "error",
          "messageText": "Save failed: \n\n" + error.message + " \n " + error.response?.data.message
        });
      }
      setSnackbarOpen(true)
    };

  return (
    <DataSubEntry heading={"Pottery Sorting"}>
      <Grid
        container
        size={{ xs: 12, }}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Grid size={{ xs: 12, lg: 4 }}>
          <InputText
            name="object_count"
            label="Total sherds in bag"
            value={currData?.object_count}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            validation='integer'
            inputProps={{
              type: 'text',
              pattern: "^[0-9]+$" //integer
            }}
            toolTip='The total number of sherds in the bag.'
          />
        </Grid>
      </Grid>
      {currData && currData.object_count && (
        <Grid
          container
          size={{ xs: 12, lg: 4 }}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1">
              {sherdObjects.filter(sherd => sherd.pot_fabric !== null).length} assigned of {sherdObjects.length} total sherds
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SingleSelect
              name="currentFabric"
              label="Fabric"
              currData={inputValues}
              setCurrData={setInputValues}
              options={terms.pot_fabric}
              optionLabel="label"
              optionValue="value"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <InputText
                name="sherdCount"
                label="Sherd Count"
                value={inputValues.sherdCount['fabric']}
                onBlur={(data) => handleLocalInputChange(data, 'fabric', 'sherdCount')}
                validation="integer"
                inputProps={{
                  type: 'text',
                  pattern: "^[0-9]+$", // integer
                }}
                toolTip={`The number of sherds in the selected fabric.`}
              />
              <Button onClick={handleAddFabric}>Add Fabric</Button>
            </Box>
          </Grid>
        </Grid>
      )}
      <Grid container size={{ xs: 12, lg: 8 }}
      sx={{
        alignItems: "flex-start",
      }}
      >
      {potteryData.map((fabric, index) => {
        // Calculate the number of assigned shapes for this fabric
        const assignedShapesForFabric = fabric.shapes.reduce((sum, shape) => sum + shape.count, 0);

        return (
          <React.Fragment key={index}>
            <Grid
              container
              size={{ xs: 12, lg: 6 }}
              sx={{
                alignItems: "flex-start",
              }}
            >
              <Grid size={{ xs: 12 }}>
                <Typography variant="body1">
                  {terms.pot_fabric.find(option => option.value === fabric?.fabric)?.label || fabric.fabric} ({assignedShapesForFabric} of {fabric.count})
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  style={{ flex: 1 }}
                  id={"currentShape" + index}
                  options={terms.pot_shape_sherd}
                  getOptionLabel={(option) => option["label"]}
                  isOptionEqualToValue={(option, value) => option["value"] === value["value"]}
                  value={inputValues.currentShape[fabric.fabric]}
                  onChange={(event, newValue) =>
                    handleLocalInputChangeNew(newValue.value, fabric.fabric, 'currentShape')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Shape"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option["value"]}>
                      {option["label"]}
                    </li>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <InputText
                    name="sherdCount"
                    label="Sherd Count"
                    value={inputValues.sherdCount[fabric.fabric]}
                    onBlur={(data) => handleLocalInputChange(data, fabric.fabric, 'sherdCount')}
                    validation="integer"
                    inputProps={{
                      type: 'text',
                      pattern: "^[0-9]+$", // integer
                    }}
                    toolTip="The number of sherds in the selected shape."
                  />
                  <Button onClick={() => handleAddShape(fabric.fabric)}>Add Shape</Button>
                </Box>
              </Grid>
            </Grid>
            <Grid container size={{ xs: 12, lg: 6 }}>
              {fabric.shapes.map((shape, shapeIndex) => {
                // Calculate the number of assigned decorations for this shape
                const assignedDecorationsForShape = shape.decorations.reduce((sum, decoration) => sum + decoration.count, 0);

                return (
                  <Grid container size={{ xs: 12 }} key={shapeIndex}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body1">
                        {terms.pot_shape_sherd.find(option => option.value === shape.shape)?.label || shape.shape} ({assignedDecorationsForShape} of {shape.count})
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Autocomplete
                        style={{ flex: 1 }}
                        id={"currentDecoration" + index}
                        options={terms.pot_decoration}
                        getOptionLabel={(option) => option["label"]}
                        isOptionEqualToValue={(option, value) => option["value"] === value["value"]}
                        value={inputValues.currentDecoration[`${fabric.fabric}-${shape.shape}`]}
                        onChange={(event, newValue) =>
                          handleLocalInputChangeNew(newValue.value, `${fabric.fabric}-${shape.shape}`, 'currentDecoration')
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Decoration"
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option["value"]}>
                            {option["label"]}
                          </li>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <InputText
                          name="sherdCount"
                          label="Sherd Count"
                          value={inputValues.sherdCount[`${fabric.fabric}-${shape.shape}`]}
                          onBlur={(data) => handleLocalInputChange(data, `${fabric.fabric}-${shape.shape}`, 'sherdCount')}
                          validation="integer"
                          inputProps={{
                            type: 'text',
                            pattern: "^[0-9]+$", // integer
                          }}
                          toolTip="The number of sherds with the selected decoration."
                        />
                        <Button onClick={() => handleAddDecoration(fabric.fabric, shape.shape)}>Add Decoration</Button>
                      </Box>
                    </Grid>
                    {shape.decorations.map((decoration, decorationIndex) => {
                      return (
                        <Grid container size={{ xs: 12 }} key={decorationIndex}>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body1">
                              {terms.pot_decoration.find(option => option.value === decoration.decoration)?.label || decoration.decoration} ({decoration.count})
                            </Typography>
                          </Grid>
                        </Grid>
                      );
                    })}
                  </Grid>
                );
              })}
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
      <Button onClick={handleSubmit}>Submit</Button>
      <Grid size={{ xs: 12, xl: 12 }}>
        <h6>Current Objects</h6>
        <EditTable 
          columns={columns}
          rows={sherdObjects}
          setRows={setSherdObjects}
          setRowsForDeletion={setRowsForDeletion}
          handleSave={handleSave}
        />
      </Grid>
    </DataSubEntry>
  );
};

export function BagdetailFields({ currData, setCurrData }) {
  return (
    <DataSubEntry header="Pottery Bag Details">
      <Grid size={{ xs: 12 }}>
        <InputText
          name="identifier"
          label="Placeholder 1"
          value={currData?.identifier}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='integer'
          inputProps={{
            type: 'text',
            pattern: "^[0-9]+$" //integer
          }}
          toolTip='This is a temporary placeholder.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputText
          name="object_count"
          label="Total sherds in bag"
          value={currData?.object_count}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='integer'
          inputProps={{
            type: 'text',
            pattern: "^[0-9]+$" //integer
          }}
          toolTip='The total number of sherds in the bag.'
        />
      </Grid>
    </DataSubEntry>
  );
};
