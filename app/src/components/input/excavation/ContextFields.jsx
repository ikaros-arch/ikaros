import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import Grid from '@mui/material/Grid2';
import { Button, MenuItem, Select, FormControl, InputLabel, IconButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import { useStore } from 'services/store';
import { useDataLoader } from 'hooks/useDataLoader';
import {
  InputText,
  InputTextMulti, 
  SingleSelect,
  MultiSelect,
  DateRange,
  CheckInput
} from 'components/input/InputFields';
import { TextEditor } from 'components/input/MarkDownEditor';
import { DataSubEntry } from 'components/layout/Sheets';
import {
  InclusionBuildingFields,
  InclusionUnworkedFields,
  InclusionMortarFields,
  InclusionMudbrickFields,
  InclusionTileFields,
  InclusionCeramicFields,
  InclusionObsidianFields,
  InclusionShellFields,
  InclusionBoneFields,
  InclusionCarbonFields,
  InclusionOtherFields,
  InclusionOverallFields
} from 'components/input/excavation/InclusionFields';
import { 
  handleInputChange,
} from 'helpers/buttonActions';

export const CommonContextFields = ({ currData, setCurrData }) => {
  console.log("Render CommonContextFields")
  const navigate = useNavigate();  
  const trenches = useStore(state => state.trenches);
  const phases = useStore(state => state.phases);  
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 6, sm: 4, md: 6, xl: 3 }}>
        <SingleSelect
          name="context_type"
          label="Type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.context_type}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 6, xl: 3 }}>
        <SingleSelect
          name="trench"
          label="Trench"
          currData={currData}
          setCurrData={setCurrData}
          options={trenches}
          optionLabel="identifier"
          optionValue="uuid"
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="Open"
                onClick={() => currData?.trench && navigate(`../Trench/${currData.trench}`)}
                edge="end"
              >
                <LaunchIcon />
              </IconButton>
            </InputAdornment>
          )}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 6, xl: 6 }}>
        <SingleSelect
          name="phase"
          label="Phase"
          currData={currData}
          setCurrData={setCurrData}
          options={phases}
          optionLabel="label" 
          optionValue="uuid" 
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 6, xl: 6 }}>
        <SingleSelect
          name="excavation_method"
          label="Method"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.excavation_method}
          optionLabel="label"
          optionValue="value"
          toolTip='Method and conditions: indicate the tool(s) used and whether the context was excavated after having been exposed to rain.'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 8, md: 8, xl: 6 }}>
        <DateRange
          name="excavation_period"
          startLabel="Opened"
          endLabel="Closed"
          currData={currData}
          setCurrData={setCurrData}
          toolTip='What date did excavation of the context start and fiwhen was it finished?'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CheckInput
          name="soilchem"
          label="Soil chemistry"
          currData={currData}
          setCurrData={setCurrData}
          toolTip='Soil chemistry: has soil chemistry been performed on this context?'
        /> 
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputTextMulti
          name="description"
          label="Description"
          value={currData?.description}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={5}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputTextMulti
          name="pot_interpretation"
          label="Pottery interpretation"
          value={currData?.pot_interpretation}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const SlopeDescriptionFields = ({ currData, setCurrData }) => {
  console.log("Render SlopeDescriptionFields")

  return (
    <DataSubEntry heading={"Slope Description"}>
      <Grid size={{ xs: 12 }}>
        { isMobile ?
          <InputTextMulti
            name="description_slope_open"
            label="Opening Slope"
            value={currData?.description_slope_open}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            rows={3}
            toolTip='Slope description on opening: note the degree and direction of the slope on opening.'
          />
          :
            <InputText
            name="description_slope_open"
            label="Opening Slope"
            value={currData?.description_slope_open}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            toolTip='Slope description on opening: note the degree and direction of the slope on opening.'
          />
        }
      </Grid>
      <Grid size={{ xs: 12 }}>
      { isMobile ?
          <InputTextMulti
            name="description_slope_close"
            label="Closing Slope"
            value={currData?.description_slope_close}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            rows={3}
            toolTip='Slope description on closing: note the degree and direction of the slope on closing.'
          />
          :
            <InputText
            name="description_slope_close"
            label="Closing Slope"
            value={currData?.description_slope_close}
            onBlur={(data) => handleInputChange(data, currData, setCurrData)}
            toolTip='Slope description on closing: note the degree and direction of the slope on closing.'
          />
        }
      </Grid>
    </DataSubEntry>
  );
};

export const SoilColourFields = ({ currData, setCurrData }) => {
  console.log("Render SoilColourFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Soil Colour"}>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="colour_modifier"
          label="Modifier"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.colour_modifier}
          optionLabel="label"
          optionValue="value"
          toolTip='Colour modifier: the strength of the colour hue.'
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="colour_hue"
          label="Hue"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.colour_hue}
          optionLabel="label"
          optionValue="value"
          toolTip='Colour hue: the minor colour hue.'
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="colour_main"
          label="Main Colour"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.colour_main}
          optionLabel="label"
          optionValue="value"
          toolTip='Colour: the main colour.'
        />
      </Grid>
      <Grid size={{ xs: 4 }} >
        <CheckInput
          name="colour_mixed"
          label="Colour mixed"
          currData={currData}
          setCurrData={setCurrData}
          toolTip='Is the context mixed in colour?'
        /> 
      </Grid>
    </DataSubEntry>
  );
};

export const CompositionCompactionFields = ({ currData, setCurrData }) => {
  console.log("Render CompositionCompactionFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Soil Composition and Compaction"}>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="soil_composition"
          label="Composition"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.soil_composition}
          optionLabel="label"
          optionValue="value"
          toolTip='Soil composition: use the guide in the manual to determine the soil composition.'
        />
      </Grid>
      <Grid size={{ xs: 4 }} >
        <CheckInput
          name="soil_mixed"
          label="Mixed Composition"
          currData={currData}
          setCurrData={setCurrData}
          toolTip='Is the context mixed in composition?'
        /> 
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="soil_compaction"
          label="Compaction"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.soil_compaction}
          optionLabel="label"
          optionValue="value"
          toolTip='Soil compaction: use the table in the manual to determine the soil compaction.'
        />
      </Grid>
    </DataSubEntry>
  );
};

const inclusionItems = [
  { value: "stone_building", label: "Building Stone", component: InclusionBuildingFields},
  { value: "stone_unworked", label: "Unworked Stone", component: InclusionUnworkedFields},
  { value: "plastermortar", label: "Plaster and Mortar", component: InclusionMortarFields},
  { value: "mudbrick", label: "Mudbrick", component: InclusionMudbrickFields},
  { value: "tile", label: "Tile", component: InclusionTileFields},
  { value: "ceramic", label: "Pottery/Ceramic", component: InclusionCeramicFields},
  { value: "obsidian", label: "Obsidian", component: InclusionObsidianFields},
  { value: "shell", label: "Shell", component: InclusionShellFields},
  { value: "bone", label: "Bone", component: InclusionBoneFields},
  { value: "carbon", label: "Carbon/Charcoal/Ash", component: InclusionCarbonFields},
  { value: "other", label: "Other", component: InclusionOtherFields}
];

export const SoilInclusionsFields = ({ currData, setCurrData }) => {
  console.log("Render SoilInclusionsFields")
  const terms = useStore(state => state.terms);
  const [currentInclusion, setCurrentInclusion] = useState('');

  if (!currData.inclusions) {
    // Initialize inclusions if not already
    currData.inclusions = {};
  }

  const handleAddInclusion = () => {
    if (currentInclusion && !currData.inclusions[currentInclusion]) {
      let updatedData = { 
        ...currData, 
        inclusions: {
            ...currData.inclusions,
            [currentInclusion]: {}
        }
      };
      setCurrData(updatedData);
      setCurrentInclusion('');
    }
  };

  const handleDeleteInclusion = (inclusion) => {
    const updatedInclusions = { ...currData.inclusions };
    delete updatedInclusions[inclusion];
    setCurrData({ ...currData, inclusions: updatedInclusions });
  };

  return (
    <DataSubEntry heading={"Inclusions"}>
      <Grid size={{ xs: 12 }}>
        {Object.entries(currData.inclusions).map(([inclusion, data]) => {
          const inclusionItem = inclusionItems.find(item => item.value === inclusion);
          if (!inclusionItem) return null;
          const InclusionComponent = inclusionItem.component;

          return InclusionComponent ? (
            <Paper elevation={1} key={inclusion} sx={{ mb: 1, p: 1, position: 'relative' }}>
              <InclusionComponent
                key={inclusion}
                name={inclusionItem.value}
                terms={terms}
                label={inclusionItem.label}
                currData={currData}
                setCurrData={setCurrData}
              />
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteInclusion(inclusion)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ) : null;
        })}
        <Paper elevation={1} sx={{ mb: 1, p: 1 }}>
          <InclusionOverallFields
            key="overall"
            name="overall"
            terms={terms}
            label="Overall inclusions"
            currData={currData}
            setCurrData={setCurrData}
          />
        </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8, xl: 6 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="new-inclusion-label">Select New Inclusion Type</InputLabel>
          <Select
            labelId="new-inclusion-label"
            value={currentInclusion}
            onChange={(e) => setCurrentInclusion(e.target.value)}
            displayEmpty
          >
            {inclusionItems
            .filter(item => !currData.inclusions[item.value])
            .map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 6 }}>
        <Button variant="contained" onClick={handleAddInclusion}>Add Inclusion</Button>
      </Grid>
    </DataSubEntry>
  );
};

export const PotInterpretationFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Pottery Interpretation"}>
      <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}>
        <TextEditor 
          id='pot_interpretation'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const TruncationFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Truncation"}>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="truncation"
          label="Truncation"
          value={currData?.truncation}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const MicromorphologyFields = ({ currData, setCurrData }) => {

  return (
    <DataSubEntry heading={"Micromorphology"}>
      <Grid container spacing={1} padding={1} size={{ xs: 12, xl: 12 }}>
        <TextEditor 
          id='micromorphology'
          currData={currData}
          setCurrData={setCurrData}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const ContextDescriptionFields = ({ currData, setCurrData }) => {
  console.log("Render ContextDescriptionFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Context Description"}>
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }}>
        <SingleSelect
          name="context_shape"
          label="Shape in plan"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.context_shape}
          optionLabel="label"
          optionValue="value"
          toolTip="Shape in plan: approximate description of the shape of the context from above."
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 6, xl: 6 }}>
        <SingleSelect
          name="context_boundaries"
          label="Context boundaries"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.context_boundaries}
          optionLabel="label"
          optionValue="value"
          toolTip="Boundaries: describe the change between the context you are recording and the context(s) revealed below it."
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="context_differentiation"
          label="Contextual differentiation"
          value={currData?.context_differentiation}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={5}
          toolTip="Contextual differentiation: What makes this context different from others? For example: ‘this context is blacker and more compact than context 7’ or ‘this context has more frequent and smaller pebble inclusions than 22’"
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="context_equal_reason"
          label="Equal contexts"
          value={currData?.context_equal_reason}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={5}
          toolTip="Equal contexts: where you have indicated an ‘is equal to’ (ie, same as) relationship, explain here with stratigraphic reasoning why the two contexts should be regarded as the same."
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="context_contamination"
          label="Context contamination"
          value={currData?.context_contamination}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={5}
          toolTip="Contamination: where there is a suspicion that stratigraphic bounds may have been exceeded, make a note here of the extent to which you fear the material and samples of this context may be contaminated by material from another context."
        />
      </Grid>
    </DataSubEntry>
  );
};

export const CutShapeFields = ({ currData, setCurrData }) => {
  console.log("Render CutShapeFields")
  const terms = useStore(state => state.terms);
  
  return (
    <DataSubEntry heading={"Cut Shape"}>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="context_shape"
          label="Shape in plan"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.context_shape}
          optionLabel="label"
          optionValue="value"
          toolTip="Shape in plan: approximate description of the shape of the context from above."
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="description_slope_top"
          label="Break of slope (top)"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.description_slope_top_base}
          optionLabel="label"
          optionValue="value"
          toolTip="Break of slope (top): describe the degree with which the top surface of the edge of the cut breaks into the sides."
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="description_slope_side"
          label="Side of slope"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.description_slope_side}
          optionLabel="label"
          optionValue="value"
          toolTip="Side of slope: describe the sides of the cut."
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="description_slope_base"
          label="Break of slope (base)"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.description_slope_top_base}
          optionLabel="label"
          optionValue="value"
          toolTip="Break of slope (base): describe the degree with which the sides break into the base of the cut."
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="description_cut_base"
          label="Cut at base"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.description_cut_base}
          optionLabel="label"
          optionValue="value"
          toolTip="Cut at base: describe the base of the cut."
        />
      </Grid>
    </DataSubEntry>
  );
};

export const SurfaceShapeFields = ({ currData, setCurrData }) => {
  console.log("Render SurfaceShapeFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Surface Shape"}>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="context_shape"
          label="Shape in plan"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.context_shape}
          optionLabel="label"
          optionValue="value"
          toolTip="Shape in plan: approximate description of the shape of the context from above."
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 6, md: 4, xl: 6 }}>
        <SingleSelect
          name="surface_flatness"
          label="Surface flatness"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.surface_flatness}
          optionLabel="label"
          optionValue="value"
          toolTip="Flatness: the flatness (or otherwise) of the surface."
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="surface_damage"
          label="Damage"
          value={currData?.surface_damage}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={5}
          toolTip="Damage: describe how the floor has been damaged (e.g. by falling masonry, wear)."
        />
      </Grid>
    </DataSubEntry>
  );
};

export const StructureTypeFields = ({ currData, setCurrData }) => {
  console.log("Render StructureTypeFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry>
      <Grid size={{ xs: 12 }}>
        <SingleSelect
          name="structure_type"
          label="Structure type"
          currData={currData}
          setCurrData={setCurrData}
          options={terms.structure_type}
          optionLabel="label"
          optionValue="value"
        />
      </Grid>
    </DataSubEntry>
  );
};

export const StructureDimensionsFields = ({ currData, setCurrData }) => {
  console.log("Render StructureDimensionsFields")
  return (
    <DataSubEntry heading={"Structure Dimensions"}>
      <Grid size={{ xs: 4 }}>
        <InputText
          name="structure_length"
          label="Length"
          value={currData?.structure_length}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
          }}
          toolTip='Maximum length of wall (metres).'
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <InputText
          name="structure_height"
          label="Height"
          value={currData?.structure_height}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
          }}
          toolTip='Maximum height of wall (metres).'
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <InputText
          name="structure_width"
          label="Width"
          value={currData?.structure_width}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          inputProps={{
            type: 'number',
          }}
          toolTip='Maximum width of wall (metres).'
        />
      </Grid>
    </DataSubEntry>
  );
};

export const StructureMaterialsFields = ({ currData, setCurrData }) => {
  console.log("Render StructureMaterialsFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Structure Materials"}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="materials_schistmarble"
          label="Schist/marble %"
          value={currData?.materials_schistmarble}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='percent'
          inputProps={{
              type: 'text',
              min: 0, 
              max: 100, 
              pattern: "^[0-9]*$",
          }}
          toolTip='Percent of schistose (imported) marble.'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="materials_aeolianite"
          label="Aeolianite %"
          value={currData?.materials_aeolianite}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='percent'
          inputProps={{
              type: 'text',
              min: 0, 
              max: 100, 
              pattern: "^[0-9]*$",
          }}
          toolTip='Percent of local aeolianite.'
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <InputText
          name="materials_localother"
          label="Local other %"
          value={currData?.materials_localother}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          validation='percent'
          inputProps={{
              type: 'text',
              min: 0, 
              max: 100, 
              pattern: "^[0-9]*$",
          }}
          toolTip='Percent of local other.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputText
          name="materials_working"
          label="Working"
          value={currData?.materials_working}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip='Working: indicate to what extent, if any, stones in the wall are worked.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InputText
          name="materials_stonesize"
          label="Stone sizes"
          value={currData?.materials_stonesize}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          toolTip='Stone sizes: approximate average stone size and variation in stone sizes.'
        />
      </Grid>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="materials_bonding"
          label="Bonding material"
          value={currData?.materials_bonding}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
        />
      </Grid>
    </DataSubEntry>
  );
};

export const StructureMasonryFields = ({ currData, setCurrData }) => {
  console.log("Render StructureMasonryFields")
  const terms = useStore(state => state.terms);

  return (
    <DataSubEntry heading={"Masonry Styles"}>
      <Grid size={{ xs: 12, sm: 12, md: 12, xl: 6 }} >
        <MultiSelect
        name="masonry_style_major"
        label="Major style"
        currData={currData}
        setCurrData={setCurrData}
        options={terms.masonry_style}
        optionLabel="label"
        optionValue="value"
        toolTip="Major masonry style: use the diagram in the manual to choose the correct description"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, xl: 6 }} >
        <MultiSelect
        name="masonry_style_minor"
        label="Minor style"
        currData={currData}
        setCurrData={setCurrData}
        options={terms.masonry_style}
        optionLabel="label"
        optionValue="value"
        toolTip="Secondary masonry style: record a secondary style if a) the style is different in different parts of the wall or b) none of the styles given is a close enough match and you see a mix of two styles"
        />
      </Grid>
    </DataSubEntry>
  );
};

export const StructureExposureFields = ({ currData, setCurrData }) => {
  console.log("Render StructureExposureFields")

  return (
    <DataSubEntry heading={"Extent of exposure"}>
      <Grid size={{ xs: 12 }} >
        <InputTextMulti
          name="exposure_extent"
          label="Extent of exposure"
          value={currData?.exposure_extent}
          onBlur={(data) => handleInputChange(data, currData, setCurrData)}
          rows={3}
          toolTip="Extent of exposure: list here which faces, ends and parts are exposed, eg ‘North face, top and west end’"
        />
      </Grid>
    </DataSubEntry>
  );
};