import React from 'react';
import Typography from '@mui/material/Typography'; 
import { AboutIcon } from 'components/LocalIcons';
import { FullPage, PageContent } from 'components/layout/Sheets';


const About = () => {
  console.log("Render About")

  return (
    <>
      <header className="w3-container" >
        <Typography variant="h5" gutterBottom >
          <AboutIcon /> About
        </Typography>
      </header>
      <PageContent>
        <FullPage>
          <Typography variant="subtitle1"  >
            This is the web frontend for the database for "The Prison Project" housed in the Faculty of Theology at the University of Copenhagen. The Prison Project is funded by Carlsberg: Semper Ardens and studies the materiality and archaeology of incarceration in Mediterranean antiquity. 
          </Typography>  
        </FullPage>
      </PageContent>
    </>
  );
};

export default About;
