import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface FinanceData {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
  recentTransactions: FinancialTransaction[];
  allTransactions: FinancialTransaction[];
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string | null;
  source: string;
  sourceId: string;
  sourceType: 'campaign' | 'project';
}

export interface NewFinancialRecord {
  sourceType: 'campaign' | 'project';
  sourceId: string;
  type: string;
  amount: number;
  description?: string;
  date?: string;
}

// Fetch finance data
export function useGetFinanceData() {
  return useQuery<FinanceData>({
    queryKey: ['finance'],
    queryFn: async () => {
      const response = await axios.get('/api/finance');
      return response.data;
    },
  });
}

// Add new financial record
export function useAddFinancialRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewFinancialRecord) => {
      const response = await axios.post('/api/finance', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
