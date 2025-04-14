import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import useCrudActions from 'hooks/useCrudActions';
import { TermFields, PlaceFields, ActorFields } from 'components/input/VocabFields';
import RecordsTable from 'components/VocabRecords';
import TableDrawer from 'components/layout/TableDrawer';
import Audit from 'components/sheets/mima/MimaAudit';
import Orcid from 'components/sheets/mima/MimaOrcid';
import { TermIcon } from 'components/LocalIcons';
import { HalfPage, LeftStack, PageContent, ScrollSheet } from "components/layout/Sheets";
import { NavMenu, NavRight, menuDefs } from 'components/layout/NavMenu';
import { SelectTable, SearchTable } from 'components/layout/Table';
import { ReadMap, EditMap } from "components/sheets/excavation/Map";
import { makeRequest } from 'services/query';
import { jsonColDef, standardColDef, colDef } from '@/helpers/tableRenders';
import PageHeader from 'components/layout/PageHeader';


 
const NavLeft = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const changeType = (newType) => {
    // This function changes the category while keeping the id the same.
    navigate(`/Vocabulary/${newType}/${id ? id : ''}`);
  };

  const leftMenuItems = [
    { iconClass: 'fa fa-language fa-fw', onClick: () => changeType('Term'), title: 'Term' },
    { iconClass: 'fa fa-map-marker fa-fw', onClick: () => changeType('Place'), title: 'Place' },
    { iconClass: 'fa fa-users fa-fw', onClick: () => changeType('Actor'), title: 'Actor' },
  ];

    return (
      <NavMenu menuItems={leftMenuItems} additionalClasses="leftMenu"  />
    );
};

const rightMenuItems = [
  menuDefs.records,
  { iconClass: 'fa fa-search fa-fw', scrollTarget: 'table', title: 'Search Terms' },
  menuDefs.map,
  menuDefs.audit,
];

const Terms = () => {
  console.log("Render Terms");

  let { id } = useParams(); // Grabs the entryID from the URL 

  const termTypes = useStore(state => state.termTypes);
  const currData = useStore(state => state.currTerm);
  const setCurrData = useStore(state => state.setCurrTerm);

  const apiTable = 'edit_terms';

  console.log('currData');
  console.log(currData);

  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,
    editTable: apiTable
  });

  const columns = [
    colDef.uuid,
    standardColDef('term_name', 'Name'),
    standardColDef('term_type', 'Type'),
    jsonColDef('authority', 'Authority'),
  ];

  return (
    <>
      <HalfPage>
        <Typography variant="h6" >
            Terms
        </Typography>
        <LeftStack currData={currData} >
          <TermFields 
            currData={currData} 
            setCurrData={setCurrData} 
          />
        </LeftStack>
      </HalfPage>
      <HalfPage>
        <ScrollSheet id="table">
          <SearchTable 
            listData={termTypes}
            searchCol={'term_name'}
            listCol={'term_type'}
            columns={columns}
            apiTable={apiTable}
          />
        </ScrollSheet>
        <ScrollSheet id="records">
          <RecordsTable 
            currData={currData} 
            parent={'term'}
          />
        </ScrollSheet>
        <ReadMap 
          currData={currData}
          setCurrData={setCurrData}
          parent={'vocabulary'}
        />
        <Audit 
          currData={currData}
          setCurrData={setCurrData}
          parent={'vocabulary'}
        />
        { currData &&
          <NavRight menuItems={rightMenuItems} />
        }
      </HalfPage>
    </>
  );
};

const Places = () => {
  console.log("Render Places");

  let { id } = useParams(); // Grabs the entryID from the URL  

  const currData = useStore(state => state.currPlace);
  const setCurrData = useStore(state => state.setCurrPlace);
  const [loading, setLoading] = useState(false);
  const [dataForDb, setDataForDb] = useState(null);

  //console.log(currData);

  //Preparing object for writing to database
  useEffect(() => {
    if (currData) {
      const { geojson, ...preppedData } = currData;
      setDataForDb(preppedData);
    }
  }, [currData]); // This effect runs whenever `currData` changes

  const apiTable = 'v_place';
  const editTable = 'edit_place';


  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: dataForDb,
    viewTable: apiTable,  
    editTable: editTable
  });


  const columns = [
    colDef.uuid,
    colDef.name,
    standardColDef('place_type', 'Type'),
    colDef.authorities, 
  ];


  return (
    <>
      <HalfPage>
        <Typography variant="h6" >
            Places
        </Typography>
        <LeftStack currData={currData} >
          <PlaceFields 
            currData={currData}
            setCurrData={setCurrData}
          />
        </LeftStack>
      </HalfPage>
      <HalfPage>
        <ScrollSheet id="table">
          <SearchTable 
            searchCol={'name'}
            columns={columns}
            apiTable={apiTable}
          />
        </ScrollSheet>
        <ScrollSheet id="records">
          <RecordsTable 
            currData={currData} 
            parent={'place'}
          />
        </ScrollSheet>
        <EditMap 
          currData={currData}
          setCurrData={setCurrData}
          parent={'place'}
        />
        <Audit 
          currData={currData}
          setCurrData={setCurrData}
          parent={'place'}
        />
        <NavRight menuItems={rightMenuItems} />
      </HalfPage>
    </>
  );
};

const Actors = () => {
  console.log("Render Actors");

  let { id } = useParams(); // Grabs the entryID from the URL

  const currData = useStore(state => state.currActor);
  const setCurrData = useStore(state => state.setCurrActor);
  const [loading, setLoading] = useState(false);

  const apiTable = 'edit_actor';


  useEffect(() => {
    if (id){
      const loadData = async () => {
        try {
          const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
          setCurrData(getData[0])
        } catch (error) {
          console.error('Could not load data for record:', error);
        }
      };
      loadData();
    }
  }, [id]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: currData,
    viewTable: apiTable,  
    editTable: apiTable
  });

  const columns = [
    colDef.uuid,
    colDef.name,
    standardColDef('initials', 'Initials'),
    standardColDef('orcid', 'ORCID ID'),
  ];

  return (
    <>
      <HalfPage>
        <Typography variant="h6" >
            Actors
        </Typography>
        <LeftStack currData={currData} >
          <ActorFields currData={currData} setCurrData={setCurrData} />
        </LeftStack>
      </HalfPage>
      <HalfPage>
        <ScrollSheet id="table">
          <SelectTable
            columns={columns}
            listTable={apiTable}
            loading={loading}
            setLoading={setLoading}
          />
        </ScrollSheet>
        <Orcid 
          orcid={currData?.orcid}
          parent={'actor'}
        />
        <Audit 
          currData={currData}
          setCurrData={setCurrData}
          parent={'actor'}
        />
        <NavRight menuItems={rightMenuItems} />
      </HalfPage>
    </>
  );
};

const Vocabulary = () => {
  console.log("Render Vocabulary");
  const setTableOpen = useStore(state => state.setTableOpen);
  const vocabType = useStore(state => state.vocabType);
  const setVocabType = useStore(state => state.setVocabType);  
  const [loading, setLoading] = useState(false);  

  const { type } = useParams();
  if(type) {
    setVocabType(type)
  }

  const apiTable = 'list_vocab';

  const listColumns = [
    colDef.uuid,
    colDef.name,
    standardColDef('parent', 'Type'),
    standardColDef('type', 'Sub-Type'),
    colDef.authorities, 
  ];

  return (
    <>
      <PageHeader
        IconComponent={TermIcon}
        title="Vocabulary"
        setTableOpen={setTableOpen}
      />
      <PageContent>
      { vocabType === 'Term' ?
        <Terms />
        : vocabType === 'Place' ?
        <Places />
        : vocabType === 'Actor' ?
        <Actors />
        : <Terms />
      }
        <NavLeft />
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={apiTable}
        subCol={'parent'}
      />
    </>
  );
};

export default Vocabulary;
