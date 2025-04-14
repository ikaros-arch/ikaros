import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import TableDrawer from 'components/layout/TableDrawer';
import { FullPage, PageContent } from 'components/layout/Sheets';
import { makeRequest } from 'services/query';
import RelationshipGraph from 'components/visualisations/mima/RelationshipGraph';
import { RelationshipIcon } from 'components/LocalIcons';
import { standardColDef } from 'helpers/tableRenders';

const Relationships = () => {
  console.log("Render Relationships")
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(false);
  const setTableOpen = useStore(state => state.setTableOpen);

  const apiTable = 'v_crosslist'

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await makeRequest('get', `${apiTable}`, {}, {});
      setRels(data);
      setLoading(false);
    };
    getData();
    console.log("Relationships loaded.")
  }, []);


  const listColumns = [
    standardColDef('parent', 'Parent'),
    standardColDef('child', 'Child'),
    standardColDef('relationship', 'Relationship', 3),
    standardColDef('comment', 'Comment', 4),
  ]  


  return (
    <>
      <header className="w3-container" >
        <Typography variant="h5" gutterBottom >
          <RelationshipIcon /> Relationships
        </Typography>
        <a href="#" className="w3-bar-item w3-button w3-padding w3-right" type="button" onClick={() => setTableOpen(true)}>
          <i className="fa fa-list fa-fw"></i>  View list
        </a>
      </header>
      <PageContent>
        <FullPage>
          <div className="sheet-element hidden-scrollbar" id="rel">
            <RelationshipGraph rels={rels} />
          </div>
        </FullPage>
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={apiTable}
      />
    </>
  );
};

export default Relationships;
