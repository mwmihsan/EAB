import React, { useState, useEffect } from 'react';
import DatePicker from '../../components/ui/DatePicker';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { useAuth } from '../../hooks/useAuth';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  transaction?: any;
  onClose: () => void;
  onSuccess: () => void;
  mainAccounts: any[];
  subAccounts: any[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
  onSuccess,
  mainAccounts,
  subAccounts,
}) => {
  const { user } = useAuth();
  const { createTransaction, updateTransaction } = useTransactions();
  const { createMainAccount, createSubAccount, fetchSubAccounts } = useAccounts();
  
  const [date, setDate] = useState<Date | null>(transaction ? new Date(transaction.date) : new Date());
  const [mainAccountId, setMainAccountId] = useState<string>(transaction?.main_account_id || '');
  const [subAccountId, setSubAccountId] = useState<string>(transaction?.sub_account_id || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount ? transaction.amount.toString() : '');
  const [type, setType] = useState<'credit' | 'debit'>(transaction?.type || 'debit');
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showNewMainAccount, setShowNewMainAccount] = useState(false);
  const [newMainAccountName, setNewMainAccountName] = useState('');
  
  const [showNewSubAccount, setShowNewSubAccount] = useState(false);
  const [newSubAccountName, setNewSubAccountName] = useState('');
  
  // Filter sub accounts based on selected main account
  const filteredSubAccounts = subAccounts.filter(
    subAccount => !mainAccountId || subAccount.main_account_id === mainAccountId
  );

  // Prepare account options for select
  const mainAccountOptions = mainAccounts.map(account => ({
    value: account.id,
    label: account.name,
  }));
  
  // Add "Create New" option
  mainAccountOptions.push({
    value: 'new',
    label: '+ Add New Main Account',
  });
  
  const subAccountOptions = filteredSubAccounts.map(account => ({
    value: account.id,
    label: account.name,
  }));
  
  // Add "Create New" option if main account is selected
  if (mainAccountId) {
    subAccountOptions.push({
      value: 'new',
      label: '+ Add New Sub Account',
    });
  }
  
  const typeOptions = [
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' },
  ];

  // Handle main account change
  const handleMainAccountChange = (selected: any) => {
    if (selected?.value === 'new') {
      setShowNewMainAccount(true);
      setMainAccountId('');
    } else {
      setMainAccountId(selected?.value || '');
      setShowNewMainAccount(false);
      
      // Clear sub account if main account changes
      setSubAccountId('');
    }
  };

  // Handle sub account change
  const handleSubAccountChange = (selected: any) => {
    if (selected?.value === 'new') {
      setShowNewSubAccount(true);
      setSubAccountId('');
    } else {
      setSubAccountId(selected?.value || '');
      setShowNewSubAccount(false);
    }
  };

  // Create new main account
  const handleCreateMainAccount = async () => {
    if (!newMainAccountName.trim()) {
      setErrors({ ...errors, newMainAccountName: 'Account name is required' });
      return;
    }
    
    const newAccount = await createMainAccount(newMainAccountName);
    
    if (newAccount) {
      setNewMainAccountName('');
      setShowNewMainAccount(false);
      setMainAccountId(newAccount.id);
    }
  };

  // Create new sub account
  const handleCreateSubAccount = async () => {
    if (!newSubAccountName.trim()) {
      setErrors({ ...errors, newSubAccountName: 'Account name is required' });
      return;
    }
    
    if (!mainAccountId) {
      setErrors({ ...errors, mainAccountId: 'Please select a main account first' });
      return;
    }
    
    const newAccount = await createSubAccount(newSubAccountName, mainAccountId);
    
    if (newAccount) {
      setNewSubAccountName('');
      setShowNewSubAccount(false);
      setSubAccountId(newAccount.id);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: any = {};
    
    if (!date) newErrors.date = 'Date is required';
    if (!mainAccountId) newErrors.mainAccountId = 'Main account is required';
    if (!subAccountId) newErrors.subAccountId = 'Sub account is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        date: date!.toISOString().split('T')[0],
        main_account_id: mainAccountId,
        sub_account_id: subAccountId,
        description,
        amount: parseFloat(amount),
        type,
        created_by: user!.id,
      };
      
      if (transaction) {
        // Update existing transaction
        const success = await updateTransaction(transaction.id, transactionData);
        
        if (success) {
          onSuccess();
        }
      } else {
        // Create new transaction
        const newTransaction = await createTransaction(transactionData);
        
        if (newTransaction) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load sub accounts when main account changes
  useEffect(() => {
    if (mainAccountId) {
      fetchSubAccounts(mainAccountId);
    }
  }, [mainAccountId]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <DatePicker
          selected={date}
          onChange={setDate}
          label="Transaction Date"
          error={errors.date}
        />
        
        {/* Main Account Selection */}
        {!showNewMainAccount ? (
          <Select
            options={mainAccountOptions}
            value={mainAccountOptions.find(option => option.value === mainAccountId)}
            onChange={handleMainAccountChange}
            label="Main Account"
            error={errors.mainAccountId}
            placeholder="Select main account"
          />
        ) : (
          <div className="space-y-2">
            <Input
              label="New Main Account Name"
              value={newMainAccountName}
              onChange={(e) => setNewMainAccountName(e.target.value)}
              error={errors.newMainAccountName}
            />
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                onClick={handleCreateMainAccount}
                icon={<Plus className="h-4 w-4" />}
              >
                Create
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewMainAccount(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Sub Account Selection */}
        {!showNewSubAccount ? (
          <Select
            options={subAccountOptions}
            value={subAccountOptions.find(option => option.value === subAccountId)}
            onChange={handleSubAccountChange}
            label="Sub Account"
            error={errors.subAccountId}
            placeholder={mainAccountId ? "Select sub account" : "Please select a main account first"}
            isDisabled={!mainAccountId}
          />
        ) : (
          <div className="space-y-2">
            <Input
              label="New Sub Account Name"
              value={newSubAccountName}
              onChange={(e) => setNewSubAccountName(e.target.value)}
              error={errors.newSubAccountName}
            />
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                onClick={handleCreateSubAccount}
                icon={<Plus className="h-4 w-4" />}
              >
                Create
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewSubAccount(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />
        
        {/* Amount and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
          
          <Select
            options={typeOptions}
            value={typeOptions.find(option => option.value === type)}
            onChange={(selected) => setType(selected?.value as 'credit' | 'debit')}
            label="Transaction Type"
            error={errors.type}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          isLoading={isSubmitting}
        >
          {transaction ? 'Update' : 'Save'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;