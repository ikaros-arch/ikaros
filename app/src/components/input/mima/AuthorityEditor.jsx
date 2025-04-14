import React, { useState, useEffect, useCallback  } from 'react';
import _, {debounce} from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CircularProgress from '@mui/material/CircularProgress';
import { useStore } from 'services/store';
import { 
  handleArrayChange,
} from 'helpers/buttonActions';

const matchOptions = [
  {value:'skos:narrowMatch',label: 'Is narrower match'}, 
  {value:'skos:broadMatch',label: 'Is broader match'}, 
  {value:'skos:relatedMatch',label: 'Is related'}, 
  {value:'skos:exactMatch',label: 'Is exact match '}, 
  {value:'skos:closeMatch',label: 'Is close match'}
];


const handleDeleteAuthority = (type, authorities, setAuthorities) => {
  const newAuthorities = { ...authorities };
  delete newAuthorities[type]; // Remove the authority by type
  setAuthorities(newAuthorities);
};

const isUriValid = async (uri) => {
  try {
    const response = await fetch(uri, { method: 'HEAD' });
    return response.ok; // Returns true if the status code is 2xx
  } catch (error) {
    console.error('Error checking URI validity:', error);
    return false;
  }
};

  const handleAddAuthority = async (authoritiesConfig, identifier, setIdentifier, setAuthorities, authorityType, setAuthorityType, mappingRelation) => {
    const config = authoritiesConfig[authorityType];
    if (!config || !identifier) {
      console.log(authoritiesConfig)
      console.log(authorityType)

      // Handle error: either authority type or identifier is missing/invalid
      console.error("Invalid authority type or missing identifier.");
      return;
    }

    // Construct the full URI using the prefix and identifier number
    const identifierURI = `${config.uriPrefix}${identifier}`;

    // Determine the correct endpoint
    const endpoint = config.endpoint(identifier);

    try {
      // Fetch the JSON from the endpoint using async/await
      const response = await fetch(endpoint);
      if (!response.ok) {
        // Handle HTTP errors
        console.error("Failed to fetch data:", response.status, response.statusText);
        return;
      }
      const json = await response.json();

      // Use the mapper function to extract relevant fields from the JSON response
      const data = config.mapper(json);
      console.log('Mapped data: ', data)

      // Set the new authority data using the extracted fields
      setAuthorities(prevAuthorities => ({
        ...prevAuthorities,
        [authorityType]: {
          'id': identifier,
          'dc:identifier': identifierURI,
          'mappingRelation': mappingRelation,
          ...data
        }
      }));

      // Reset the fields after adding
      setAuthorityType('');
      setIdentifier('');
    } catch (error) {
      // Handle fetch error
      console.error("Error fetching data:", error);
    }
  };

export const TermAuthorityEditor = ({ currData, setCurrData }) => {
  const authorityOptions = ['Getty AAT','Trismegistos', 'iDAI Thesauri', 'Other'];
  const domain = useStore(state => state.env.domainName);
  const geonamesApiKey = useStore(state => state.env.geonamesApiKey);
  const [authorities, setAuthorities] = useState(currData.authorities || {});
  const [authorityType, setAuthorityType] = useState('');
  const [mappingRelation, setMappingRelation] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [validityState, setValidityState] = useState({});

  useEffect(() => {
    setAuthorities(currData.authorities || {})
  }, [currData.uuid]);

  useEffect(() => {
    // Check the validity of all URIs
    const checkAllUris = async () => {
      const newState = {};

      for (const [type, authority] of Object.entries(authorities)) {
        const uri = `https://${domain}/resources/redirect?url=${authority['dc:identifier']}`;
        try {
          newState[type] = 'loading';
          const isValid = await isUriValid(uri);
          newState[type] = isValid ? 'valid' : 'invalid';
        } catch (error) {
          console.error('Error checking URI validity:', error);
          newState[type] = 'invalid';
        }
      }

      setValidityState(newState);
    };

    checkAllUris();
  }, [authorities]);

  const authoritiesConfig = {
    'Getty AAT': {
      uriPrefix: 'http://vocab.getty.edu/page/aat/',
      endpoint: (identifier) => `https://vocab.getty.edu/aat/${identifier}.json`,
      mapper: (json) => {
        return {
          'dc:title': json._label, // Example field
          'types': json.type,
          'narrowerTerms': json.narrower
        };
      }
    },
    Trismegistos: {
      uriPrefix: 'https://www.trismegistos.org/material/',
      endpoint: (identifier) => `https://www.trismegistos.org/material/${identifier}`,
      mapper: (json) => {
        // Extract and return relevant fields from the Trismegistos JSON response
        return {
          'dc:title': 'NA',
          'types': 'Material',          
        };
      }
    },
    'iDAI Thesauri': {
      uriPrefix: 'http://thesauri.dainst.org/',
      endpoint: (identifier) => `http://thesauri.dainst.org${identifier}/rdf`,
      mapper: (json) => {
        return {
          'dc:title': 'NA',
          'types': 'Concept',
        };
      }
    }
  };

  useEffect(() => {
    handleArrayChange(authorities, 'authority', currData, setCurrData)
  }, [authorities]);


  return (
    <Paper>
      <Grid container spacing={1} padding={1} >
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Select
              value={authorityType}
              onChange={(e) => setAuthorityType(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="" disabled>
                Select Authority Type
              </MenuItem>
              {authorityOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }} >
          <TextField
            fullWidth
            label="Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}> 
          { authorityType === 'Pleiades'
            ? <PleiadesSearch setIdentifier={setIdentifier} />
            : authorityType === 'GeoNames'
              ? <GeonamesSearch setIdentifier={setIdentifier} /> 
              : authorityType === 'Epigraphic Database Heidelberg'
                ? <HeidelbergSearch setIdentifier={setIdentifier} />              
                : authorityType
                  ?         
                    <Typography variant="subtitle1" >
                      No api found for {authorityType}.
                    </Typography>
                  : ''
        }      
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <FormControl fullWidth>
            <Select
              value={mappingRelation}
              onChange={(e) => setMappingRelation(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="" disabled>
                Select Match Type
              </MenuItem>
              {matchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }} padding={1}>
          <Button variant="contained" disabled={!authorityType || !identifier} onClick={() => handleAddAuthority(authoritiesConfig, identifier, setIdentifier, setAuthorities, authorityType, setAuthorityType, mappingRelation)}>
            Add Authority
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }}>      
          <List>
            {Object.entries(authorities).map(([type, authorityData]) => {
              const { 'dc:identifier': url, id, title } = authorityData; // Destructure the necessary data

              return (
                <>
                <ListItem key={type} secondaryAction={
                  <>
                    <IconButton
                      aria-label="Open in new tab"
                      onClick={() => window.open(url, '_blank')}
                      edge="end"
                    >
                      <LaunchIcon />
                    </IconButton>                  
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAuthority(type, authorities, setAuthorities)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }>
                { /*  
                  {validityState[type] === 'loading' && <CircularProgress size={20} />}
                  {validityState[type] === 'valid' && <CheckCircleIcon color="success" />}
                  {validityState[type] === 'invalid' && <ErrorIcon color="error" />}   
                */}              
                  <Typography variant="subtitle1" >{type}

                  </Typography>
                  {id && 
                    <Typography variant="body2" >: {id} ({title})</Typography>
                  }     
                </ListItem>
                <Divider variant="middle" component="li" />
                </>
              );
            })}
          </List>
        </Grid>

    </Grid>      
  </Paper>  
  );
};

export const PlaceAuthorityEditor = ({ currData, setCurrData }) => {
  const authorityOptions = ['GeoNames', 'Pleiades', 'Trismegistos', 'iDAI Gazetteer', 'Epigraphic Database Heidelberg', 'Other'];
  const domain = useStore(state => state.env.domainName);
  const [authorities, setAuthorities] = useState(currData.authorities || {});
  const [authorityType, setAuthorityType] = useState('');
  const [mappingRelation, setMappingRelation] = useState('');  
  const [identifier, setIdentifier] = useState('');
  const [validityState, setValidityState] = useState({});

  useEffect(() => {
    setAuthorities(currData.authorities || {})
  }, [currData.uuid]);

  useEffect(() => {
    // Check the validity of all URIs
    const checkAllUris = async () => {
      const newState = {};

      for (const [type, authority] of Object.entries(authorities)) {
        const uri = `https://${domain}/resources/redirect?url=${authority['dc:identifier']}`;
        try {
          newState[type] = 'loading';
          const isValid = await isUriValid(uri);
          newState[type] = isValid ? 'valid' : 'invalid';
        } catch (error) {
          console.error('Error checking URI validity:', error);
          newState[type] = 'invalid';
        }
      }

      setValidityState(newState);
    };

    checkAllUris();
  }, [authorities]);

  const authoritiesConfig = {
    GeoNames: {
      uriPrefix: 'http://sws.geonames.org/',
      endpoint: (identifier) => `https://secure.geonames.org/getJSON?geonameId=${identifier}&username=${geonamesApiKey}&style=short`,
      mapper: (json) => {
        // Extract and return relevant fields from the GeoNames JSON response
        return {
          'dc:title': json.toponymName,
          "geometry": {
            "type": "Point",
            "coordinates": [
              Number(json.lng), 
              Number(json.lat)
            ]
          },
        };
      }
    },
    Pleiades: {
      uriPrefix: 'https://pleiades.stoa.org/places/',
      endpoint: (identifier) => `https://pleiades.stoa.org/places/${identifier}/json`,
      mapper: (json) => {
        // Extract and return relevant fields from the Pleiades JSON response
        return {
          'dc:title': json.title,
          'placeTypes': json.placeTypes,          
          'dc:description': json.description,
          "geometry": {
            "type": "Point",
            "coordinates": json.reprPoint
          },          
        };
      }
    },
    Trismegistos: {
      uriPrefix: 'http://www.trismegistos.org/place/',
      endpoint: (identifier) => `https://www.trismegistos.org/dataservices/georesponder/georesponder.php?id=${identifier}`,
      mapper: (json) => {
        // Extract and return relevant fields from the Trismegistos JSON response
        return {
          'dc:title': json.title,
          'placeTypes': [json.Type],
          'geometry': json.geometry

        };
      }
    },
    'iDAI Gazetteer': {
      uriPrefix: 'https://gazetteer.dainst.org/place/',
      endpoint: (identifier) => `https://gazetteer.dainst.org/doc/${identifier}.json`,
      mapper: (json) => {
        return {
          'dc:title': json.prefName.title,
          'placeTypes': json.types,          
          'dc:description': json.description,
          "geometry": {
            "type": "Point",
            "coordinates": json.coordinates ? json.coordinates : json.prefLocation ? json.prefLocation.coordinates : [0, 0]
          },          
        };
      }
    },    
    'Epigraphic Database Heidelberg': {
      uriPrefix: 'https://edh.ub.uni-heidelberg.de/edh/geographie/',
      endpoint: (identifier) => `https://edh.ub.uni-heidelberg.de/edh/geographie/${identifier}/json`,
      mapper: (json) => {
        let coords = [];
        if (json.items.coordinates) {
          const [lat, lng] = json.items.coordinates.split(',').map(Number); // Converts each part to a number
          coords = [lng, lat]; // Switches the order to [longitude, latitude]
        } else if (json.items.coordinates_1) {
          const [lat, lng] = json.items.coordinates_1.split(',').map(Number); // Converts each part to a number
          coords = [lng, lat]; // Switches the order to [longitude, latitude]
        }
        // Extract and return relevant fields from the Trismegistos JSON response
        return {
          'dc:title': json.items.findspot,
          'placeTypes': ['Findspot'],
          "geometry": {
            "type": "Point",
            "coordinates": coords
          },
        };
      }
    }
  };

  useEffect(() => {
    handleArrayChange(authorities, 'authorities', currData, setCurrData)
  }, [authorities]);

  const addGeometry = (geometry) => {
    if(geometry.coordinates) {
      console.log('Coordinates found ', geometry.coordinates);
      handleArrayChange(geometry, 'geom', currData, setCurrData)
    } else {
      console.log('No coordinates found, skipping. ', geometry)
    }
  }

  return (
    <Paper>
      <Grid container spacing={1} padding={2} >
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Select
              value={authorityType}
              onChange={(e) => setAuthorityType(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="" disabled>
                Select Authority Type
              </MenuItem>
              {authorityOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }} >
          <TextField
            fullWidth
            label="Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }} > 
        {authorityType === 'Pleiades' && <PleiadesSearch setIdentifier={setIdentifier} />}
          {authorityType === 'GeoNames' && <GeonamesSearch setIdentifier={setIdentifier} />}
          {authorityType === 'Epigraphic Database Heidelberg' && <HeidelbergSearch setIdentifier={setIdentifier} />}
          {authorityType === 'iDAI Gazetteer' && <DaiSearch setIdentifier={setIdentifier} />}
          {!['Pleiades', 'GeoNames', 'Epigraphic Database Heidelberg', 'iDAI Gazetteer'].includes(authorityType) && authorityType && (
            <Typography variant="body1">
              No API found for {authorityType}.
            </Typography>
          )}  
        </Grid>
        <Grid size={{ xs: 6, md: 4 }} > 
          <FormControl fullWidth>
            <Select
              value={mappingRelation}
              onChange={(e) => setMappingRelation(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="" disabled>
                Select Match Type
              </MenuItem>
              {matchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>                          
        <Grid size={{ xs: 12 }} padding={1}>
          <Button variant="contained" disabled={!authorityType || !identifier} onClick={() => handleAddAuthority(authoritiesConfig, identifier, setIdentifier, setAuthorities, authorityType, setAuthorityType, mappingRelation)}>
            Add Authority
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }}>      
          <List>
            {Object.entries(authorities).map(([type, authorityData]) => {
              const { 'dc:identifier': url, id, geometry, mappingRelation } = authorityData; // Destructure the necessary data

              return (
                <>
                <ListItem key={type} secondaryAction={
                  <>
                      <IconButton
                        aria-label="Open in new tab"
                        onClick={() => window.open(url, '_blank')}
                        edge="end"
                      >
                        <LaunchIcon />
                      </IconButton>                  
                      <IconButton
                        aria-label="Extract geometry"
                        onClick={() => addGeometry(geometry)}
                        edge="end"
                      >
                        <AddLocationAltIcon />
                      </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAuthority(type, authorities, setAuthorities)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }>
                { /*  
                  {validityState[type] === 'loading' && <CircularProgress size={20} />}
                  {validityState[type] === 'valid' && <CheckCircleIcon color="success" />}
                  {validityState[type] === 'invalid' && <ErrorIcon color="error" />}   
                */}              
                  <Typography variant="subtitle1" >{type}

                  </Typography>
                  {id && 
                    <Typography variant="body2" >: {id} ({mappingRelation})</Typography>
                  }     
                </ListItem>
                <Divider variant="middle" component="li" />
                </>
              );
            })}
          </List>
        </Grid>

    </Grid>      
  </Paper>  
  );
};

const PleiadesSearch = ({ setIdentifier }) => {
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [allOptions, setAllOptions] = useState([]); // Store all options
  const [loading, setLoading] = useState(false);

  // Filtered options to be shown in the dropdown
  const filteredOptions = searchOptions.filter(option =>
    option[0].toLowerCase().includes(inputValue.toLowerCase())
  );


  // Fetch the data once, when the component is mounted
  useEffect(() => {
    setLoading(true);
    fetch('https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/name_index.json')
      .then(response => response.json())
      .then(data => {
        setAllOptions(data); // Store all data in state
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this only runs once

  // Update filtered options based on input value
  useEffect(() => {
    if (inputValue.length >= 3) {
      // Filter the full set of options based on the current input value
      const filtered = allOptions.filter(option =>
        option[0].toLowerCase().includes(inputValue.toLowerCase())
      );
      setSearchOptions(filtered);
    } else {
      // Reset search options if input value is less than 3 characters
      setSearchOptions([]);
    }
  }, [inputValue, allOptions]); // Depend on inputValue and allOptions

  return (
    <Autocomplete
      id="search"
      options={filteredOptions}
      getOptionLabel={(option) => option[0]}
      inputValue={inputValue} // Use inputValue to control the text field value
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'input') {
          setInputValue(newInputValue); // Update raw input state which controls the text field value
        }
      }}
      onChange={(event, newValue) => {
        if (newValue && newValue.length > 0) {
          // Do not confuse newValue with ID here; we just want to set the selected object
          setIdentifier(newValue[1])
          console.log('Selected ID:', newValue[1]); // Assuming the second item is your ID
        }
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Pleiades..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={`${option[0]}-${option[1]}`}>
          {`${option[0]} (${option[1]})`}
        </li>
      )}
    />
  );
};
const HeidelbergSearch = ({ setIdentifier }) => {
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce the API call to avoid calling API for every keystroke, wrap in useCallback to avoid new rener on each input
  const fetchSearchResults = useCallback(debounce((searchText) => {
    if (searchText.length >= 3) {
      setLoading(true);
      fetch(`https://edh.ub.uni-heidelberg.de/data/api/geographie/suche?fundstelle=*${searchText}*`)
        .then(response => response.json())
        .then(data => {
          setSearchOptions(data.items);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setSearchOptions([]);
      setLoading(false);
    }
  }, 500), []);

  // Update the search results when the input value changes
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === 'input') {
      fetchSearchResults(newInputValue);
    }
  };

  return (
    <Autocomplete
      id="adh-search"
      options={searchOptions}
      getOptionLabel={(option) => `${option.findspot} (${option.findspot_modern}, ${option.country})`}
      inputValue={inputValue}
      onChange={(event, newValue) => {
        if (newValue) {
          setIdentifier(newValue.id); // Store the geonameId when an option is selected
        }
      }}
      onInputChange={handleInputChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search EDH..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {`${option.findspot} (${option.findspot_modern}, ${option.country})`}
        </li>
      )}
    />
  );
};

const GeonamesSearch = ({ setIdentifier }) => {
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce the API call to avoid calling API for every keystroke, wrap in useCallback to avoid new rener on each input
  const fetchSearchResults = useCallback(debounce((searchText) => {
    if (searchText.length >= 3) {
      setLoading(true);
      fetch(`https://secure.geonames.org/searchJSON?q=${searchText}&maxRows=10&username=${geonamesApiKey}&style=short`)
        .then(response => response.json())
        .then(data => {
          setSearchOptions(data.geonames);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setSearchOptions([]);
      setLoading(false);
    }
  }, 500), []);

  // Update the search results when the input value changes
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === 'input') {
      fetchSearchResults(newInputValue);
    }
  };

  return (
    <Autocomplete
      id="geo-search"
      options={searchOptions}
      getOptionLabel={(option) => `${option.toponymName} (${option.countryCode})`}
      inputValue={inputValue}
      onChange={(event, newValue) => {
        if (newValue) {
          setIdentifier(newValue.geonameId); // Store the geonameId when an option is selected
        }
      }}
      onInputChange={handleInputChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search GeoNames..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.geonameId}>
          {`${option.toponymName} (${option.countryCode})`}
        </li>
      )}
    />
  );
};

const DaiSearch = ({ setIdentifier }) => {
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSearchResults = useCallback(debounce(async (searchText) => {
      if (searchText.length < 3) {
          setSearchOptions([]);
          setLoading(false);
          return;
      }

      setLoading(true); // Initiate loading state
      try {
          const response = await fetch(`https://gazetteer.dainst.org/search.json?q=*${searchText}*&noPolygons=true&sort=prefName.title.sort&offset=0&limit=10`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setSearchOptions(data.result); // Update state with fetched data
      } catch (error) {
          console.error('Error while fetching search results:', error);
          setSearchOptions([]); // Handle error by setting empty options
      } finally {
          setLoading(false); // Reset loading state
      }
  }, 500), []);

  // Later in the handleInputChange function:
  const handleInputChange = (event, newInputValue, reason) => {
      setInputValue(newInputValue);
      if (reason === 'input') {
          fetchSearchResults(newInputValue); // Consider re-debouncing here if needed
      }
  };

  return (
    <Autocomplete
      id="dai-search"
      options={searchOptions}
      getOptionLabel={(option) => `${option.prefName.title} (${option.prefName.language})`}
      inputValue={inputValue}
      onChange={(event, newValue) => {
        if (newValue) {
          setIdentifier(newValue.gazId);
        }
      }}
      onInputChange={handleInputChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search iDAI Gazetteer..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.gazId}>
          {`${option.prefName.title} (${option.prefName.language})`}
        </li>
      )}
    />
  );
};