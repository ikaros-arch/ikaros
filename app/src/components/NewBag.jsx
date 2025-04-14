import React, { useState } from 'react';
import FullScreenStepper from 'components/FullScreenStepper';
import TextField from '@mui/material/TextField';
import { EditMap } from 'components/sheets/excavation/Map';

const NewBag = ({ parent, parentId }) => {
  const [formData, setFormData] = useState({
    type: '',
    trench: '',
    context: '',
    map: '',
    dateCollected: '',
    comment: '',
  });

  const steps = [
    {
      label: 'Step 1',
      content: () => (
        <>
          <TextField
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Trench"
            value={formData.trench}
            onChange={(e) => setFormData({ ...formData, trench: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Context"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            fullWidth
            margin="normal"
          />
        </>
      ),
    },
    {
      label: 'Step 2',
      content: () => (
        <EditMap
          currData={formData}
          setCurrData={setFormData}
          parent={'NewBag'}
        />
      ),
    },
    {
      label: 'Step 3',
      content: () => (
        <>
          <TextField
            label="Date Collected"
            type="date"
            value={formData.dateCollected}
            onChange={(e) => setFormData({ ...formData, dateCollected: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            fullWidth
            margin="normal"
          />
        </>
      ),
      isNextDisabled: () => !formData.dateCollected, // Disable Save if date is not filled
    },
  ];

  const handleSave = () => {
    // Save the formData to the API
    console.log('Saving:', { parent, parentId, ...formData });
  };

  const handleCancel = () => {
    // Handle cancel action
    console.log('Cancelled');
  };

  return (
    <FullScreenStepper
      steps={steps}
      parent={parent}
      parentId={parentId}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default NewBag;