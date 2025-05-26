import React, { useState, useEffect } from 'react';
import { CalendarRange, Filter, FileDown, Download, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DatePicker from '../../components/ui/DatePicker';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency, formatDate } from '../../lib/formatters';

const Ledger: React.FC = () => {
  const { 
    transactions, 
    filteredTransactions,
    loading, 
    fetchTransactions, 
    totalDebit,
    totalCredit,
    balance,
    exportToExcel,
    exportToPdf,
    applyFilters
  } = useTransactions();
  
  const { 
    mainAccounts, 
    subAccounts, 
    loadingMainAccounts, 
    loadingSubAccounts,
    fetchMainAccounts,
    fetchSubAccounts
  } = useAccounts();
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedMainAccount, setSelectedMainAccount] = useState<string | null>(null);
  const [selectedSubAccount, setSelectedSubAccount] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState<string>('none');
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Available sub accounts based on selected main account
  const availableSubAccounts = selectedMainAccount
    ? subAccounts.filter(sa => sa.main_account_id === selectedMainAccount)
    : subAccounts;

  // Initialize data
  useEffect(() => {
    fetchTransactions();
    fetchMainAccounts();
    fetchSubAccounts();
  }, []);

  // Prepare account options for select
  const mainAccountOptions = [
    { value: null, label: 'All Main Accounts' },
    ...mainAccounts.map(account => ({
      value: account.id,
      label: account.name,
    })),
  ];
  
  const subAccountOptions = [
    { value: null, label: 'All Sub Accounts' },
    ...availableSubAccounts.map(account => ({
      value: account.id,
      label: account.name,
    })),
  ];
  
  const summaryOptions = [
    { value: 'none', label: 'No Summary (Show All Transactions)' },
    { value: 'monthly', label: 'Monthly Summary' },
    { value: 'yearly', label: 'Yearly Summary' },
  ];

  // Handle filter changes
  const handleMainAccountChange = (selected: any) => {
    const value = selected?.value || null;
    setSelectedMainAccount(value);
    setSelectedSubAccount(null); // Reset sub account when main account changes
  };
  
  const handleSubAccountChange = (selected: any) => {
    setSelectedSubAccount(selected?.value || null);
  };
  
  const handleSummaryTypeChange = (selected: any) => {
    setSummaryType(selected?.value || 'none');
  };

  // Apply filters
  const handleApplyFilters = () => {
    applyFilters({
      startDate: startDate,
      endDate: endDate,
      mainAccountId: selectedMainAccount || undefined,
      subAccountId: selectedSubAccount || undefined,
      summaryType: summaryType as any || 'none',
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedMainAccount(null);
    setSelectedSubAccount(null);
    setSummaryType('none');
    
    // Apply cleared filters
    applyFilters({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Credit"
          className="border-l-4 border-success-500"
        >
          <div className="text-2xl font-bold text-success-700">
            {formatCurrency(totalCredit)}
          </div>
        </Card>
        
        <Card
          title="Total Debit"
          className="border-l-4 border-error-500"
        >
          <div className="text-2xl font-bold text-error-700">
            {formatCurrency(totalDebit)}
          </div>
        </Card>
        
        <Card
          title="Current Balance"
          className={`border-l-4 ${balance >= 0 ? 'border-success-500' : 'border-error-500'}`}
        >
          <div className="text-2xl font-bold">
            {formatCurrency(balance)}
          </div>
        </Card>
      </div>
      
      {/* Filter toggle and export buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          icon={<Filter className="h-5 w-5" />}
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          {filtersVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<FileText className="h-5 w-5" />}
            onClick={exportToPdf}
          >
            Export to PDF
          </Button>
          
          <Button
            variant="outline"
            icon={<FileDown className="h-5 w-5" />}
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {filtersVisible && (
        <Card title="Filter Transactions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarRange className="h-5 w-5 text-neutral-500" />
                <h3 className="text-sm font-medium text-neutral-700">Date Range</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  placeholderText="Start Date"
                  maxDate={endDate || undefined}
                />
                
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  placeholderText="End Date"
                  minDate={startDate || undefined}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-neutral-500" />
                <h3 className="text-sm font-medium text-neutral-700">Account Filters</h3>
              </div>
              
              <Select
                options={mainAccountOptions}
                value={mainAccountOptions.find(option => option.value === selectedMainAccount)}
                onChange={handleMainAccountChange}
                placeholder="Select Main Account"
              />
              
              <Select
                options={subAccountOptions}
                value={subAccountOptions.find(option => option.value === selectedSubAccount)}
                onChange={handleSubAccountChange}
                placeholder="Select Sub Account"
                isDisabled={!selectedMainAccount}
              />
            </div>
            
            <div className="md:col-span-2">
              <Select
                options={summaryOptions}
                value={summaryOptions.find(option => option.value === summaryType)}
                onChange={handleSummaryTypeChange}
                placeholder="Select Summary Type"
                label="Summary Options"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
            
            <Button
              variant="primary"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      )}
      
      {/* Transactions table */}
      <Card title="Ledger Entries">
        <Table
          data={filteredTransactions}
          columns={[
            {
              header: 'Date',
              accessor: (transaction) => formatDate(transaction.date),
            },
            {
              header: 'Main Account',
              accessor: (transaction) => transaction.main_account.name,
            },
            {
              header: 'Sub Account',
              accessor: (transaction) => transaction.sub_account.name,
            },
            {
              header: 'Description',
              accessor: 'description',
            },
            {
              header: 'Debit',
              accessor: (transaction) => 
                transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-',
              className: 'text-right',
            },
            {
              header: 'Credit',
              accessor: (transaction) => 
                transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-',
              className: 'text-right',
            },
          ]}
          keyExtractor={(transaction) => transaction.id}
          isLoading={loading}
          emptyMessage="No transactions found matching the filters"
        />
      </Card>
    </div>
  );
};

export default Ledger;