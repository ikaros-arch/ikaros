import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography';
import { externalRequest } from 'services/query';
import { ScrollSheet } from 'components/layout/Sheets';


const Orcid = ({ orcid }) => {
  const [orcidData, setOrcidData] = useState({});
        console.log('orcid');
        console.log(orcid);

  useEffect(() => {
    if (orcid){

      const endpoint = `https://orcid.org/${orcid}/public-record.json`

      const loadData = async () => {
        try {
          const getData = await externalRequest('get', `${endpoint}`, {}, {});
          setOrcidData(getData)
        } catch (error) {
          console.error('Could not load data from ORCID:', error);
        }
      };
      loadData();
    }
  }, [orcid]);

  if(!orcidData) {
    return (
      <Typography variant="subtitle1" >
          No ORCID data found. Check ORCID ID.
      </Typography>
    )
  }

  return (
    <ScrollSheet id="orcid">
      <Typography variant="h6" >
          ORCID Record {orcid}
      </Typography> 
      <Typography variant="subtitle1" >
          Name: {orcidData?.displayName}
      </Typography>
      <Typography variant="subtitle1" >
          Website: {orcidData?.website?.websites[0]?.urlName}
      </Typography>
    </ScrollSheet>
  );
};

export default Orcid;
