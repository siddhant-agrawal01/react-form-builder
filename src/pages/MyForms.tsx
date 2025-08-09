import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import { Preview, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '../context/FormBuilderContext';

export function MyForms() {
  const { state, dispatch } = useFormBuilder();
  const navigate = useNavigate();

  const handlePreviewForm = (formId: string) => {
    dispatch({ type: 'SELECT_FORM', payload: formId });
    navigate('/preview');
  };

  const handleEditForm = (formId: string) => {
    dispatch({ type: 'SELECT_FORM', payload: formId });
    navigate('/create');
  };

  const handleDeleteForm = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      const updatedForms = state.savedForms.filter(form => form.id !== formId);
      localStorage.setItem('formBuilderForms', JSON.stringify(updatedForms));
      dispatch({ type: 'LOAD_FORMS' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (state.savedForms.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          No Saved Forms
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You haven't created any forms yet. Start building your first form!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
          size="large"
        >
          Create Your First Form
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          My Forms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and preview your saved forms
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {state.savedForms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    {form.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteForm(form.id)}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${form.fields.length} field${form.fields.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Created: {formatDate(form.createdAt)}
                </Typography>
                
                {form.updatedAt !== form.createdAt && (
                  <Typography variant="body2" color="text.secondary">
                    Updated: {formatDate(form.updatedAt)}
                  </Typography>
                )}

                {form.fields.some(field => field.isDerived) && (
                  <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                    Contains derived fields
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEditForm(form.id)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Preview />}
                  onClick={() => handlePreviewForm(form.id)}
                >
                  Preview
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/create')}
          size="large"
        >
          Create New Form
        </Button>
      </Box>
    </Box>
  );
}