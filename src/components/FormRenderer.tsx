import { useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  FormGroup,
  FormHelperText,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, FormSchema } from '../types/form';
import { createValidationSchema, calculateDerivedValue } from '../utils/validation';

interface FormRendererProps {
  formSchema: FormSchema;
  onSubmit?: (data: any) => void;
  showErrors?: boolean;
}

export function FormRenderer({ formSchema, onSubmit, showErrors = true }: FormRendererProps) {
  
  const validationSchema = createValidationSchema(formSchema.fields);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Calculate derived field values
  useEffect(() => {
    const derivedFields = formSchema.fields.filter(field => field.isDerived);

    derivedFields.forEach(field => {
      const calculatedValue = calculateDerivedValue(field, watchedValues, formSchema.fields);
      const currentValue = (watchedValues as Record<string, unknown> | undefined)?.[field.id];
      const valuesDiffer = JSON.stringify(currentValue) !== JSON.stringify(calculatedValue);
      if (valuesDiffer) {
        setValue(field.id, calculatedValue, {
          shouldDirty: false,
          shouldValidate: false,
          shouldTouch: false,
        });
      }
    });
  }, [watchedValues, formSchema.fields, setValue]);

  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const commonProps = {
      fullWidth: true,
      margin: 'normal' as const,
      error: !!error,
      helperText: showErrors && error?.message,
    };

    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <TextField
                {...fieldProps}
                {...commonProps}
                label={field.label}
                value={value || ''}
                onChange={onChange}
                disabled={field.isDerived}
                InputProps={{
                  readOnly: field.isDerived,
                }}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <TextField
                {...fieldProps}
                {...commonProps}
                label={field.label}
                type="number"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={field.isDerived}
                InputProps={{
                  readOnly: field.isDerived,
                }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <TextField
                {...fieldProps}
                {...commonProps}
                label={field.label}
                multiline
                rows={4}
                value={value || ''}
                onChange={onChange}
                disabled={field.isDerived}
                InputProps={{
                  readOnly: field.isDerived,
                }}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <TextField
                {...fieldProps}
                {...commonProps}
                label={field.label}
                type="date"
                value={value || ''}
                onChange={onChange}
                disabled={field.isDerived}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: field.isDerived,
                }}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormControl {...commonProps}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  {...fieldProps}
                  value={value || ''}
                  onChange={onChange}
                  disabled={field.isDerived}
                >
                  {(field.options || []).map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {showErrors && error?.message && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormControl component="fieldset" {...commonProps}>
                <FormLabel component="legend">{field.label}</FormLabel>
                <RadioGroup
                  {...fieldProps}
                  value={value || ''}
                  onChange={onChange}
                >
                  {(field.options || []).map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option.value}
                      control={<Radio disabled={field.isDerived} />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
                {showErrors && error?.message && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={field.defaultValue || []}
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormControl component="fieldset" {...commonProps}>
                <FormLabel component="legend">{field.label}</FormLabel>
                <FormGroup>
                  {(field.options || []).map((option, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          {...fieldProps}
                          checked={Array.isArray(value) ? (value as string[]).includes(option.value) : false}
                          onChange={(e) => {
                            const currentArray = Array.isArray(value) ? (value as string[]) : [];
                            if (e.target.checked) {
                              onChange([...currentArray, option.value]);
                            } else {
                              onChange(currentArray.filter((v) => v !== option.value));
                            }
                          }}
                          disabled={field.isDerived}
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </FormGroup>
                {showErrors && error?.message && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit || (() => {}))}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {formSchema.name}
      </Typography>

      {formSchema.fields.length === 0 && (
        <Alert severity="info">
          This form has no fields configured yet.
        </Alert>
      )}

      {formSchema.fields
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <Box key={field.id} sx={{ mb: 2 }}>
            {field.isDerived && (
              <Alert severity="info" sx={{ mb: 1, fontSize: '0.875rem' }}>
                This is a derived field - its value is calculated automatically
              </Alert>
            )}
            {renderField(field)}
          </Box>
        ))}
    </Box>
  );
}