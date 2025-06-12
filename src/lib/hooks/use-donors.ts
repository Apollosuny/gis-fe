import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Donor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  join_date: string;
  donations?: any[];
}

// Fetch all donors
export const useGetDonors = () => {
  return useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const response = await axios.get('/api/donors');
      return response.data.donors;
    },
  });
};

// Fetch a single donor by ID
export const useGetDonorById = (id: string) => {
  return useQuery({
    queryKey: ['donors', id],
    queryFn: async () => {
      const response = await axios.get(`/api/donors/${id}`);
      return response.data.donor;
    },
    enabled: !!id, // Only run the query if there's an ID
  });
};

// Create a new donor
export const useCreateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donorData: Omit<Donor, 'id' | 'join_date'>) => {
      const response = await axios.post('/api/donors', donorData);
      return response.data.donor;
    },
    onSuccess: () => {
      // Invalidate donors query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

// Update an existing donor
export const useUpdateDonor = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donorData: Partial<Donor>) => {
      const response = await axios.put(`/api/donors/${id}`, donorData);
      return response.data.donor;
    },
    onSuccess: () => {
      // Update specific donor in the cache
      queryClient.invalidateQueries({ queryKey: ['donors', id] });
      // Update all donors list
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

// Delete a donor
export const useDeleteDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/donors/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate donors query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};
