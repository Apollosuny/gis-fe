import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface HRData {
  stats: {
    totalStaff: number;
    staffByRole: Record<string, number>;
  };
  staffData: StaffMember[];
  tasksByStatus: TaskStatusCount[];
  recentTasks: Task[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  activeTasks: number;
  projects: string[];
}

export interface TaskStatusCount {
  status: string;
  _count: { id: number };
}

export interface Task {
  id: string;
  description: string;
  dueDate: string;
  status: string;
  project: string;
  projectId: string;
  assignedStaff: {
    id: string;
    name: string;
  }[];
}

export interface NewStaffMember {
  type: 'staff';
  name: string;
  email: string;
  role: string;
}

export interface NewTask {
  type: 'task';
  projectId: string;
  description: string;
  dueDate: string;
  status: string;
  staffIds: string[];
}

export interface TaskAssignment {
  type: 'task_assignment';
  taskId: string;
  staffId: string;
}

type HRMutationData = NewStaffMember | NewTask | TaskAssignment;

// Fetch HR data
export function useGetHRData() {
  return useQuery<HRData>({
    queryKey: ['hr'],
    queryFn: async () => {
      const response = await axios.get('/api/hr');
      return response.data;
    },
  });
}

// Add new staff member or task
export function useAddHRRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: HRMutationData) => {
      const response = await axios.post('/api/hr', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}
