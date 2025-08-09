/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography,  Paper } from '@mui/material';
import { useFormBuilder } from '../context/FormBuilderContext';
import { FormRenderer } from '../components/FormRenderer';

export function Preview() {
  const { state } = useFormBuilder();

  if (!state.currentForm) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          No Form to Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a form first or select an existing form from "My Forms" to preview it.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = (data: any) => {
    alert('Form submitted successfully!');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Form Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is how your form will appear to end users
        </Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <FormRenderer
          formSchema={state.currentForm}
          onSubmit={handleSubmit}
          showErrors={true}
        />
      </Paper>
    </Box>
  );
}