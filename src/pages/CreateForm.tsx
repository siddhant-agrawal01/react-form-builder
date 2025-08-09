import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import {  Save } from '@mui/icons-material';
import { useFormBuilder } from '../context/FormBuilderContext';
import { FieldEditor } from '../components/FieldEditor';
import { FormField, FieldType } from '../types/form';

export function CreateForm() {
  const { state, dispatch } = useFormBuilder();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');

  useEffect(() => {
    if (!state.currentForm) {
      dispatch({ type: 'NEW_FORM' });
    }
  }, [state.currentForm, dispatch]);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      validationRules: [],
      order: state.currentForm?.fields.length || 0,
    };

    dispatch({ type: 'ADD_FIELD', payload: newField });
  };

  const handleSaveForm = () => {
    if (!formName.trim()) return;
    
    dispatch({ type: 'SAVE_FORM', payload: { name: formName } });
    setSaveDialogOpen(false);
    setFormName('');
  };

  const fieldTypes: { type: FieldType; label: string; description: string }[] = [
    { type: 'text', label: 'Text', description: 'Single line text input' },
    { type: 'number', label: 'Number', description: 'Numeric input field' },
    { type: 'textarea', label: 'Textarea', description: 'Multi-line text input' },
    { type: 'select', label: 'Select', description: 'Dropdown selection' },
    { type: 'radio', label: 'Radio', description: 'Single choice from options' },
    { type: 'checkbox', label: 'Checkbox', description: 'Multiple choice options' },
    { type: 'date', label: 'Date', description: 'Date picker input' },
  ];

  if (!state.currentForm) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 120px)' }}>
      {/* Field Types Panel */}
      <Paper sx={{ width: 300, p: 2, height: 'fit-content' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Add Fields
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {fieldTypes.map((fieldType) => (
            <Button
              key={fieldType.type}
              variant="outlined"
              onClick={() => addField(fieldType.type)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                p: 2,
                height: 'auto',
                '&:hover': {
                  backgroundColor: 'primary.50',
                },
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {fieldType.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fieldType.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<Save />}
          onClick={() => setSaveDialogOpen(true)}
          sx={{ mt: 3 }}
          disabled={state.currentForm.fields.length === 0}
        >
          Save Form
        </Button>
      </Paper>

      {/* Form Builder */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
           <a href="/"> Form Builder</a>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Drag and configure fields to build your form
          </Typography>
        </Box>

        {state.currentForm.fields.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Start building your form by adding fields from the left panel.
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Fields ({state.currentForm.fields.length})
            </Typography>
            
            {state.currentForm.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  availableFields={state.currentForm?.fields || []}
                />
              ))}
          </Box>
        )}
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Form Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Enter a name for your form"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveForm} 
            variant="contained"
            disabled={!formName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}