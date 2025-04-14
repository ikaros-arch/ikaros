import React, { useEffect, useState } from 'react';
import { useStore } from 'services/store';
import useCrudActions from '@/hooks/useCrudActions';
import CrudButtons from 'components/buttons/CrudButtons';
import ScapeFields from 'components/input/survey/ScapeFields';
import TableDrawer from 'components/layout/TableDrawer';
import DesktopMap from 'components/visualisations/DesktopMap';
import { PageContent, HalfPage, ScrollSheet } from 'components/layout/Sheets';
import { surveyColDefs } from 'helpers/tableRenders';

const Audit = () => {
  return (
    <ScrollSheet id="audit">
      Audit
    </ScrollSheet>
  );
};


const NavLeft = () => {
  function scrollto(id, instant){
    if(instant && navigator.userAgent.match(/chrome|chromium|crios|edg/i)){
      document.getElementById(id).scrollIntoView();
    } else {
      document.getElementById(id).scrollIntoView({behavior: 'smooth'});
    };
  }
  return (
    <div className="w3-center w3-xlarge w3-text-white w3-display-left w3-dark-grey w3-round-xxlarge w3-margin leftMenu">
      <span className="fa fa-eye fa-fw w3-transparent w3-hover-shadow" onClick={() => scrollto('form')} style={{cursor:"pointer"}} />
      <span className="fa fa-eye w3-transparent w3-hover-shadow" onClick={() => scrollto('audit')} style={{cursor:"pointer"}} />
    </div>
    );
};

const NavRight = () => {
  function scrollto(id, instant){
    if(instant && navigator.userAgent.match(/chrome|chromium|crios|edg/i)){
      document.getElementById(id).scrollIntoView();
    } else {
      document.getElementById(id).scrollIntoView({behavior: 'smooth'});
    };
  }
  return (
    <div className="w3-center w3-xlarge w3-text-white w3-display-right w3-dark-grey w3-round-xxlarge w3-margin rightMenu">
      <span className="fa fa-eye fa-fw w3-transparent w3-hover-shadow" onClick={() => scrollto('map')} style={{cursor:"pointer"}} />
      <span className="fa fa-eye w3-transparent w3-hover-shadow" onClick={() => scrollto('hello')} style={{cursor:"pointer"}} />
    </div>
    );
};

const DesktopScapes = () => {
  console.log("Render DesktopScape")
  const currData = useStore(state => state.currScape);
  const setCurrData = useStore(state => state.setCurrScape);
  const setTableOpen = useStore(state => state.setTableOpen);
  const scapes = useStore(state => state.scape);  
  const [scapeForDb, setScapeForDb] = useState(null);

  //Preparing object for writing to database by rmeoving columns not available in the edit table (eg columns from joined tables)
  useEffect(() => {
    if (currData) {
      const { 
        area, 
        tract, 
        type, 
        layout,
        geom, 
        geometry, 
        recorder, 
        teamleader, 
        walkers, 
        doc_methods, 
        natural_resources, 
        updated_by, 
        ...scapeData 
      } = currData;
      setScapeForDb(scapeData);
    }
  }, [currData]);

  useCrudActions({
    setSelectedRowData: setCurrData,
    selectedRowData: scapeForDb,
    viewTable: 'view_scape',  
    editTable: 'edit_scape'
  });

  const listColumns = [
    surveyColDefs.name,
    surveyColDefs.parent,
    surveyColDefs.type,
//    {
//      field: ' ',
//      disableColumnMenu: true,
//      sortable: false,
//      width: 15,
//      disableClickEventBubbling: true,
//      renderCell: (params) => {
//        return (
//          <>
//            <IconButton onClick={() => deleteRow(params.row.uuid)}>
//              <DeleteForeverIcon />
//            </IconButton>
//          </>
//        );
//      },
//    },
  ];

  return (
    <>
      <header className="w3-container" >
        <h5><b><span className="obj-icon"></span> Scape </b></h5>
        <a href="#" className="w3-bar-item w3-button w3-padding w3-right" type="button" onClick={() => setTableOpen(true)}>
          <i className="fa fa-list fa-fw"></i>  View list
        </a>
      </header>
      <PageContent>
        <HalfPage>
          <ScrollSheet id="form">
            <ScapeFields currData={currData} setCurrData={setCurrData} />
            <CrudButtons />
          </ScrollSheet>
          <Audit />
          <NavLeft />
        </HalfPage>
        <HalfPage>
          <DesktopMap 
            currData={currData}
            setCurrData={setCurrData}
            parent={'scape'}
          />
          <ScrollSheet id="hello">
            <h1>Hello, World!</h1>
          </ScrollSheet>
          <NavRight />
        </HalfPage>
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={'list_scape'}
        apiTable={'view_scape'}
        setCurrData={setCurrData}
      />
    </>
  );
};

export default DesktopScapes;
