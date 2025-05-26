import React from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';

interface SelectProps extends ReactSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  className = '',
  isDisabled,
  ...props
}) => {
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: error ? '#EF4444' : state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? (error ? '0 0 0 1px #EF4444' : '0 0 0 1px #3B82F6') : 'none',
      '&:hover': {
        borderColor: error ? '#EF4444' : state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
      backgroundColor: isDisabled ? '#F3F4F6' : '#FFFFFF',
      padding: '2px',
      borderRadius: '0.375rem',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#2563EB' 
        : state.isFocused 
          ? '#DBEAFE' 
          : base.backgroundColor,
      color: state.isSelected ? '#FFFFFF' : '#111827',
      ':active': {
        backgroundColor: state.isSelected ? '#2563EB' : '#DBEAFE',
      },
      padding: '8px 16px',
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E5E7EB',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#DBEAFE',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#1E40AF',
      fontWeight: 500,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: '#1E40AF',
      ':hover': {
        backgroundColor: '#93C5FD',
        color: '#1E3A8A',
      },
    }),
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <ReactSelect
        styles={customStyles}
        className="text-sm"
        isDisabled={isDisabled}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;