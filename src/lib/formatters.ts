import { format, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'dd MMM yyyy');
};

// Format currency values
export const formatCurrency = (amount: number, currency = '₹'): string => {
  return `${currency} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format percentage values
export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format account name (capitalize first letter of each word)
export const formatAccountName = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Format transaction type for display
export const formatTransactionType = (type: 'credit' | 'debit'): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};