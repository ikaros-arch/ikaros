import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Outlet } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { CircularLoading } from '@/components/layout/Loading';
import TopContainer from 'components/layout/TopContainer';
import Sidebar from 'components/layout/Sidebar';
import { ActionSnack } from 'components/layout/Snackbar';
import { useStore } from 'services/store';


const theme = createTheme({
  typography: {
  "fontFamily": `"Ubuntu", "Roboto", "Helvetica", "Arial", sans-serif`,
  "fontSize": 14,
  "fontWeightLight": 300,
  "fontWeightRegular": 400,
  "fontWeightMedium": 500
  },  
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          height: '100%', // All Card components will now have 100% height
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          display: 'flex', // All CardContent components will use flexbox layout
          justifyContent: 'center', // Center the content horizontally
          alignItems: 'center', // Vertical centering (along the cross-axis)
          flexDirection: 'column', // All CardContent will stack children vertically
          // If you also want to center text items vertically, you can include `alignItems: 'center'`
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          alignItems: 'end',
          //verticalAlign: 'bottom', // All SVG icons will be centered vertically
          //fontSize: 90,         // Set the font size to 60 for all icons

        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          verticalAlign: 'middle', // All SVG icons will be centered vertically
          //fontSize: 90,         // Set the font size to 60 for all icons

        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // These styles will apply to all TextFields within the ThemeProvider
          '& label': {
            fontSize: isMobile ? '1.5rem' : '1rem', // Label font size
          },
          '& input': {
            fontSize: isMobile ? '1.5rem' : '1rem', // Input font size
          },
        },
      }, 
    },
  },
});

const Layout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const popData = useStore(state => state.popData);
  console.log("Render Layout");

  return (
    <div className="layout">
      <ActionSnack />
      <TopContainer setSidebarVisible={setSidebarVisible} />
      <Sidebar sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
      <div className="w3-main main-container" >
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {popData ? <Outlet /> : <CircularLoading/>}
          </LocalizationProvider>
        </ThemeProvider>
      </div>
    </div>
  );
};

export default Layout;


