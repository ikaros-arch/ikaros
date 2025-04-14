import React, { useEffect, useState, lazy, useRef } from 'react';
import Cite from "citation-js";
import { formatISO } from 'date-fns';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography'; 
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { ScrollSheet } from 'components/layout/Sheets';

const NewBibliographyModal = lazy(() => import('components/Modals').then(module => ({ default: module.NewBibliographyModal })));

export const Bibliography = ({ currBiblio, currUUID, parent }) => {
  console.log("Render Bibliography");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [bibliography, setBibliography] = useState(new Cite());
  const [newData, setNewData] = useState(new Cite());
  const [formattedHtml, setFormattedHtml] = useState(null);
  const [citations, setCitations] = useState([]); // State for unique citations
  const setSnackbarOpen = useStore((state) => state.setSnackbarOpen);
  const setSnackbarData = useStore((state) => state.setSnackbarData);
  const activeActor = useStore((state) => state.activeActor);
  const formattedBiblio = useRef(null);

  useEffect(() => {
    if (currBiblio) {
      setBibliography(new Cite(currBiblio || null));
    }
  }, [currBiblio]);

  useEffect(() => {
    if (bibliography) {
      const newFormattedHtml = bibliography.format("bibliography", {
        format: "html",
        template: "apa",
      });
      setFormattedHtml(newFormattedHtml);
    }
  }, [bibliography]);

  useEffect(() => {
    if (formattedHtml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(formattedHtml, "text/html");

      const entries = doc.querySelectorAll(".csl-entry");
      const formattedCitations = [];
      for (const entry of entries) {
        const entryId = entry.dataset.cslEntryId; // Extract entry ID
        const citationText = entry.textContent.trim(); // Extract citation text
        formattedCitations.push({ id: entryId, text: citationText });
      }
      setCitations(formattedCitations);
    }
  }, [formattedHtml]);

  const handleEdit = (id) => {
    console.log("edit", id);

    // Find the citation with the specified id
    const citationToEdit = bibliography.data.find((entry) => entry.id === id);

    if (citationToEdit) {
      // Set the found citation as newData
      setEdit(true);
      setNewData(new Cite(citationToEdit));
      setOpen(true); // Open the modal after setting newData
      console.log("Citation to edit:", citationToEdit);
    } else {
      console.error(`Citation with id ${id} not found.`);
    }
  };

  const handleDelete = (id) => {
    console.log("delete", id);

    // Filter out the entry with the specified id
    const filteredData = bibliography.data.filter((entry) => entry.id !== id);

    // Create a new Cite object with the filtered data
    const tempBiblio = new Cite(filteredData);

    // Update the bibliography state
    setBibliography(tempBiblio);

    // Save the updated bibliography
    saveData(tempBiblio);
  };

  const saveData = async (updatedBibliography = bibliography) => {
    console.log("Saving Bibliography");
    try {
      const combinedBiblio = updatedBibliography.add(newData.format("data"));
      console.log(combinedBiblio);
      const updateData = {
        bibliography: combinedBiblio.format("data"),
        updated_at: formatISO(new Date()),
        updated_by: activeActor?.uuid || null,
      };
      const updatedRow = await makeRequest(
        "PATCH",
        `edit_bibliography?uuid=eq.${currUUID}`,
        updateData,
        "Prefer: return=representation"
      );
      console.log("Bibliography updated: ", updatedRow);
      setSnackbarData({
        actionType: "save",
        messageType: "success",
        messageText: "Bibliography saved.",
      });
      setBibliography(new Cite(combinedBiblio.data));
    } catch (error) {
      console.log("Error saving data: ", error);
      setSnackbarData({
        actionType: "save",
        messageType: "error",
        messageText:
          "Save failed: \n\n" + error.message + " \n " + error.response?.data.message,
      });
    }
    setSnackbarOpen(true);
    setNewData(new Cite());
    setOpen(false);
  };

  if (!currBiblio) {
    return (
      <ScrollSheet id="biblio">
       <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
              No bibliography found.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card >
              <CardActionArea>
                <CardContent onClick={() => { setOpen(true); }}>
                  <AddIcon />
                  <Typography gutterBottom variant="subtitle1" component="p">
                    Add New Bibliographic Reference
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        <NewBibliographyModal
          open={open}
          setOpen={setOpen}
          newData={newData}
          setNewData={setNewData}
          saveData={saveData}
        />
      </ScrollSheet>
    );
  }

  return (
    <ScrollSheet id="biblio">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" component="p" sx={{ padding: 1 }}>
            Bibliography
          </Typography>
          <Grid container spacing={2} ref={formattedBiblio}>
            {citations.map((citation) => (
              <Grid size={{ xs: 12 }} key={citation.id}>
                <Paper sx={{ padding: "16px" }}>
                  {citation.text}
                  <IconButton
                    aria-label="edit"
                    size="small"
                    onClick={() => handleEdit(citation.id)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => handleDelete(citation.id)}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardActionArea>
              <CardContent onClick={() => setOpen(true)}>
                <AddIcon />
                <Typography gutterBottom variant="subtitle1" component="p">
                  Add New Bibliographic Reference
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      <NewBibliographyModal
        open={open}
        setOpen={setOpen}
        newData={newData}
        setNewData={setNewData}
        saveData={saveData}
        edit={edit}
      />
    </ScrollSheet>
  );
};
