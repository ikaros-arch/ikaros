import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import { TermFields } from 'components/input/VocabFields';
import RecordsTable from 'components/VocabRecords';
import Audit from 'components/sheets/mima/MimaAudit';
import { HalfPage, LeftStack, ScrollSheet } from 'components/layout/Sheets';
import { NavRight, menuDefs } from 'components/layout/NavMenu';
import { SearchTable } from 'components/layout/Table';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { makeRequest } from 'services/query';


const LeftHalf = ({ currData, setCurrData }) => {
  return (
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
  );
};

const RightHalf = ({ currData, apiTable }) => {
  const userRole = useStore(state => state.userRole);
  const termTypes = useStore(state => state.termTypes);

  const listColumns = [
    standardColDef('term_name', 'Name'),
    standardColDef('term_type', 'Type'),
    colDef.authorities
  ];

  const rightMenuItems = [
    menuDefs.records,
    { iconClass: 'fa fa-search fa-fw', scrollTarget: 'table', title: 'Search Terms' },
  ];

  if (userRole === 'admin') {
    rightMenuItems.push(menuDefs.audit);
  }

  if (!currData) {
    return (
      <HalfPage>
        <ScrollSheet id="table">
          <SearchTable 
            listData={termTypes}
            searchCol={'term_name'}
            listCol={'term_type'}
            columns={listColumns}
            apiTable={apiTable}
          />
        </ScrollSheet>
      </HalfPage>
    );
  }

  return (
    <HalfPage>
      <ScrollSheet id="records">
        <RecordsTable 
          currData={currData} 
          parent={'term'}
        />
      </ScrollSheet>
      <ScrollSheet id="table">
        <SearchTable 
          listData={termTypes}
          searchCol={'term_name'}
          listCol={'term_type'}
          columns={listColumns}
          apiTable={apiTable}
        />
      </ScrollSheet>
    { userRole === 'admin' && (
      <Audit 
        parent={'term'}
      />
    )}
      <NavRight menuItems={rightMenuItems} />
    </HalfPage> 
  );
};

const Terms = () => {
  console.log("Render Terms")

  let { id } = useParams(); // Grabs the entryID from the URL 

  const currData = useStore(state => state.currTerm);
  const setCurrData = useStore(state => state.setCurrTerm);
  const setCurrUuid = useStore(state => state.setCurrUuid);
  const storedUuid = useStore(state => state.currUuid);

  const apiTable = 'edit_terms'

  useEffect(() => {
    if (currData?.uuid && currData.uuid !== storedUuid) {
      setCurrUuid(currData.uuid);
    };
  }, [currData]);

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

  return (
    <>
      <LeftHalf
        currData={currData}
        setCurrData={setCurrData}
      />
      <RightHalf
        currData={currData}
        apiTable={apiTable}
      />
    </>
  );
};

export default Terms;