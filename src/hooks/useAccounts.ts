import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MainAccount, SubAccount } from '../types';
import toast from 'react-hot-toast';

interface UseAccountsReturn {
  mainAccounts: MainAccount[];
  subAccounts: SubAccount[];
  loadingMainAccounts: boolean;
  loadingSubAccounts: boolean;
  errorMainAccounts: string | null;
  errorSubAccounts: string | null;
  fetchMainAccounts: () => Promise<void>;
  fetchSubAccounts: (mainAccountId?: string) => Promise<void>;
  createMainAccount: (name: string, description?: string) => Promise<MainAccount | null>;
  createSubAccount: (name: string, mainAccountId: string, description?: string) => Promise<SubAccount | null>;
  updateMainAccount: (id: string, data: Partial<MainAccount>) => Promise<boolean>;
  updateSubAccount: (id: string, data: Partial<SubAccount>) => Promise<boolean>;
  deleteMainAccount: (id: string) => Promise<boolean>;
  deleteSubAccount: (id: string) => Promise<boolean>;
  getMainAccountById: (id: string) => MainAccount | undefined;
  getSubAccountById: (id: string) => SubAccount | undefined;
}

export const useAccounts = (): UseAccountsReturn => {
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [loadingMainAccounts, setLoadingMainAccounts] = useState(true);
  const [loadingSubAccounts, setLoadingSubAccounts] = useState(true);
  const [errorMainAccounts, setErrorMainAccounts] = useState<string | null>(null);
  const [errorSubAccounts, setErrorSubAccounts] = useState<string | null>(null);

  // Fetch main accounts
  const fetchMainAccounts = async () => {
    try {
      setLoadingMainAccounts(true);
      setErrorMainAccounts(null);
      
      const { data, error } = await supabase
        .from('main_accounts')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setMainAccounts(data);
    } catch (error: any) {
      console.error('Error fetching main accounts:', error);
      setErrorMainAccounts(error.message);
      toast.error('Failed to load main accounts');
    } finally {
      setLoadingMainAccounts(false);
    }
  };

  // Fetch sub accounts, optionally filtered by main account
  const fetchSubAccounts = async (mainAccountId?: string) => {
    try {
      setLoadingSubAccounts(true);
      setErrorSubAccounts(null);
      
      let query = supabase
        .from('sub_accounts')
        .select('*')
        .order('name');
      
      if (mainAccountId) {
        query = query.eq('main_account_id', mainAccountId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setSubAccounts(data);
    } catch (error: any) {
      console.error('Error fetching sub accounts:', error);
      setErrorSubAccounts(error.message);
      toast.error('Failed to load sub accounts');
    } finally {
      setLoadingSubAccounts(false);
    }
  };

  // Create a new main account
  const createMainAccount = async (name: string, description?: string): Promise<MainAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('main_accounts')
        .insert([
          { name, description }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setMainAccounts(prev => [...prev, data]);
      toast.success('Main account created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating main account:', error);
      toast.error(`Failed to create main account: ${error.message}`);
      return null;
    }
  };

  // Create a new sub account
  const createSubAccount = async (
    name: string, 
    mainAccountId: string, 
    description?: string
  ): Promise<SubAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('sub_accounts')
        .insert([
          { name, main_account_id: mainAccountId, description }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setSubAccounts(prev => [...prev, data]);
      toast.success('Sub account created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating sub account:', error);
      toast.error(`Failed to create sub account: ${error.message}`);
      return null;
    }
  };

  // Update a main account
  const updateMainAccount = async (id: string, data: Partial<MainAccount>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('main_accounts')
        .update(data)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setMainAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, ...data } : account
      ));
      
      toast.success('Main account updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating main account:', error);
      toast.error(`Failed to update main account: ${error.message}`);
      return false;
    }
  };

  // Update a sub account
  const updateSubAccount = async (id: string, data: Partial<SubAccount>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sub_accounts')
        .update(data)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setSubAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, ...data } : account
      ));
      
      toast.success('Sub account updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating sub account:', error);
      toast.error(`Failed to update sub account: ${error.message}`);
      return false;
    }
  };

  // Delete a main account
  const deleteMainAccount = async (id: string): Promise<boolean> => {
    try {
      // Check if there are any sub accounts
      const { data: subAccountsData, error: subAccountsError } = await supabase
        .from('sub_accounts')
        .select('id')
        .eq('main_account_id', id);
      
      if (subAccountsError) {
        throw subAccountsError;
      }
      
      if (subAccountsData.length > 0) {
        toast.error('Cannot delete main account with associated sub accounts');
        return false;
      }
      
      // Check if there are any transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('main_account_id', id);
      
      if (transactionsError) {
        throw transactionsError;
      }
      
      if (transactionsData.length > 0) {
        toast.error('Cannot delete main account with associated transactions');
        return false;
      }
      
      // Delete the main account
      const { error } = await supabase
        .from('main_accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setMainAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Main account deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting main account:', error);
      toast.error(`Failed to delete main account: ${error.message}`);
      return false;
    }
  };

  // Delete a sub account
  const deleteSubAccount = async (id: string): Promise<boolean> => {
    try {
      // Check if there are any transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('sub_account_id', id);
      
      if (transactionsError) {
        throw transactionsError;
      }
      
      if (transactionsData.length > 0) {
        toast.error('Cannot delete sub account with associated transactions');
        return false;
      }
      
      // Delete the sub account
      const { error } = await supabase
        .from('sub_accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setSubAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Sub account deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting sub account:', error);
      toast.error(`Failed to delete sub account: ${error.message}`);
      return false;
    }
  };

  // Helper to get main account by ID
  const getMainAccountById = (id: string): MainAccount | undefined => {
    return mainAccounts.find(account => account.id === id);
  };

  // Helper to get sub account by ID
  const getSubAccountById = (id: string): SubAccount | undefined => {
    return subAccounts.find(account => account.id === id);
  };

  // Load accounts on initial mount
  useEffect(() => {
    fetchMainAccounts();
    fetchSubAccounts();
  }, []);

  return {
    mainAccounts,
    subAccounts,
    loadingMainAccounts,
    loadingSubAccounts,
    errorMainAccounts,
    errorSubAccounts,
    fetchMainAccounts,
    fetchSubAccounts,
    createMainAccount,
    createSubAccount,
    updateMainAccount,
    updateSubAccount,
    deleteMainAccount,
    deleteSubAccount,
    getMainAccountById,
    getSubAccountById,
  };
};