import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/formatters';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

const UserSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data as User[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset form
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('user');
    setFormError(null);
    setEditingUser(null);
  };

  // Open form for creating
  const handleOpenCreateForm = () => {
    resetForm();
    setFormType('create');
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEditForm = (user: User) => {
    setEditingUser(user);
    setEmail(user.email);
    setRole(user.role);
    setFormType('edit');
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      // First delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Then delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      
      if (authError) {
        throw authError;
      }
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formType === 'create') {
      if (!email.trim() || !password.trim()) {
        setFormError('Email and password are required');
        return;
      }
      
      try {
        // Create user in auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        // Create profile with role
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              { 
                id: data.user.id, 
                email, 
                role 
              }
            ]);
          
          if (profileError) {
            throw profileError;
          }
          
          toast.success('User created successfully');
          handleCloseForm();
          fetchUsers();
        }
      } catch (error: any) {
        console.error('Error creating user:', error);
        setFormError(error.message);
      }
    } else if (formType === 'edit' && editingUser) {
      try {
        // Update user role in profile
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', editingUser.id);
        
        if (error) {
          throw error;
        }
        
        toast.success('User updated successfully');
        handleCloseForm();
        fetchUsers();
      } catch (error: any) {
        console.error('Error updating user:', error);
        setFormError(error.message);
      }
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Standard User' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-900">Users</h2>
        
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateForm}
        >
          Add User
        </Button>
      </div>

      {/* Users table */}
      <Table
        data={users}
        columns={[
          {
            header: 'Email',
            accessor: 'email',
          },
          {
            header: 'Role',
            accessor: (user) => (
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-800'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
            ),
          },
          {
            header: 'Created At',
            accessor: (user) => formatDate(user.created_at),
          },
          {
            header: 'Actions',
            accessor: (user) => (
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleOpenEditForm(user)}
                  className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1 text-error-600 hover:text-error-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        keyExtractor={(user) => user.id}
        isLoading={loading}
        emptyMessage="No users found"
      />

      {/* Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {formType === 'create' ? 'Create' : 'Edit'} User
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={formType === 'edit'}
                  required={formType === 'create'}
                />
                
                {formType === 'create' && (
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}
                
                <Select
                  label="Role"
                  options={roleOptions}
                  value={roleOptions.find(option => option.value === role)}
                  onChange={(selected) => setRole(selected?.value as 'admin' | 'user')}
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
                    {formType === 'create' ? 'Create' : 'Update'} User
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

export default UserSettings;