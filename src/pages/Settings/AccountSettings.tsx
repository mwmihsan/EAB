import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import { useAccounts } from '../../hooks/useAccounts';
import { formatDate } from '../../lib/formatters';

const AccountSettings: React.FC = () => {
  const {
    mainAccounts,
    subAccounts,
    loadingMainAccounts,
    loadingSubAccounts,
    fetchMainAccounts,
    fetchSubAccounts,
    createMainAccount,
    createSubAccount,
    updateMainAccount,
    updateSubAccount,
    deleteMainAccount,
    deleteSubAccount,
  } = useAccounts();

  const [view, setView] = useState<'main' | 'sub'>('main');
  const [selectedMainAccount, setSelectedMainAccount] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [editingAccount, setEditingAccount] = useState<any>(null);
  
  const [accountName, setAccountName] = useState('');
  const [accountDescription, setAccountDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Load accounts
  useEffect(() => {
    fetchMainAccounts();
    fetchSubAccounts();
  }, []);

  // Filtered sub accounts for selected main account
  const filteredSubAccounts = subAccounts.filter(
    (account) => selectedMainAccount && account.main_account_id === selectedMainAccount
  );

  // Reset form
  const resetForm = () => {
    setAccountName('');
    setAccountDescription('');
    setFormError(null);
    setEditingAccount(null);
  };

  // Open form for creating
  const handleOpenCreateForm = () => {
    resetForm();
    setFormType('create');
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEditForm = (account: any) => {
    setEditingAccount(account);
    setAccountName(account.name);
    setAccountDescription(account.description || '');
    setFormType('edit');
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  // View sub accounts of a main account
  const handleViewSubAccounts = (mainAccountId: string) => {
    setSelectedMainAccount(mainAccountId);
    setView('sub');
  };

  // Go back to main accounts view
  const handleBackToMainAccounts = () => {
    setSelectedMainAccount(null);
    setView('main');
  };

  // Handle account deletion
  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    if (view === 'main') {
      const success = await deleteMainAccount(id);
      if (success) {
        fetchMainAccounts();
      }
    } else {
      const success = await deleteSubAccount(id);
      if (success) {
        fetchSubAccounts(selectedMainAccount || undefined);
      }
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      setFormError('Account name is required');
      return;
    }
    
    try {
      if (formType === 'create') {
        if (view === 'main') {
          await createMainAccount(accountName, accountDescription);
          fetchMainAccounts();
        } else if (selectedMainAccount) {
          await createSubAccount(accountName, selectedMainAccount, accountDescription);
          fetchSubAccounts(selectedMainAccount);
        }
      } else if (formType === 'edit' && editingAccount) {
        if (view === 'main') {
          await updateMainAccount(editingAccount.id, {
            name: accountName,
            description: accountDescription,
          });
          fetchMainAccounts();
        } else {
          await updateSubAccount(editingAccount.id, {
            name: accountName,
            description: accountDescription,
          });
          fetchSubAccounts(selectedMainAccount || undefined);
        }
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving account:', error);
      setFormError('An error occurred while saving the account');
    }
  };

  // Get selected main account details
  const selectedMainAccountDetails = mainAccounts.find(acc => acc.id === selectedMainAccount);

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {view === 'sub' && (
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBackToMainAccounts}
              className="mr-3"
            >
              Back to Main Accounts
            </Button>
          )}
          
          <h2 className="text-lg font-medium text-neutral-900">
            {view === 'main' 
              ? 'Main Accounts' 
              : `Sub Accounts for ${selectedMainAccountDetails?.name || ''}`}
          </h2>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateForm}
        >
          Add {view === 'main' ? 'Main' : 'Sub'} Account
        </Button>
      </div>

      {/* Accounts table */}
      {view === 'main' ? (
        <Table
          data={mainAccounts}
          columns={[
            {
              header: 'Name',
              accessor: 'name',
            },
            {
              header: 'Description',
              accessor: (account) => account.description || '-',
            },
            {
              header: 'Created At',
              accessor: (account) => formatDate(account.created_at),
            },
            {
              header: 'Actions',
              accessor: (account) => (
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleViewSubAccounts(account.id)}
                    className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                    title="View Sub Accounts"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditForm(account)}
                    className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-1 text-error-600 hover:text-error-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(account) => account.id}
          isLoading={loadingMainAccounts}
          emptyMessage="No main accounts found"
        />
      ) : (
        <Table
          data={filteredSubAccounts}
          columns={[
            {
              header: 'Name',
              accessor: 'name',
            },
            {
              header: 'Description',
              accessor: (account) => account.description || '-',
            },
            {
              header: 'Created At',
              accessor: (account) => formatDate(account.created_at),
            },
            {
              header: 'Actions',
              accessor: (account) => (
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleOpenEditForm(account)}
                    className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-1 text-error-600 hover:text-error-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(account) => account.id}
          isLoading={loadingSubAccounts}
          emptyMessage="No sub accounts found"
        />
      )}

      {/* Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {formType === 'create' ? 'Create' : 'Edit'} {view === 'main' ? 'Main' : 'Sub'} Account
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <Input
                  label="Account Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
                
                <Input
                  label="Description (Optional)"
                  value={accountDescription}
                  onChange={(e) => setAccountDescription(e.target.value)}
                />
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {formType === 'create' ? 'Create' : 'Update'} Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;