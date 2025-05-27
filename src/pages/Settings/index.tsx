import React, { useState, useEffect } from 'react';
import { Table as Tabs, Users, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import AccountSettings from './AccountSettings';
import UserSettings from './UserSettings';
import GeneralSettings from './GeneralSettings';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-5 w-5" /> },
    { id: 'accounts', label: 'Accounts', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Settings" subtitle="Manage your application preferences">
        {/* Tabs navigation */}
        <div className="border-b border-neutral-200 mb-6">
          <div className="flex overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mr-8 py-4 flex items-center text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="py-2">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'accounts' && <AccountSettings />}
          {activeTab === 'users' && <UserSettings />}
        </div>
      </Card>
    </div>
  );
};

export default Settings;