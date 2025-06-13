/* eslint-disable */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  campaign_id: string | null;
  campaign?: any;
  projectBeneficiaries?: any[];
  tasks?: any[];
  projectReports?: any[];
  kpis?: any[];
  projectFinancialRecords?: any[];
}

// Fetch all projects
export const useGetProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axios.get('/api/projects');
      return response.data.projects;
    },
  });
};

// Fetch a single project by ID
export const useGetProjectById = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${id}`);
      return response.data.project;
    },
    enabled: !!id, // Only run the query if there's an ID
  });
};

// Create a new project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: Omit<Project, 'id'>) => {
      const response = await axios.post('/api/projects', projectData);
      return response.data.project;
    },
    onSuccess: (data) => {
      // Invalidate projects query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // If project is linked to a campaign, invalidate that campaign's data too
      if (data.campaign_id) {
        queryClient.invalidateQueries({
          queryKey: ['campaigns', data.campaign_id],
        });
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      }
    },
  });
};

// Update an existing project
export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      const response = await axios.put(`/api/projects/${id}`, projectData);
      return response.data.project;
    },
    onSuccess: (data) => {
      // Update specific project in the cache
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      // Update all projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // If project is linked to a campaign, invalidate that campaign's data too
      if (data.campaign_id) {
        queryClient.invalidateQueries({
          queryKey: ['campaigns', data.campaign_id],
        });
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      }
    },
  });
};

// Delete a project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate projects query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Since we don't know which campaign this project was linked to,
      // we invalidate all campaigns data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
