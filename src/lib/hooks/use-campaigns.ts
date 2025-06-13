import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Donation {
  id: string;
  amount: number;
  date: string;
  method: string;
  donor_id: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

export interface CampaignReport {
  id: string;
  title: string;
  created_by: string;
  created_date: string;
  content: string;
  attachment_link?: string;
}

export interface CampaignFinancialRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  description?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  target_amount: number;
  status: string;
  donations?: Donation[];
  projects?: Project[];
  campaignReports?: CampaignReport[];
  campaignFinancialRecords?: CampaignFinancialRecord[];
}

// Fetch all campaigns
export const useGetCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await axios.get('/api/campaigns');
      return response.data.campaigns;
    },
  });
};

// Fetch a single campaign by ID
export const useGetCampaignById = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const response = await axios.get(`/api/campaigns/${id}`);
      return response.data.campaign;
    },
    enabled: !!id, // Only run the query if there's an ID
  });
};

// Create a new campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: Omit<Campaign, 'id'>) => {
      const response = await axios.post('/api/campaigns', campaignData);
      return response.data.campaign;
    },
    onSuccess: () => {
      // Invalidate campaigns query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Update an existing campaign
export const useUpdateCampaign = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: Omit<Campaign, 'id'>) => {
      const response = await axios.put(`/api/campaigns/${id}`, campaignData);
      return response.data.campaign;
    },
    onSuccess: () => {
      // Update specific campaign in the cache
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
      // Update all campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Delete a campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/campaigns/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate campaigns query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
