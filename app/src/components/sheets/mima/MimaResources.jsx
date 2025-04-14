import React, { useEffect, useState, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography'; 
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { LinearLoading } from '@/components/layout/Loading';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { ScrollSheet } from 'components/layout/Sheets';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';


const NewMediaModal = lazy(() => import('components/Modals').then(module => ({ default: module.NewMediaModal })));

const ResourceCard = ({ item, index, navigate, type, single, setEditData, setUpdate }) => {
  const domain = useStore(state => state.env.domainName);
  const [expanded, setExpanded] = useState(single);
  const setSnackbarOpen = useStore(state => state.setSnackbarOpen);
  const setSnackbarData = useStore(state => state.setSnackbarData);
  const [openDialog, setOpenDialog] = useState(false);
  const [url, setUrl] = useState(null);

    useEffect(() => {
      if (item) {
        if (item.link) {
          setUrl(`https://${domain}/resources/redirect?url=${encodeURIComponent(item.url)}`);
        } else {
          setUrl(`https://${domain}/resources/${encodeURIComponent(item.url)}`);
        }
      }
    }, [item]);

    useEffect(() => {
      console.log("Updated URL:", url); // Debugging log
    }, [url]);

  const handleEdit = () => {
    console.log('edit');
    setEditData(item);
  };

  const handleDelete = async () => {
    console.log('delete');
    try {
      const deletedRow = await makeRequest('DELETE', `edit_media?uuid=eq.${item.uuid}`,'{}', "Prefer: return=representation");
      console.log("Row deleted: ", deletedRow[0].uuid)
      setSnackbarData ({
        "actionType": "delete",
        "messageType": "success",
        "messageText": `Resource ${deletedRow[0].uuid} (${type}) deleted.`
      });
      setSnackbarOpen(true);
      setUpdate(true);
      setOpenDialog(false);
    } catch (error) {
      console.log('Error deleting data: ', error);
      setSnackbarData ({
        "actionType": "delete",
        "messageType": "error",
        "messageText": `Delete failed: \n\n${error.message} \n ${error.response?.data.message}`
      });
    };
  };

  const handleExpandClick = () => {
    setExpanded(!expanded); // Toggle expanded state
  };

  return (
    <Grid size={{ xs: 12, sm: expanded ? 12 : 6, md: expanded ? 12 : 4 }}>
      <Card 
        variant="outlined"
        sx={{ 
          marginBottom: 2, 
          width: '100%', 
          gridRowEnd: expanded ? 'span 2' : undefined, 
        }}
      >
        <CardContent>
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            <Link href={item.link ? item.url : url} target="_blank" rel="noopener noreferrer">
              {item.filename ? item.filename : item.url ? item.url : item.uuid}
            </Link>
          </Typography>
        </CardContent>
        {type === 'images'  && (
          <CardMedia
            component="img"
            image={url}
            alt="Image preview"
            sx={{ objectFit: 'cover' }}
          />
        )}
        {type === 'documents' && (
          <iframe
            src={url}
            width="100%"
            height={expanded ? "500" : "auto"}
            frameBorder="0"
            title={`PDF Preview - ${index}`}
          ></iframe>
        )}
        {type === 'links' && (
          <iframe
            src={item.url}
            width="100%"
            height={expanded ? "500" : "auto"}
            frameBorder="0"
            title={`Web Preview - ${index}`}
          ></iframe>
        )}
        {type === 'links' && false && (
          <iframe
            src={url}
            width="100%"
            height={expanded ? "500" : "auto"}
            frameBorder="0"
            title={`Web Preview - ${index}`}
          ></iframe>
        )}
        {type === '3d' && (
          <iframe
            src={item.filename 
              ? `https://${domain}/resources/3dviewer?model=${encodeURIComponent(item.filename)}`
              : item.url 
                ? item.url
                : `https://${domain}/resources/3dviewer?model=${encodeURIComponent(item.uuid)}`}
            width="100%"
            height={expanded ? "500" : "auto"}
            frameBorder="0"
            title={`3dhop - ${index}`}
          ></iframe>
        )}
        <CardActions>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            size="small" 
            aria-label="show more"
          >
            {expanded ? <ExpandLess /> : <ExpandMore /> }
          </IconButton>
          <IconButton aria-label="edit" size="small" onClick={() => handleEdit()}>
            <Edit />
          </IconButton>
          <IconButton aria-label="delete" size="small" onClick={() => setOpenDialog(true)}>
            <Delete />
          </IconButton>
          <IconButton
            aria-label="Open" size="small" onClick={() => navigate(`/Media/${item.uuid}`)}>
            <LaunchIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {item.description &&
            <Typography variant="body1" sx={{ padding: 1 }}>
                <Typography component="span" fontStyle="italic">Description:</Typography> {item.description}
            </Typography>
          }
          {item.copyright &&
            <Typography variant="body1" sx={{ padding: 1 }}>
                <Typography component="span" fontStyle="italic">Copyright:</Typography> {item.copyright}
            </Typography>
          }

          {/* Potentially other content types could be handled here */}
        </Collapse>
      </Card>
      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={() => handleDelete()}
        title={`Delete ${type}`}
        description={`This will delete the ${type} resource ${item.filename ? item.filename : item.uuid}. Are you sure?`}
        confirmButtonText={`Delete`}
        confirmButtonColor={`error`}
      />
    </Grid>
  );
};

const MediaResource = ({ type, typeUuids, title, modalType }) => {
  const uuid = useStore((state) => state.currUuid);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [update, setUpdate] = useState(true);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMedia = async () => {
    if (!uuid) return;

    setLoading(true);
    try {
      const data = await makeRequest(
        'get',
        `edit_media?parent=eq.${uuid}&media_type=eq(any).${typeUuids}`,
        {},
        {}
      );
      setMedia(data);
      console.log(`Fetched ${type} media:`, data);
    } catch (error) {
      console.error(`Error fetching ${type} media:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger fetchMedia whenever uuid changes
    fetchMedia();
  }, [uuid]);

  useEffect(() => {
    // Trigger fetchMedia when update is true
    if (update) {
      fetchMedia();
      setUpdate(false); // Reset update to false after fetching
    }
  }, [update]);

  useEffect(() => {
    if (editData) {
      setOpen(true);
    }
  }, [editData]);

  useEffect(() => {
    if (!open) {
      setEditData(null);
    }
  }, [open]);

  if (!uuid) {
    return (
      <ScrollSheet id={type}>
        <LinearLoading />
      </ScrollSheet>
    );
  }

  return (
    <ScrollSheet id={type} scrollable>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" component="p" sx={{ padding: 1 }}>
            {title}
          </Typography>
          <Grid container spacing={2}>
            {media?.map((item, index) => (
              <ResourceCard
                item={item}
                navigate={navigate}
                index={index}
                key={index}
                type={type}
                single={media.length === 1}
                setEditData={setEditData}
                setUpdate={setUpdate}
              />
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardActionArea>
              <CardContent
                onClick={() => {
                  setOpen(true);
                }}
              >
                <AddIcon />
                <Typography gutterBottom variant="subtitle1" component="p">
                  Add New {title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      {open && (
        <NewMediaModal
          open={open}
          setOpen={setOpen}
          type={modalType}
          editData={editData}
          setUpdate={setUpdate}
        />
      )}
    </ScrollSheet>
  );
};

export const Images = () => {
  return (
    <MediaResource
      type="images"
      typeUuids="{f43e4fd9-10b7-4432-b947-19273be90815,2ed3c20f-e7b6-4046-8fd1-9292c1604b0b,dc3384a9-ec82-4c31-92dd-9070ab462886,abd54336-5559-43d1-9a09-3c51c4d01c77}"
      title="Images"
      modalType="Image"
    />
  );
};

export const Documents = () => {
  return (
    <MediaResource
      type="documents"
      typeUuids="{54bf7600-e772-4775-b729-79f92821e74a,55ce48b3-18eb-4d98-a11a-8c8c7468a905}"
      title="Documents"
      modalType="Document"
    />
  );
};

export const Links = () => {
  return (
    <MediaResource
      type="links"
      typeUuids="{08c7962d-283f-4ff7-91fe-23e28c08d344}"
      title="Web Resources"
      modalType="Website"
    />
  );
};

export const Threed = () => {
  return (
    <MediaResource
      type="3d"
      typeUuids="{06483fe6-591c-4c49-81fd-c820fa280689}"
      title="3D Models"
      modalType="3D Model"
    />
  );
};