import React, { useState, useEffect } from 'react';
import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-isbn";
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { formatISO } from 'date-fns';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from 'services/store';
import { MediaInventoryFields, MetadataFields, ResourceFields } from 'components/input/MediaFields';
import { LookupInput, JsonInput } from 'components/input/BibliographyFields';
import { makeRequest } from 'services/query';



const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '77%',
  transform: 'translate(-50%, -50%)',
  width: '45%',
  height: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  padding: 4,
  overflow: 'auto', 
};

// Define the component
const NewMediaModalComponent = ({ type, open, setOpen, editData, setUpdate }) => {
  console.log("Render Media Upload")
  const [newData, setNewData] = useState([]);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const activeActor = useStore(state => state.activeActor);
  const uuid = useStore(state => state.currUuid);
  const entryId = useStore(state => state.currEntryId);

  useEffect(() => {
    if (editData) {
      setNewData(editData);
    }
  }, [editData]);

  //console.log(`Curr ID's: ${uuid} and ${entryId}`)
  const saveMedia = async () => {
    console.log('Saving Media');
    try {
      if (editData) {
        const updateData = {...newData, updated_at: formatISO(new Date()), updated_by: activeActor?.uuid || null};
        const updatedRow = await makeRequest(
                                  'PATCH', 
                                  `edit_media?uuid=eq.${newData.uuid}`,
                                  updateData, 
                                  "Prefer: return=representation"
                                );
        console.log('Resource updated: ', updatedRow);
        setSnackbarData ({
          "actionType": "save",
          "messageType": "success",
          "messageText": `Resource ${updatedRow[0].uuid} (${type}) updated.`,
        });
      } else {
        const updateData = {
          ...newData, 
          parent_type: entryId?.charAt(0) || null, 
          parent: uuid || null, 
          updated_at: formatISO(new Date()), 
          updated_by: activeActor?.uuid || null
        };
        const updatedRow = await makeRequest(
                                  'POST', 
                                  `edit_media`,
                                  updateData, 
                                  "Prefer: return=representation"
                                );
        console.log('New resource added updated: ', updatedRow);
        setSnackbarData ({
          "actionType": "save",
          "messageType": "success",
          "messageText": "New media saved."
        });
      }
      setUpdate(true);
    } catch (error) {
      console.log('Error saving data: ', error);
      setSnackbarData ({
        "actionType": "save",
        "messageType": "error",
        "messageText": "Save failed: \n\n" + error.message + " \n " + error.response?.data.message
      });
    }
    setSnackbarOpen(true)
    setNewData([]);
    setOpen(false);
  };

  const cancelUpload = () => {
    setNewData([]);
    setOpen(false);
  };  

  return (
      <Modal
        open={open}
        onClose={() => { setOpen(false); }}
        aria-labelledby="new-media-modal"
        aria-describedby="new-media-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="new-media-modal" variant="h6" component="h2">
            {editData ? 'Edit ' : 'Add New '} {type ? type : 'Media'}
          </Typography>
          <Typography id="new-media-modal-description" sx={{ mt: 2 }}>
            Upload a file or add a link to an online resource.
          </Typography>
          <Grid container spacing={2} >
            <MediaInventoryFields currData={newData} setCurrData={setNewData} type={type} />
            <MetadataFields currData={newData} setCurrData={setNewData} />
            <ResourceFields currData={newData} setCurrData={setNewData} type={type}/>
            <Grid size={{ xs: 6 }}>
              <Card >
                <CardActionArea>
                  <CardContent onClick={() => { saveMedia() }}>
                    <SaveIcon />
                    <Typography gutterBottom variant="subtitle1" component="p">
                      Upload and Save
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card >
                <CardActionArea>
                  <CardContent onClick={() => { cancelUpload() }}>
                    <CloseIcon />
                    <Typography gutterBottom variant="subtitle1" component="p">
                      Cancel
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Modal>
  );
};

// Create a memoized version
const NewMediaModal = React.memo(NewMediaModalComponent);

// Define the component 
const NewBibliographyModalComponent = ({ newData, setNewData, saveData, open, setOpen, edit }) => {
  console.log("Render Bibliography modal");
  const [expanded, setExpanded] = useState(false);
  const [formattedHtml, setFormattedHtml] = useState(""); // State for formatted HTML

  useEffect(() => {
    setExpanded(edit);
  }, [edit]);

  const handleExpandClick = () => {
    setExpanded(!expanded); // Toggle expanded state
  };

  useEffect(() => {
    if (newData) {
      try {
        console.log("Formatting new bibliography: ", newData);
        const html = newData.format("bibliography", { format: "html", template: "apa" });
        console.log("Formatted HTML: ", html);
        setFormattedHtml(html); // Update the state with the formatted HTML
      } catch (error) {
        console.error("Error formatting bibliography: ", error);
        setFormattedHtml("<p>Error formatting bibliography</p>");
      }
    }
  }, [newData]); // Trigger when newData changes

  async function fetchBiblio(source) {
    try {
      console.log("source");
      console.log(source);
      const cslJson = newData.format('bibliography');
      console.log(cslJson);
      const fetchedData = await Cite.async(source); // Fetch data
      setNewData(fetchedData); // Update state after successful async lookup
    } catch (error) {
      console.log('Error fetching citation:', error);
      const customCslJson = [{
        "id": uuidv4(),
        "type": "book",
        "title": source   
      }];
      const fetchedCustomData = await Cite.async(customCslJson); // Fetch custom data
      setNewData(fetchedCustomData); // Update state after successful async lookup
    }
  }

  const cancelUpload = () => {
    setNewData(new Cite());
    setOpen(false);
  };

  const biblioFormats = [
    {'value': 'doi', 'label': 'DOI'},
    {'value': 'isbn', 'label': 'ISBN'},
    {'value': 'pubmed', 'label': 'PubMed'},
    {'value': 'wikidata', 'label': 'Wikidata QID'},
    {'value': 'cslJson', 'label': 'CSL-JSON'},
    {'value': 'bibJson', 'label': 'BibJSON'},
    {'value': 'bibTex', 'label': 'BibTeX/BibLaTeX'},
    {'value': 'ris', 'label': 'RIS'},
    {'value': 'cffZenodo', 'label': 'Citation File Format/Zenodo Deposit JSON'},
    {'value': 'other', 'label': 'Other/Manual'}
  ];

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      aria-labelledby="new-biblio-modal"
      aria-describedby="new-biblio-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="new-biblio-modal" variant="h6" component="h2">
          {edit ? "Edit" : "Add New"} Bibliographic Item
        </Typography>
        <Grid container spacing={2} padding={1}>
          <Grid size={{ xs: 12 }}>
            <LookupInput newData={newData} fetchBiblio={fetchBiblio} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography gutterBottom variant="subtitle1" component="p">
              Editable preview (CSL-JSON)
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                size="small"
                aria-label="show more"
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Typography>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <JsonInput newData={newData} fetchBiblio={fetchBiblio} />
            </Collapse>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography gutterBottom variant="subtitle1" component="p">
              Preview (APA)
            </Typography>
            {/* Render the formatted HTML */}
            <div dangerouslySetInnerHTML={{ __html: formattedHtml }}></div>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Card>
              <CardActionArea>
                <CardContent onClick={() => saveData()}>
                  <SaveIcon />
                  <Typography gutterBottom variant="subtitle1" component="p">
                    Save
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Card>
              <CardActionArea>
                <CardContent onClick={() => cancelUpload()}>
                  <CloseIcon />
                  <Typography gutterBottom variant="subtitle1" component="p">
                    Cancel
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

// Create a memoized version
const NewBibliographyModal = React.memo(NewBibliographyModalComponent);

export { NewMediaModal, NewBibliographyModal };