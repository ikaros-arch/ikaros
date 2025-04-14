import React from 'react';
import Typography from '@mui/material/Typography'; 
import { AboutIcon } from 'components/LocalIcons';
import { FullPage, PageContent } from 'components/layout/Sheets';
import PageHeader from 'components/layout/PageHeader';


const About = () => {
  console.log("Render About")

  return (
    <>
      <PageHeader
        IconComponent={AboutIcon}
        title="About"
      />
      <PageContent>
        <FullPage>
          <Typography variant="subtitle1"  >
            This is the web frontend for the excavations on Dhaskalio and Keros. 
          </Typography>
        </FullPage>
      </PageContent>
    </>
  );
};

export default About;
