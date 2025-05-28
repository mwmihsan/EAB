// Currency configuration and utilities
export interface CurrencyConfig {
    symbol: string;
    code: string;
    name: string;
    position: 'before' | 'after';
    decimalPlaces: number;
  }
  
  // Available currencies
  export const CURRENCIES: Record<string, CurrencyConfig> = {
    USD: {
      symbol: '$',
      code: 'USD',
      name: 'US Dollar',
      position: 'before',
      decimalPlaces: 2,
    },
    LKR: {
      symbol: 'Rs',
      code: 'LKR',
      name: 'Sri Lankan Rupee',
      position: 'before',
      decimalPlaces: 2,
    },
    EUR: {
      symbol: '€',
      code: 'EUR',
      name: 'Euro',
      position: 'before',
      decimalPlaces: 2,
    },
    GBP: {
      symbol: '£',
      code: 'GBP',
      name: 'British Pound',
      position: 'before',
      decimalPlaces: 2,
    },
    INR: {
      symbol: '₹',
      code: 'INR',
      name: 'Indian Rupee',
      position: 'before',
      decimalPlaces: 2,
    },
  };
  
  // Default currency (can be changed based on user preference)
  export const DEFAULT_CURRENCY = 'LKR';
  
  // Get current currency from localStorage or use default
  export const getCurrentCurrency = (): CurrencyConfig => {
    try {
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        return CURRENCIES[savedCurrency];
      }
    } catch (error) {
      console.warn('Failed to get currency from localStorage:', error);
    }
    return CURRENCIES[DEFAULT_CURRENCY];
  };
  
  // Save currency preference
  export const setCurrency = (currencyCode: string): boolean => {
    try {
      if (CURRENCIES[currencyCode]) {
        localStorage.setItem('currency', currencyCode);
        return true;
      }
    } catch (error) {
      console.warn('Failed to save currency to localStorage:', error);
    }
    return false;
  };
  
  // Format currency value
  export const formatCurrency = (
    amount: number,
    currency?: CurrencyConfig,
    options?: {
      showCode?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ): string => {
    const config = currency || getCurrentCurrency();
    const { showCode = false, minimumFractionDigits, maximumFractionDigits } = options || {};
  
    // Handle invalid amounts
    if (isNaN(amount) || !isFinite(amount)) {
      return `${config.symbol}0.00`;
    }
  
    // Format the number with appropriate decimal places
    const formattedAmount = amount.toFixed(
      maximumFractionDigits ?? minimumFractionDigits ?? config.decimalPlaces
    );
  
    // Add thousand separators
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalAmount = parts.join('.');
  
    // Position the symbol
    const currencyDisplay = showCode ? `${config.symbol} ${config.code}` : config.symbol;
    
    if (config.position === 'before') {
      return `${currencyDisplay} ${finalAmount}`;
    } else {
      return `${finalAmount} ${currencyDisplay}`;
    }
  };
  
  // Parse currency string to number
  export const parseCurrency = (currencyString: string): number => {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanString = currencyString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  // Currency input formatter for form inputs
  export const formatCurrencyInput = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseCurrency(value) : value;
    return formatCurrency(numValue);
  };
  
  // Validate currency amount
  export const isValidCurrencyAmount = (amount: number): boolean => {
    return !isNaN(amount) && isFinite(amount) && amount >= 0;
  };
  
  // Currency conversion utilities (for future use)
  export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    lastUpdated: Date;
  }
  
  // Placeholder for currency conversion
  export const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: ExchangeRate[]
  ): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = exchangeRates.find(
      r => r.from === fromCurrency && r.to === toCurrency
    );
    
    if (rate) {
      return amount * rate.rate;
    }
    
    // If direct rate not found, try reverse conversion
    const reverseRate = exchangeRates.find(
      r => r.from === toCurrency && r.to === fromCurrency
    );
    
    if (reverseRate) {
      return amount / reverseRate.rate;
    }
    
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount; // Return original amount if no rate found
  };
  
  // React hook for currency management
  import { useState, useEffect } from 'react';
  
  export const useCurrency = () => {
    const [currency, setCurrencyState] = useState<CurrencyConfig>(getCurrentCurrency());
  
    useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'currency' && e.newValue) {
          const newCurrency = CURRENCIES[e.newValue];
          if (newCurrency) {
            setCurrencyState(newCurrency);
          }
        }
      };
  
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
  
    const updateCurrency = (currencyCode: string): boolean => {
      const success = setCurrency(currencyCode);
      if (success) {
        setCurrencyState(CURRENCIES[currencyCode]);
      }
      return success;
    };
  
    return {
      currency,
      updateCurrency,
      formatCurrency: (amount: number, options?: any) => formatCurrency(amount, currency, options),
      parseCurrency,
      isValidAmount: isValidCurrencyAmount,
      availableCurrencies: CURRENCIES,
    };
  };