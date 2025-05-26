import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, TransactionWithDetails, TransactionFilters } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface UseTransactionsReturn {
  transactions: TransactionWithDetails[];
  filteredTransactions: TransactionWithDetails[];
  loading: boolean;
  error: string | null;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  applyFilters: (filters: TransactionFilters) => void;
  exportToExcel: () => Promise<void>;
  exportToPdf: () => Promise<void>;
  undoTransaction: (id: string) => Promise<boolean>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [balance, setBalance] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({});

  // Calculate totals from transactions
  const calculateTotals = (transactionList: TransactionWithDetails[]) => {
    let debitTotal = 0;
    let creditTotal = 0;
    
    transactionList.forEach(transaction => {
      if (transaction.type === 'debit') {
        debitTotal += transaction.amount;
      } else {
        creditTotal += transaction.amount;
      }
    });
    
    setTotalDebit(debitTotal);
    setTotalCredit(creditTotal);
    setBalance(creditTotal - debitTotal);
  };

  // Fetch transactions with optional filters
  const fetchTransactions = async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          main_account:main_accounts(*),
          sub_account:sub_accounts(*)
        `)
        .order('date', { ascending: false });
      
      // Apply filters
      if (filters) {
        if (filters.startDate) {
          query = query.gte('date', format(filters.startDate, 'yyyy-MM-dd'));
        }
        
        if (filters.endDate) {
          query = query.lte('date', format(filters.endDate, 'yyyy-MM-dd'));
        }
        
        if (filters.mainAccountId) {
          query = query.eq('main_account_id', filters.mainAccountId);
        }
        
        if (filters.subAccountId) {
          query = query.eq('sub_account_id', filters.subAccountId);
        }
        
        setCurrentFilters(filters);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Type cast and format data
      const formattedData = data.map(item => ({
        ...item,
        main_account: item.main_account,
        sub_account: item.sub_account,
      })) as TransactionWithDetails[];
      
      setTransactions(formattedData);
      setFilteredTransactions(formattedData);
      calculateTotals(formattedData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Create a new transaction
  const createTransaction = async (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Refresh transactions to include the new one with relation data
      await fetchTransactions(currentFilters);
      
      toast.success('Transaction created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(`Failed to create transaction: ${error.message}`);
      return null;
    }
  };

  // Update a transaction
  const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh transactions to show updated data
      await fetchTransactions(currentFilters);
      
      toast.success('Transaction updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error(`Failed to update transaction: ${error.message}`);
      return false;
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      // First, archive the transaction in the deleted_transactions table
      const transactionToDelete = transactions.find(t => t.id === id);
      
      if (!transactionToDelete) {
        throw new Error('Transaction not found');
      }
      
      // Insert into deleted_transactions table
      const { error: archiveError } = await supabase
        .from('deleted_transactions')
        .insert([{
          original_id: id,
          transaction_data: transactionToDelete,
          deleted_at: new Date().toISOString(),
        }]);
      
      if (archiveError) {
        throw archiveError;
      }
      
      // Now delete from main transactions table
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh transactions
      await fetchTransactions(currentFilters);
      
      toast.success('Transaction deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(`Failed to delete transaction: ${error.message}`);
      return false;
    }
  };

  // Undo a deleted transaction
  const undoTransaction = async (id: string): Promise<boolean> => {
    try {
      // Get the deleted transaction from history
      const { data: deletedData, error: fetchError } = await supabase
        .from('deleted_transactions')
        .select('transaction_data')
        .eq('original_id', id)
        .order('deleted_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!deletedData) {
        throw new Error('Deleted transaction not found');
      }
      
      // Restore the transaction
      const { transaction_data } = deletedData;
      
      // Remove the id so a new one is generated
      const { id: _, ...transactionToRestore } = transaction_data;
      
      // Insert back into transactions
      const { error: restoreError } = await supabase
        .from('transactions')
        .insert([transactionToRestore]);
      
      if (restoreError) {
        throw restoreError;
      }
      
      // Remove from deleted_transactions
      const { error: cleanupError } = await supabase
        .from('deleted_transactions')
        .delete()
        .eq('original_id', id);
      
      if (cleanupError) {
        console.warn('Could not clean up deleted transaction record:', cleanupError);
      }
      
      // Refresh transactions
      await fetchTransactions(currentFilters);
      
      toast.success('Transaction restored successfully');
      return true;
    } catch (error: any) {
      console.error('Error restoring transaction:', error);
      toast.error(`Failed to restore transaction: ${error.message}`);
      return false;
    }
  };

  // Apply filters to current transactions
  const applyFilters = (filters: TransactionFilters) => {
    setCurrentFilters(filters);
    fetchTransactions(filters);
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      // This would typically use the XLSX library to generate an Excel file
      // For now, this is a placeholder
      toast.success('Excel export feature will be implemented');
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Export to PDF
  const exportToPdf = async () => {
    try {
      // This would typically use jsPDF to generate a PDF file
      // For now, this is a placeholder
      toast.success('PDF export feature will be implemented');
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    totalDebit,
    totalCredit,
    balance,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    applyFilters,
    exportToExcel,
    exportToPdf,
    undoTransaction,
  };
};