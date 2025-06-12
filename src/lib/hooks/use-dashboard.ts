import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface DashboardData {
  stats: {
    totalDonations: number;
    totalDonors: number;
    activeCampaigns: number;
    activeProjects: number;
  };
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
  chartData: {
    donationTrends: {
      monthly: number[];
      targets: number[];
    };
    donationSources: {
      method: string;
      amount: number;
      percentage: number;
    }[];
    projectBudget: {
      categories: string[];
      expenses: number[];
      allocated: number[];
    };
    monthlyDonorsComparison: {
      currentYear: number;
      previousYear: number;
      currentYearData: number[];
      previousYearData: number[];
    };
    projectTimeline: {
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      status: string;
    }[];
  };
  recentCampaigns: {
    id: string;
    name: string;
    targetAmount: number;
    raisedAmount: number;
    progressPercentage: number;
  }[];
  recentDonors: {
    id: string;
    name: string;
    joinDate: string;
    recentDonation: number;
  }[];
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
