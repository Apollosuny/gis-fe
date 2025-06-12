import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface DashboardData {
  donorStats: {
    totalDonors: number;
    totalDonated: number;
    recentDonors: any[];
  };
  campaignsData: {
    id: string;
    name: string;
    targetAmount: number;
    raisedAmount: number;
    progressPercentage: number;
  }[];
  projectStats: {
    total: number;
    byStatus: {
      status: string;
      _count: { id: number };
    }[];
  };
  recentFinancialActivities: {
    id: string;
    date: string;
    type: string;
    amount: number;
    description: string | null;
    relatedTo: string;
  }[];
  upcomingTasks: any[];
}

// Fetch dashboard data
export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard');
      return response.data as DashboardData;
    },
  });
};
