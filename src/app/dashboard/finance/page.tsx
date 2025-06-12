'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PlusCircle,
  Calendar,
  FileText,
  X,
} from 'lucide-react';
import {
  useGetFinanceData,
  useAddFinancialRecord,
} from '@/lib/hooks/use-finance';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { useGetProjects } from '@/lib/hooks/use-projects';
import { useGetCampaigns } from '@/lib/hooks/use-campaigns';
//import { DateTime } from 'luxon';
import { toast } from 'sonner';

export default function FinancePage() {
  const { data: financeData, isLoading } = useGetFinanceData();
  const { data: projectsData } = useGetProjects();
  const { data: campaignsData } = useGetCampaigns();
  const { mutateAsync: addFinancialRecord } = useAddFinancialRecord();

  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<{
    sourceType: 'project' | 'campaign';
    sourceId: string;
    type: string;
    amount: number;
    description: string;
    date: string;
  }>({
    sourceType: 'project',
    sourceId: '',
    type: 'Income',
    amount: 0,
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFinancialRecord(newRecord);
      toast.success('Financial record added successfully');
      setIsAddingRecord(false);
      setNewRecord({
        sourceType: 'project',
        sourceId: '',
        type: 'Income',
        amount: 0,
        description: '',
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      toast.error('Failed to add financial record');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        Loading financial data...
      </div>
    );
  }

  if (!financeData) {
    return (
      <div className='flex items-center justify-center h-96'>
        Failed to load financial data.
      </div>
    );
  }

  const {
    totalIncome,
    totalExpenses,
    totalBalance,
    monthlyData,
    allTransactions,
  } = financeData;

  const statsItems = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: <ArrowUpCircle />,
      iconBg:
        'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <ArrowDownCircle />,
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    },
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: <Wallet />,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
  ];

  return (
    <div className='space-y-6 p-6'>
      <PageHeader
        title='Financial Management'
        subtitle='Track and manage all financial records'
        action={
          <Button onClick={() => setIsAddingRecord(true)}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Record
          </Button>
        }
      />

      {/* Financial Summary Stats */}
      <div className='grid gap-6 md:grid-cols-3'>
        {statsItems.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            initial='hidden'
            animate='visible'
            custom={i}
            className='rounded-lg border bg-card p-6 shadow-sm'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {item.title}
                </p>
                <h3 className='text-2xl font-bold'>{item.value}</h3>
              </div>
              <div className={`rounded-full p-2 ${item.iconBg}`}>
                {item.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Finance Chart */}
      <div className='rounded-lg border bg-card p-6 shadow-sm'>
        <h3 className='text-lg font-medium mb-4'>Monthly Financial Overview</h3>
        <div className='h-80'>
          <div className='flex flex-col md:flex-row h-full'>
            <div className='flex-1 overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b text-left'>
                    <th className='pb-2 pr-4 font-medium'>Month</th>
                    <th className='pb-2 px-4 font-medium'>Income</th>
                    <th className='pb-2 px-4 font-medium'>Expenses</th>
                    <th className='pb-2 px-4 font-medium'>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr key={index} className='border-b hover:bg-muted/50'>
                      <td className='py-3 pr-4'>{month.month}</td>
                      <td className='py-3 px-4 text-green-600'>
                        {formatCurrency(month.income)}
                      </td>
                      <td className='py-3 px-4 text-red-600'>
                        {formatCurrency(month.expenses)}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(month.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className='rounded-lg border bg-card p-6 shadow-sm'>
        <h3 className='text-lg font-medium mb-4'>All Financial Records</h3>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b text-left'>
                <th className='pb-2 pr-4 font-medium'>Date</th>
                <th className='pb-2 px-4 font-medium'>Description</th>
                <th className='pb-2 px-4 font-medium'>Source</th>
                <th className='pb-2 px-4 font-medium'>Type</th>
                <th className='pb-2 px-4 font-medium'>Amount</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((transaction) => (
                <tr key={transaction.id} className='border-b hover:bg-muted/50'>
                  <td className='py-3 pr-4'>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className='py-3 px-4'>
                    {transaction.description || '—'}
                  </td>
                  <td className='py-3 px-4'>{transaction.source}</td>
                  <td className='py-3 px-4'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === 'Income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      transaction.type === 'Income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Financial Record Modal */}
      {isAddingRecord && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Add Financial Record</h2>
              <button
                onClick={() => setIsAddingRecord(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='sourceType'
                  className='block text-sm font-medium mb-1'
                >
                  Record Type
                </label>
                <select
                  id='sourceType'
                  name='sourceType'
                  value={newRecord.sourceType}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value='project'>Project</option>
                  <option value='campaign'>Campaign</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='sourceId'
                  className='block text-sm font-medium mb-1'
                >
                  {newRecord.sourceType === 'project' ? 'Project' : 'Campaign'}
                </label>
                <select
                  id='sourceId'
                  name='sourceId'
                  value={newRecord.sourceId}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value=''>
                    Select{' '}
                    {newRecord.sourceType === 'project'
                      ? 'a project'
                      : 'a campaign'}
                  </option>
                  {newRecord.sourceType === 'project' &&
                    projectsData?.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  {newRecord.sourceType === 'campaign' &&
                    campaignsData?.map((campaign: any) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='type'
                  className='block text-sm font-medium mb-1'
                >
                  Transaction Type
                </label>
                <select
                  id='type'
                  name='type'
                  value={newRecord.type}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value='Income'>Income</option>
                  <option value='Expense'>Expense</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='amount'
                  className='block text-sm font-medium mb-1'
                >
                  Amount
                </label>
                <input
                  id='amount'
                  name='amount'
                  type='number'
                  step='0.01'
                  min='0'
                  value={newRecord.amount}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='date'
                  className='block text-sm font-medium mb-1'
                >
                  Date
                </label>
                <input
                  id='date'
                  name='date'
                  type='date'
                  value={newRecord.date}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium mb-1'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={newRecord.description}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  rows={3}
                />
              </div>

              <div className='flex justify-end space-x-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddingRecord(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Add Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
