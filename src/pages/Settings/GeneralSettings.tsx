import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Settings {
  id: string;
  company_name: string;
  currency: string;
  fiscal_year_start: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [fiscalYearStart, setFiscalYearStart] = useState<Date | null>(new Date(new Date().getFullYear(), 3, 1)); // April 1st
  const [theme, setTheme] = useState('light');

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data) {
        setSettings(data);
        setCompanyName(data.company_name);
        setCurrency(data.currency);
        setFiscalYearStart(data.fiscal_year_start ? new Date(data.fiscal_year_start) : null);
        setTheme(data.theme);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settingsData = {
        company_name: companyName,
        currency,
        fiscal_year_start: fiscalYearStart ? fiscalYearStart.toISOString().split('T')[0] : null,
        theme,
        updated_at: new Date().toISOString(),
      };
      
      if (settings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', settings.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert([{
            ...settingsData,
            created_at: new Date().toISOString(),
          }]);
        
        if (error) {
          throw error;
        }
      }
      
      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.message);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchSettings();
  }, []);

  const currencyOptions = [
    { value: 'Rs', label: 'Srilankan Rupee (Rs)' },
    { value: '₹', label: 'Indian Rupee (₹)' },
    { value: '$', label: 'US Dollar ($)' },
    { value: '€', label: 'Euro (€)' },
    { value: '£', label: 'British Pound (£)' },
  ];
  
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
        <div className="h-10 bg-neutral-200 rounded"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-10 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name"
          />
          
          <Select
            label="Currency"
            options={currencyOptions}
            value={currencyOptions.find(option => option.value === currency)}
            onChange={(selected) => setCurrency(selected?.value || '₹')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker
            label="Fiscal Year Start Date"
            selected={fiscalYearStart}
            onChange={setFiscalYearStart}
            dateFormat="MMMM d"
            showMonthYearPicker={false}
            showFullMonthYearPicker={false}
            showYearDropdown={false}
            showMonthDropdown={false}
          />
          
          <Select
            label="Theme"
            options={themeOptions}
            value={themeOptions.find(option => option.value === theme)}
            onChange={(selected) => setTheme(selected?.value || 'light')}
          />
        </div>
        
        <div className="border-t border-neutral-200 pt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;