import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  placeholderText?: string;
  disabled?: boolean;
  isClearable?: boolean;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  label,
  error,
  helperText,
  className = '',
  placeholderText = 'Select date',
  disabled = false,
  isClearable = true,
  showTimeSelect = false,
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
}) => {
  const inputClasses = [
    'border rounded-md shadow-sm focus:outline-none focus:ring-1 px-3 py-2 w-full pr-10',
    error 
      ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
      : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
    disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white',
  ].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          className={inputClasses}
          placeholderText={placeholderText}
          disabled={disabled}
          isClearable={isClearable}
          showTimeSelect={showTimeSelect}
          dateFormat={dateFormat}
          minDate={minDate}
          maxDate={maxDate}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
          <CalendarIcon className="h-5 w-5" />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default DatePicker;