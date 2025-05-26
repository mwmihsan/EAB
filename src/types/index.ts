// Authentication types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// Account types
export interface MainAccount {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SubAccount {
  id: string;
  name: string;
  main_account_id: string;
  description?: string;
  created_at: string;
}

// Transaction types
export interface Transaction {
  id: string;
  date: string;
  main_account_id: string;
  sub_account_id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  main_account: MainAccount;
  sub_account: SubAccount;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  mainAccountId?: string;
  subAccountId?: string;
  summaryType?: 'monthly' | 'yearly' | 'none';
}

// Dashboard types
export interface DashboardSummary {
  totalCredit: number;
  totalDebit: number;
  balance: number;
  recentTransactions: TransactionWithDetails[];
  accountSummary: {
    accountName: string;
    balance: number;
  }[];
  monthlyData: {
    month: string;
    credit: number;
    debit: number;
  }[];
}

// Setting types
export interface AppSettings {
  companyName: string;
  currency: string;
  fiscalYearStart: string;
  theme: 'light' | 'dark';
}