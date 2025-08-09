/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { FormField, ValidationRule } from '../types/form';

export function createValidationSchema(fields: FormField[]) {
  const schema: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    // Base schema based on field type
    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string();
        break;
      case 'number':
        fieldSchema = z.number().or(z.string().transform((val, ctx) => {
          const parsed = parseFloat(val);
          if (isNaN(parsed)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Not a valid number",
            });
            return z.NEVER;
          }
          return parsed;
        }));
        break;
      case 'date':
        fieldSchema = z.string().or(z.date());
        break;
      case 'select':
      case 'radio':
        fieldSchema = z.string();
        break;
      case 'checkbox':
        fieldSchema = z.array(z.string()).or(z.boolean());
        break;
      default:
        fieldSchema = z.string();
    }

    // Apply validation rules
    field.validationRules.forEach((rule) => {
      fieldSchema = applyValidationRule(fieldSchema, rule);
    });

    // Handle required fields
    if (!field.required && !field.isDerived) {
      fieldSchema = fieldSchema.optional();
    }

    schema[field.id] = fieldSchema;
  });

  return z.object(schema);
}

function applyValidationRule(schema: z.ZodTypeAny, rule: ValidationRule): z.ZodTypeAny {
  switch (rule.type) {
    case 'required':
      // Already handled in createValidationSchema
      return schema;
      
    case 'minLength':
      if (schema instanceof z.ZodString) {
        return schema.min(rule.value as number, rule.message);
      }
      return schema;
      
    case 'maxLength':
      if (schema instanceof z.ZodString) {
        return schema.max(rule.value as number, rule.message);
      }
      return schema;
      
    case 'email':
      if (schema instanceof z.ZodString) {
        return schema.email(rule.message || 'Invalid email format');
      }
      return schema;
      
    case 'password':
      if (schema instanceof z.ZodString) {
        return schema.regex(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
          rule.message || 'Password must be at least 8 characters and contain a number'
        );
      }
      return schema;
      
    case 'min':
      if (schema instanceof z.ZodNumber) {
        return schema.min(rule.value as number, rule.message);
      }
      return schema;
      
    case 'max':
      if (schema instanceof z.ZodNumber) {
        return schema.max(rule.value as number, rule.message);
      }
      return schema;
      
    default:
      return schema;
  }
}

export function calculateDerivedValue(
field: FormField, formData: Record<string, any>, fields: FormField[]): any {
  if (!field.isDerived || !field.derivedConfig) return undefined;

  const { parentFields, logic, formula } = field.derivedConfig;
  
  try {
    switch (logic) {
      case 'age':
        { const birthDateField = parentFields[0];
        const birthDate = formData[birthDateField];
        if (!birthDate) return '';
        
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        return age.toString(); }
        
      case 'sum':
        return parentFields.reduce((sum, fieldId) => {
          const value = parseFloat(formData[fieldId] || '0');
          return sum + (isNaN(value) ? 0 : value);
        }, 0).toString();
        
      case 'concat':
        return parentFields.map(fieldId => formData[fieldId] || '').join(' ');
        
      case 'custom':
        // Simple formula evaluation - replace ${fieldId} with actual values
        { let expression = formula;
        parentFields.forEach(fieldId => {
          const value = formData[fieldId] || '';
          expression = expression.replace(new RegExp(`\\$\\{${fieldId}\\}`, 'g'), value);
        });
        
        // For safety, only allow basic arithmetic
        if (/^[\d\s+\-*/().]+$/.test(expression)) {
          try {
            return eval(expression).toString();
          } catch {
            return 'Error in calculation';
          }
        }
        
        return expression; }
        
      default:
        return '';
    }
  } catch (error) {
    console.error('Error calculating derived value:', error);
    return 'Calculation Error';
  }
}