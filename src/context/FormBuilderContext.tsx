import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { FormSchema, FormField, FormBuilderState } from '../types/form';

type FormBuilderAction =
  | { type: 'SET_CURRENT_FORM'; payload: FormSchema }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { id: string; field: Partial<FormField> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: FormField[] }
  | { type: 'SAVE_FORM'; payload: { name: string } }
  | { type: 'LOAD_FORMS' }
  | { type: 'SELECT_FORM'; payload: string }
  | { type: 'NEW_FORM' };

const FormBuilderContext = createContext<{
  state: FormBuilderState;
  dispatch: React.Dispatch<FormBuilderAction>;
} | null>(null);

const initialState: FormBuilderState = {
  currentForm: null,
  savedForms: [],
};

function formBuilderReducer(state: FormBuilderState, action: FormBuilderAction): FormBuilderState {
  switch (action.type) {
    case 'SET_CURRENT_FORM':
      return {
        ...state,
        currentForm: action.payload,
      };

    case 'ADD_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: [...state.currentForm.fields, action.payload],
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, ...action.payload.field }
              : field
          ),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'DELETE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.filter(field => field.id !== action.payload),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'REORDER_FIELDS':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: action.payload.map((field, index) => ({ ...field, order: index })),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SAVE_FORM':
      { if (!state.currentForm) return state;
      const formToSave = {
        ...state.currentForm,
        name: action.payload.name,
        updatedAt: new Date().toISOString(),
      };
      
      const existingIndex = state.savedForms.findIndex(form => form.id === formToSave.id);
      const updatedSavedForms = existingIndex >= 0
        ? state.savedForms.map((form, index) => index === existingIndex ? formToSave : form)
        : [...state.savedForms, formToSave];

      // Save to localStorage
      localStorage.setItem('formBuilderForms', JSON.stringify(updatedSavedForms));

      return {
        ...state,
        currentForm: formToSave,
        savedForms: updatedSavedForms,
      }; }

    case 'LOAD_FORMS':
      { const savedFormsData = localStorage.getItem('formBuilderForms');
      const savedForms = savedFormsData ? JSON.parse(savedFormsData) : [];
      return {
        ...state,
        savedForms,
      }; }

    case 'SELECT_FORM':
      { const selectedForm = state.savedForms.find(form => form.id === action.payload);
      return {
        ...state,
        currentForm: selectedForm || null,
      }; }

    case 'NEW_FORM':
      { const newForm: FormSchema = {
        id: crypto.randomUUID(),
        name: '',
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentForm: newForm,
      }; }

    default:
      return state;
  }
}

export function FormBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'LOAD_FORMS' });
  }, []);

  return (
    <FormBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}