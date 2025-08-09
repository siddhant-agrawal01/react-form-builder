import React, { useState, forwardRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Chip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete,
  DragIndicator,
  ExpandMore,
  Add,
  Remove,
} from '@mui/icons-material';
import { FormField, ValidationRule, SelectOption, FieldType } from '../types/form';
import { useFormBuilder } from '../context/FormBuilderContext';

interface FieldEditorProps {
  field: FormField;
  availableFields: FormField[];
  dragHandleProps?: any;
}

export const FieldEditor = forwardRef<HTMLDivElement, FieldEditorProps>(
  ({ field, availableFields, dragHandleProps }, ref) => {
  const { dispatch } = useFormBuilder();
  const [newOption, setNewOption] = useState('');
  const [newValidationRule, setNewValidationRule] = useState<ValidationRule>({
    type: 'required',
    message: '',
  });

  const updateField = (updates: Partial<FormField>) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { id: field.id, field: updates } });
  };

  const deleteField = () => {
    dispatch({ type: 'DELETE_FIELD', payload: field.id });
  };

  const addOption = () => {
    if (newOption.trim()) {
      const options = field.options || [];
      options.push({ label: newOption, value: newOption.toLowerCase().replace(/\s+/g, '_') });
      updateField({ options });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    updateField({ options });
  };

  const addValidationRule = () => {
    const rules = [...field.validationRules];
    rules.push({ ...newValidationRule });
    updateField({ validationRules: rules });
    setNewValidationRule({ type: 'required', message: '' });
  };

  const removeValidationRule = (index: number) => {
    const rules = [...field.validationRules];
    rules.splice(index, 1);
    updateField({ validationRules: rules });
  };

  const fieldTypeOptions: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'radio', label: 'Radio' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
  ];

  const validationTypes = [
    { value: 'required', label: 'Required' },
    { value: 'minLength', label: 'Minimum Length' },
    { value: 'maxLength', label: 'Maximum Length' },
    { value: 'email', label: 'Email Format' },
    { value: 'password', label: 'Password Rule' },
    { value: 'min', label: 'Minimum Value' },
    { value: 'max', label: 'Maximum Value' },
  ];

  return (
    <Card sx={{ mb: 2, border: 1, borderColor: 'grey.200' }} ref={ref}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} {...dragHandleProps}>
          <DragIndicator sx={{ color: 'grey.400', mr: 1, cursor: 'grab' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {field.label || 'New Field'}
          </Typography>
          <Chip
            label={fieldTypeOptions.find(opt => opt.value === field.type)?.label}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <TextField
            label="Field Label"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            fullWidth
          />
          
          <FormControl fullWidth>
            <InputLabel>Field Type</InputLabel>
            <Select
              value={field.type}
              onChange={(e) => updateField({ type: e.target.value as FieldType })}
            >
              {fieldTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => updateField({ required: e.target.checked })}
              />
            }
            label="Required Field"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={field.isDerived || false}
                onChange={(e) => updateField({ isDerived: e.target.checked })}
              />
            }
            label="Derived Field"
          />
        </Box>

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Options ({(field.options || []).length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  size="small"
                  fullWidth
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button onClick={addOption} variant="outlined" startIcon={<Add />}>
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(field.options || []).map((option, index) => (
                  <Chip
                    key={index}
                    label={option.label}
                    onDelete={() => removeOption(index)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Validation Rules ({field.validationRules.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={newValidationRule.type}
                  onChange={(e) => setNewValidationRule({
                    ...newValidationRule,
                    type: e.target.value as ValidationRule['type']
                  })}
                >
                  {validationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {(newValidationRule.type === 'minLength' || 
                newValidationRule.type === 'maxLength' ||
                newValidationRule.type === 'min' ||
                newValidationRule.type === 'max') && (
                <TextField
                  label="Value"
                  type="number"
                  value={newValidationRule.value || ''}
                  onChange={(e) => setNewValidationRule({
                    ...newValidationRule,
                    value: parseInt(e.target.value)
                  })}
                  size="small"
                  sx={{ width: 100 }}
                />
              )}
              
              <TextField
                label="Error Message"
                value={newValidationRule.message || ''}
                onChange={(e) => setNewValidationRule({
                  ...newValidationRule,
                  message: e.target.value
                })}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              
              <Button onClick={addValidationRule} variant="outlined" startIcon={<Add />}>
                Add Rule
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {field.validationRules.map((rule, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {rule.type}
                    {rule.value && `: ${rule.value}`}
                    {rule.message && ` - "${rule.message}"`}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => removeValidationRule(index)}
                    color="error"
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {field.isDerived && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Derived Field Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Derived fields automatically calculate their value based on other fields.
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Parent Fields</InputLabel>
                <Select
                  multiple
                  value={field.derivedConfig?.parentFields || []}
                  onChange={(e) => updateField({
                    derivedConfig: {
                      ...field.derivedConfig,
                      parentFields: e.target.value as string[],
                      formula: field.derivedConfig?.formula || '',
                      logic: field.derivedConfig?.logic || 'custom',
                    }
                  })}
                >
                  {availableFields
                    .filter(f => f.id !== field.id && !f.isDerived)
                    .map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Logic Type</InputLabel>
                <Select
                  value={field.derivedConfig?.logic || 'custom'}
                  onChange={(e) => updateField({
                    derivedConfig: {
                      ...field.derivedConfig,
                      parentFields: field.derivedConfig?.parentFields || [],
                      formula: field.derivedConfig?.formula || '',
                      logic: e.target.value as any,
                    }
                  })}
                >
                  <MenuItem value="age">Calculate Age from Date</MenuItem>
                  <MenuItem value="sum">Sum Values</MenuItem>
                  <MenuItem value="concat">Concatenate Text</MenuItem>
                  <MenuItem value="custom">Custom Formula</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Formula/Expression"
                multiline
                rows={2}
                value={field.derivedConfig?.formula || ''}
                onChange={(e) => updateField({
                  derivedConfig: {
                    ...field.derivedConfig,
                    parentFields: field.derivedConfig?.parentFields || [],
                    logic: field.derivedConfig?.logic || 'custom',
                    formula: e.target.value,
                  }
                })}
                placeholder="e.g., ${field1} + ${field2} or age calculation logic"
                fullWidth
                helperText="Use ${fieldId} to reference parent field values"
              />
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          onClick={deleteField}
          color="error"
          startIcon={<Delete />}
          variant="outlined"
          size="small"
        >
          Delete Field
        </Button>
      </CardActions>
    </Card>
  );
});
