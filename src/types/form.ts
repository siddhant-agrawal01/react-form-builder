export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password' | 'min' | 'max';
  value?: string | number;
  message?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DerivedFieldConfig {
  parentFields: string[];
  formula: string;
  logic: 'age' | 'sum' | 'concat' | 'custom';
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  validationRules: ValidationRule[];
  options?: SelectOption[]; // for select, radio, checkbox
  isDerived?: boolean;
  derivedConfig?: DerivedFieldConfig;
  order: number;
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormBuilderState {
  currentForm: FormSchema | null;
  savedForms: FormSchema[];
}