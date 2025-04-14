import React from 'react';
import { isMobile } from 'react-device-detect';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CircularLoading } from 'components/layout/Loading';
import { NavLeft, NavRight } from 'components/layout/NavMenu';
import CrudButtons from 'components/buttons/DesktopCrudButtons';

export const PageContent = ({ children }) => {
  const mobileStyles = {
    overflow: 'hidden',
    zIndex: 1004,
  };

  const desktopStyles = {
  };

  return (
    <div className={`row ${isMobile ? 'page-content-mobile' : ''}`} >
      {children}
    </div>
  );
};

export const HalfPage = ({ children }) => {
  return (
    <div className={`w3-col l6 w3-card-4 w3-light-grey ${isMobile ? 'fill-main-mobile' : 'fill-main'}`} >
      {children}
    </div>
  );
};

export const TwoThirdsPage = ({ children }) => {
  return (
    <div className="w3-col l8 w3-card-4 w3-light-grey fill-main" style={{overflow: "hidden"}}>
      {children}
    </div>
  );
};

export const OneThirdsPage = ({ children }) => {
  return (
    <div className="w3-col l4 w3-card-4 w3-light-grey fill-main" style={{overflow: "hidden"}}>
      {children}
    </div>
  );
};

export const FullPage = ({ children }) => {
  return (
    <div className="w3-col m12 w3-card-4 w3-light-grey fill-main" style={{overflow: "hidden"}}>
      {children}
    </div>
  );
};

export const ScrollSheet = ({ children, id, scrollable }) => {

  return (
    <div id={id} className="sheet-element hidden-scrollbar" style={{ height: scrollable ? "100%" : "undefined" }}>
      {children}
    </div>
  );
};

export const RightStack = ({ children, currData, menuItems, OverviewComp }) => {
  if (!currData) {
    return (
      <div className={isMobile ? "sheet-container hidden-scrollbar" : "fill-main"} >
        {OverviewComp && 
          <OverviewComp />
        }
      </div>
    );
  }

  return (
    <div className={isMobile ? "sheet-container hidden-scrollbar" : "fill-main"} >
      {children}
      {menuItems &&
        <NavRight menuItems={menuItems} />
      }
    </div>
  );
};

export const OverviewSheet = ({ children, NewComp, loading }) => {

  return (
    <div className={isMobile ? "sheet-container hidden-scrollbar" : "fill-main"} >
      {loading ?
      <CircularLoading /> :
      <>
        <CrudButtons 
          rowSelected={false}
          NewComp={NewComp}
        />
        <div className="fill-most" >
          {children}
        </div>
      </>
    }
    </div>
  );
};

export const LeftStack = ({ children, currData, menuItems, NewComp, OverviewComp, loading }) => {

  if(!currData){
    return (
      <OverviewSheet
        NewComp={NewComp}
        loading={loading}
      >
        {OverviewComp && 
          <OverviewComp />
        }
      </OverviewSheet>
    );
  }
  return (
    <>
      <div className={isMobile ? "sheet-container hidden-scrollbar" : "fill-most"}>
        {children}
      </div>
      <CrudButtons rowSelected={true} />
      {menuItems &&
        <NavLeft menuItems={menuItems} />
      }
    </>
  );
};

export const DataEntry = ({ children, id, rolling }) => {
  return (
    <div id={id} className={`hidden-scrollbar ${rolling ? 'rolling-element' : 'sheet-element'}`} >
      <Grid container spacing={2} paddingBottom={2} >
        {children}
      </Grid>
    </div>
  );
};

export const DataSubEntry = ({ children, heading }) => {
  return (
    <Grid size={{ xs:12 }}> 
      <Paper elevation={1} sx={{ width: '100%' }}>
        <Grid container spacing={1} padding={1}>
          {heading &&
            <SubHeading heading={heading}/>
          }
          {children}
        </Grid>
      </Paper>
    </Grid>
  );
};

export const SubHeading = ({ heading }) => {
  return (
    <Grid size={{ xs: 12 }} padding={1}>
      <Typography variant="subtitle1" >
        {heading}
      </Typography>
    </Grid>
  );
}