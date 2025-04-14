import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from 'services/store';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { NotesIcon } from 'components/LocalIcons';
import { PageContent, HalfPage, FullPage, RightStack, DataEntry, DataSubEntry } from 'components/layout/Sheets';
import PageHeader from 'components/layout/PageHeader';
import CrudButtons from 'components/buttons/NoteCrudButtons';
import { TextEditor, MarkdownViewer } from 'components/input/MarkDownEditor'
import { SingleSelect } from 'components/input/InputFields';
import { makeRequest } from 'services/query';

const NoteCard = ({ note, index, received, editTable }) => {
  const navigate = useNavigate();
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);

  const handleEdit = (uuid) => {
    console.log(`Load note  ${uuid} in editor.`);
    navigate(uuid);
  };

  const handleDelete = async (uuid) => {
    console.log('Delete note ', uuid);
    try {
      const deletedRow = await makeRequest('DELETE', `${editTable}?uuid=eq.${uuid}`,'{}', "Prefer: return=representation");
      console.log("Row deleted: ", deletedRow[0].uuid);
      setSnackbarData ({
        "actionType": "delete",
        "messageType": "success",
        "messageText": "Note " + (deletedRow[0]?.entry_id ? deletedRow[0].entry_id : deletedRow[0].uuid) + " deleted."
      });
      setSnackbarOpen(true)
    } catch (error) {
      console.log('Error deleting data: ', error);
      setSnackbarData ({
        "actionType": "delete",
        "messageType": "error",
        "messageText": "Delete failed: \n\n" + error.message + " \n " + error.response?.data.message
      });
    };
  };

  return (
    <Card variant="outlined" sx={{ marginBottom: 2, width: '100%', gridRowEnd: 'span 2' }}>
      <CardContent>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Note {index + 1}
        </Typography>
        <Typography variant="body2" color="textSecondary">{received ? `From ${note.sender}` : `Sent to ${note.sender}` }</Typography>
        <MarkdownViewer text={note.content} />
      </CardContent>
      <CardActions>
        <IconButton aria-label="edit" size="small" onClick={() => handleEdit(note.uuid)}>
          <Edit />
        </IconButton>
        <IconButton aria-label="delete" size="small" onClick={() => handleDelete(note.uuid)}>
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};


const RightHalf = ({ currData, activeActor, editTable }) => {

  const rightMenuItems = [
    { iconClass: 'fa fa-inbox fa-fw', scrollTarget: 'rec', title: 'Received Notes' },
    { iconClass: 'fa fa-paper-plane fa-fw', scrollTarget: 'sent', title: 'Sent Notes' },
  ];

  // Divide `currData` into two arrays
  const receivedNotes = currData?.filter(note => note.receiver_uuid === activeActor) || [];
  const sentNotes = currData?.filter(note => note.receiver_uuid !== activeActor) || [];

  return (
    <RightStack currData={currData} menuItems={rightMenuItems}> 
      <DataEntry id="rec">
        <Grid size={{ xs: 12 }}>
          <div sx={{ width: '100%' }}>
            <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
              Received Notes
            </Typography>
            <Grid container spacing={2}>
              {receivedNotes.map((note, index) => (
                <Grid size={{ xs: 12 }} key={index}> 
                  <NoteCard
                    index={index}
                    note={note}
                    received
                    editTable={editTable}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </Grid>
      </DataEntry>
      <DataEntry id="sent">
        <Grid size={{ xs: 12 }}>
          <div sx={{ width: '100%' }}>
            <Typography variant="h6" component="div" sx={{ textAlign: 'center', padding: 2 }}>
              Sent Notes
            </Typography>
            <Grid container spacing={2}>
              {sentNotes.map((note, index) => (
                <Grid size={{ xs: 12 }} key={index}> 
                  <NoteCard
                    index={index}
                    note={note}
                    editTable={editTable}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </Grid>
      </DataEntry>
    </RightStack>
  );
};

const LeftHalf = ({ currNoteId, currData, setCurrData, actors, navigate, activeActor, editTable }) => {
  const [currNote, setCurrNote] = useState({});

  useEffect(() => {
    const note = currData?.find(note => note.uuid === currNoteId);
    setCurrNote(note);
  }, [currData, currNoteId]);

  return (
    <>
      <div className="fill-most"> 
        <DataEntry id="info">
          <DataSubEntry heading={"New note"}>
            <Grid size={{ xs: 12, xl: 12 }}>
              <TextEditor 
              id='content'
              currData={currNote}
              setCurrData={setCurrNote}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, xl: 12 }}>
              <SingleSelect
                name="receiver_uuid"
                label="Receiver"
                currData={currNote}
                setCurrData={setCurrNote}
                options={actors}
                optionLabel="name"
                optionValue="uuid"
              />
            </Grid>
          </DataSubEntry>
        </DataEntry>
      </div>
      <CrudButtons
        currNoteId={currNoteId}
        currData={currNote}
        navigate={navigate}
        activeActor={activeActor}
        editTable={editTable}
      />
    </>
  );
};

const Notes = () => {
  console.log("Render Notes");
  let { id } = useParams();
  const activeActor = useStore(state => state.activeActor);
  const [currData, setCurrData] = useState(null);
  const [currNoteId, setCurrNoteId] = useState(null);
  const navigate = useNavigate();
  const actors = useStore(state => state.actors);

  const editTable = 'edit_notes';
  const apiTable = 'view_notes';

  useEffect(() => {
    if (activeActor) {
      console.log(activeActor);
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?or=(receiver_uuid.eq.${activeActor.uuid},sender_uuid.eq.${activeActor.uuid})`, {}, {});
          setCurrData(getData);
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [activeActor]);

  useEffect(() => {
    setCurrNoteId(id);
  }, [id]);

  if(!activeActor){
    return (
      <>
        <PageHeader
          IconComponent={NotesIcon}
          title="Notes"
        />
        <PageContent>
          <FullPage>
            <Typography variant="subtitle1" >
                User not recognised.
            </Typography> 
          </FullPage>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader
        IconComponent={NotesIcon}
        title="Notes"
      />
      <PageContent>
        <HalfPage>
          <LeftHalf 
            currNoteId={currNoteId} 
            currData={currData} 
            setCurrData={setCurrData} 
            actors={actors} 
            navigate={navigate} 
            activeActor={activeActor.uuid} 
            editTable={editTable} 
          />
        </HalfPage>
        <HalfPage>
          <RightHalf currData={currData} activeActor={activeActor.uuid} editTable={editTable} />
        </HalfPage>
      </PageContent>
    </>
  );
};

export default Notes;
