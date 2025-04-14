import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const FullScreenStepper = ({ steps, parent, parentId, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSave(); // Save action when on the last step
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white',
      }}
    >
      {/* Step Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', padding: 2 }}>
        {steps[currentStep].content({ parent, parentId })}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation showLabels>
        <BottomNavigationAction
          label="Previous"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        />
        <BottomNavigationAction label="Cancel" onClick={handleCancel} />
        <BottomNavigationAction
          label={currentStep === steps.length - 1 ? 'Save' : 'Next'}
          onClick={handleNext}
          disabled={steps[currentStep].isNextDisabled?.()}
        />
      </BottomNavigation>
    </Box>
  );
};

export default FullScreenStepper;