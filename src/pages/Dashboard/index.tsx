import React, { useEffect, useState } from 'react';
import { ChevronRight, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    loading, 
    fetchTransactions, 
    totalCredit, 
    totalDebit, 
    balance 
  } = useTransactions();
  
  const [monthlyData, setMonthlyData] = useState<{ month: string; credit: number; debit: number }[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Prepare data for monthly chart
  useEffect(() => {
    if (transactions.length > 0) {
      // Get last 6 months of data
      const last6Months: { [key: string]: { credit: number; debit: number } } = {};
      const today = new Date();
      
      // Initialize last 6 months with zero values
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        last6Months[monthKey] = { credit: 0, debit: 0 };
      }
      
      // Populate with transaction data
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Only consider last 6 months
        if (last6Months[monthKey]) {
          if (transaction.type === 'credit') {
            last6Months[monthKey].credit += transaction.amount;
          } else {
            last6Months[monthKey].debit += transaction.amount;
          }
        }
      });
      
      // Convert to array for chart
      const chartData = Object.entries(last6Months).map(([month, data]) => ({
        month,
        credit: data.credit,
        debit: data.debit,
      }));
      
      setMonthlyData(chartData);
    }
  }, [transactions]);

  // Chart data
  const chartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Credit',
        data: monthlyData.map(data => data.credit),
        borderColor: '#047857',
        backgroundColor: 'rgba(4, 120, 87, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Debit',
        data: monthlyData.map(data => data.debit),
        borderColor: '#B91C1C',
        backgroundColor: 'rgba(185, 28, 28, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  // Recent transactions for dashboard
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Summary Card */}
        <Card
          title="Current Balance"
          icon={<DollarSign className="h-5 w-5" />}
          className={`${balance >= 0 ? 'border-l-4 border-success-500' : 'border-l-4 border-error-500'}`}
        >
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(balance)}
          </div>
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Total Credits: {formatCurrency(totalCredit)}</span>
            <span>Total Debits: {formatCurrency(totalDebit)}</span>
          </div>
        </Card>

        {/* Credit Card */}
        <Card
          title="Total Credit"
          icon={<TrendingUp className="h-5 w-5" />}
          className="border-l-4 border-success-500"
        >
          <div className="text-3xl font-bold text-success-700 mb-2">
            {formatCurrency(totalCredit)}
          </div>
          <div className="text-sm text-neutral-500">
            All time credit transactions
          </div>
        </Card>

        {/* Debit Card */}
        <Card
          title="Total Debit"
          icon={<TrendingDown className="h-5 w-5" />}
          className="border-l-4 border-error-500"
        >
          <div className="text-3xl font-bold text-error-700 mb-2">
            {formatCurrency(totalDebit)}
          </div>
          <div className="text-sm text-neutral-500">
            All time debit transactions
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <Card
        title="Financial Overview"
        subtitle="Last 6 months of credit and debit activity"
      >
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card
        title="Recent Transactions"
        icon={<Clock className="h-5 w-5" />}
        footer={
          <Link 
            to="/ledger" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            View all transactions
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        }
      >
        <Table
          data={recentTransactions}
          columns={[
            {
              header: 'Date',
              accessor: (transaction) => formatDate(transaction.date),
            },
            {
              header: 'Account',
              accessor: (transaction) => transaction.sub_account.name,
            },
            {
              header: 'Description',
              accessor: 'description',
            },
            {
              header: 'Type',
              accessor: (transaction) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transaction.type === 'credit' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                }`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              ),
            },
            {
              header: 'Amount',
              accessor: (transaction) => formatCurrency(transaction.amount),
              className: 'text-right font-medium',
            },
          ]}
          keyExtractor={(transaction) => transaction.id}
          isLoading={loading}
          emptyMessage="No recent transactions found"
        />
      </Card>
    </div>
  );
};

export default Dashboard;