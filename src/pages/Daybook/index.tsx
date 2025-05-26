import React, { useState, useEffect } from 'react';
import { Plus, Search, FileDown, Trash2, Edit, RotateCcw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import DatePicker from '../../components/ui/DatePicker';
import Select from '../../components/ui/Select';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useAuth } from '../../hooks/useAuth';
import TransactionForm from './TransactionForm';

const Daybook: React.FC = () => {
  const { user } = useAuth();
  const { 
    transactions, 
    loading, 
    fetchTransactions, 
    deleteTransaction,
    undoTransaction,
    totalDebit,
    totalCredit,
    balance
  } = useTransactions();
  
  const { 
    mainAccounts, 
    subAccounts, 
    loadingMainAccounts, 
    loadingSubAccounts,
    fetchMainAccounts,
    fetchSubAccounts
  } = useAccounts();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [runningBalance, setRunningBalance] = useState<Record<string, number>>({});

  // Initial data loading
  useEffect(() => {
    fetchTransactions();
    fetchMainAccounts();
    fetchSubAccounts();
  }, []);

  // Filter transactions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = transactions.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.sub_account.name.toLowerCase().includes(query) ||
          transaction.main_account.name.toLowerCase().includes(query)
      );
      setFilteredTransactions(filtered);
    }
  }, [transactions, searchQuery]);

  // Calculate running balance
  useEffect(() => {
    const balances: Record<string, number> = {};
    let currentBalance = 0;
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedTransactions.forEach(transaction => {
      const amount = transaction.amount;
      if (transaction.type === 'credit') {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }
      balances[transaction.id] = currentBalance;
    });
    
    setRunningBalance(balances);
  }, [filteredTransactions]);

  // Only admin can access daybook
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-error-600 text-xl font-semibold mb-2">Access Denied</div>
        <p className="text-neutral-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleUndo = async (id: string) => {
    await undoTransaction(id);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
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
      
      {/* Action buttons and search */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => setIsFormOpen(true)}
        >
          Add New Transaction
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-5 w-5" />}
            className="min-w-[250px]"
          />
          
          <Button
            variant="outline"
            icon={<FileDown className="h-5 w-5" />}
            onClick={() => alert('Export feature will be implemented')}
          >
            Export
          </Button>
        </div>
      </div>
      
      {/* Transaction form dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
              
              <TransactionForm
                transaction={editingTransaction}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                mainAccounts={mainAccounts}
                subAccounts={subAccounts}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Transactions table */}
      <Card title="Transaction Records">
        <Table
          data={filteredTransactions}
          columns={[
            {
              header: 'Date',
              accessor: (transaction) => formatDate(transaction.date),
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
            {
              header: 'Balance',
              accessor: (transaction) => formatCurrency(runningBalance[transaction.id] || 0),
              className: 'text-right font-medium',
            },
            {
              header: 'Actions',
              accessor: (transaction) => (
                <div className="flex space-x-2 justify-end">
                  <button 
                    onClick={() => handleEdit(transaction)}
                    className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(transaction.id)}
                    className="p-1 text-error-600 hover:text-error-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleUndo(transaction.id)}
                    className="p-1 text-secondary-600 hover:text-secondary-800 transition-colors"
                    title="Undo"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(transaction) => transaction.id}
          isLoading={loading}
          emptyMessage="No transactions found"
        />
      </Card>
    </div>
  );
};

export default Daybook;