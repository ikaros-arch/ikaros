import React from 'react';
import Masonry from '@mui/lab/Masonry';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography'; 
import { SettingsIcon } from 'components/LocalIcons';
import { useStore } from 'services/store';
import { DataSubEntry, FullPage, PageContent } from 'components/layout/Sheets';
import TransferList from '@/components/input/TransferList';
import { 
  InputText, 
  ToggleButtons,
  SingleSelect,
} from 'components/input/InputFields';


const Settings = () => {
  console.log("Render Settings")
  const currData = useStore(state => state.userSettings);
  const setCurrData = useStore(state => state.setUserSettings);
  const userRole = useStore(state => state.userRole);
  const trenches = useStore(state => state.trenches);

  return (
    <>
      <header className="w3-container" >
        <Typography variant="h5" gutterBottom >
          <SettingsIcon /> Settings
        </Typography>
      </header>
      <PageContent>
        <FullPage>
          <Typography variant="body1" padding={1} >
            Currently no user configurable settings implemented.
          </Typography>
          <Masonry columns={{ xs: 1, md: 2 }} spacing={2}>
            <DataSubEntry heading={"Trench Defaults"} >
              <Grid size={{ xs: 12, sm: 6 }} >
                <ToggleButtons
                  name="trench_selection"
                  label="Trench selection"
                  currData={currData}
                  setCurrData={setCurrData}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Single', value: 'single' },
                  ]}
                  optionLabel="label"
                  optionValue="value"
                />
              </Grid>
              <Grid size={{ xs: 12,  sm: 6 }}>
                {currData.trench_selection === 'single' &&
                  <SingleSelect
                    name="default_trench"
                    label="Default Trench"
                    currData={currData}
                    setCurrData={setCurrData}
                    options={trenches}
                    optionLabel="identifier"
                    optionValue="uuid"
                    toolTip='Select your default trench from the available options.'
                  />
                }
              </Grid>
            </DataSubEntry>
            <DataSubEntry heading={"Sidebar settings"} >
              <Grid size={{ xs: 12, sm: 6 }} >
                <TransferList
                />
              </Grid>
            </DataSubEntry>
            <DataSubEntry heading={"User Profile Data"} >
              <Grid size={{ xs: 12 }}>
                <Typography variant="body1" >
                  Settings for the user account in the database, including username and contact information.
                </Typography>
              </Grid>
            </DataSubEntry>
          </Masonry>
        </FullPage>
      </PageContent>
    </>
  );
};

export default Settings;
