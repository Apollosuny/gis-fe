'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  PlusCircle,
  UserPlus,
  ClipboardList,
  X,
} from 'lucide-react';
import { useGetHRData, useAddHRRecord } from '@/lib/hooks/use-hr';
import { useGetProjects } from '@/lib/hooks/use-projects';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
//import { DateTime } from 'luxon';
import { toast } from 'sonner';

export default function HRPage() {
  const { data: hrData, isLoading } = useGetHRData();
  const { data: projectsData } = useGetProjects();
  const { mutateAsync: addHRRecord } = useAddHRRecord();

  const [activeTab, setActiveTab] = useState('staff');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [newStaff, setNewStaff] = useState({
    type: 'staff' as const,
    name: '',
    email: '',
    role: 'Manager',
  });

  const [newTask, setNewTask] = useState({
    type: 'task' as const,
    projectId: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 10),
    status: 'Not Started',
    staffIds: [] as string[],
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleStaffInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaskInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStaffSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setNewTask((prev) => ({
      ...prev,
      staffIds: selectedOptions,
    }));
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHRRecord(newStaff);
      toast.success('Staff member added successfully');
      setIsAddingStaff(false);
      setNewStaff({
        type: 'staff' as const,
        name: '',
        email: '',
        role: 'Manager',
      });
    } catch (error) {
      toast.error('Failed to add staff member');
      console.error(error);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHRRecord(newTask);
      toast.success('Task added successfully');
      setIsAddingTask(false);
      setNewTask({
        type: 'task',
        projectId: '',
        description: '',
        dueDate: new Date().toISOString().slice(0, 10),
        status: 'Not Started',
        staffIds: [],
      });
    } catch (error) {
      toast.error('Failed to add task');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        Loading HR data...
      </div>
    );
  }

  if (!hrData) {
    return (
      <div className='flex items-center justify-center h-96'>
        Failed to load HR data.
      </div>
    );
  }

  const { stats, staffData, tasksByStatus, recentTasks } = hrData;

  const statsItems = [
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: <Users />,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      title: 'Active Tasks',
      value: tasksByStatus
        .filter((t) => t.status !== 'Completed')
        .reduce((acc, item) => acc + item._count.id, 0),
      icon: <Clock />,
      iconBg:
        'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      title: 'Completed Tasks',
      value:
        tasksByStatus.find((t) => t.status === 'Completed')?._count.id || 0,
      icon: <CheckCircle2 />,
      iconBg:
        'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    },
  ];

  return (
    <div className='space-y-6 p-6'>
      <PageHeader
        title='HR Management'
        subtitle='Manage staff and task assignments'
        action={
          <div className='flex space-x-2'>
            <Button onClick={() => setIsAddingStaff(true)}>
              <UserPlus className='mr-2 h-4 w-4' />
              Add Staff
            </Button>
            <Button onClick={() => setIsAddingTask(true)}>
              <ClipboardList className='mr-2 h-4 w-4' />
              Add Task
            </Button>
          </div>
        }
      />

      {/* HR Stats */}
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

      {/* Staff by Role */}
      <div className='rounded-lg border bg-card p-6 shadow-sm'>
        <h3 className='text-lg font-medium mb-4'>Staff by Role</h3>
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {Object.entries(stats.staffByRole).map(([role, count]) => (
            <div key={role} className='flex items-center p-4 border rounded-lg'>
              <Briefcase className='h-5 w-5 text-muted-foreground mr-3' />
              <div>
                <div className='font-medium'>{role}</div>
                <div className='text-2xl font-bold'>{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs for Staff and Tasks */}
      <div className='rounded-lg border bg-card shadow-sm'>
        <div className='border-b'>
          <div className='flex'>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === 'staff'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('staff')}
            >
              Staff Members
            </button>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
          </div>
        </div>

        <div className='p-6'>
          {activeTab === 'staff' ? (
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b text-left'>
                    <th className='pb-2 pr-4 font-medium'>Name</th>
                    <th className='pb-2 px-4 font-medium'>Email</th>
                    <th className='pb-2 px-4 font-medium'>Role</th>
                    <th className='pb-2 px-4 font-medium'>Tasks</th>
                    <th className='pb-2 px-4 font-medium'>Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {staffData.map((staff) => (
                    <tr key={staff.id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 pr-4 font-medium'>{staff.name}</td>
                      <td className='py-3 px-4'>{staff.email}</td>
                      <td className='py-3 px-4'>
                        <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700'>
                          {staff.role}
                        </span>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex space-x-1'>
                          <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700'>
                            {staff.activeTasks} Active
                          </span>
                          <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700'>
                            {staff.totalTasks} Total
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex flex-wrap gap-1'>
                          {staff.projects.map((project, i) => (
                            <span
                              key={i}
                              className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700'
                            >
                              {project}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b text-left'>
                    <th className='pb-2 pr-4 font-medium'>Description</th>
                    <th className='pb-2 px-4 font-medium'>Project</th>
                    <th className='pb-2 px-4 font-medium'>Due Date</th>
                    <th className='pb-2 px-4 font-medium'>Status</th>
                    <th className='pb-2 px-4 font-medium'>Assigned Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task.id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 pr-4 font-medium'>
                        {task.description}
                      </td>
                      <td className='py-3 px-4'>{task.project}</td>
                      <td className='py-3 px-4'>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className='py-3 px-4'>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            task.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex flex-wrap gap-1'>
                          {task.assignedStaff.map((staff) => (
                            <span
                              key={staff.id}
                              className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700'
                            >
                              {staff.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Add New Staff Member</h2>
              <button
                onClick={() => setIsAddingStaff(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium mb-1'
                >
                  Full Name
                </label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  value={newStaff.name}
                  onChange={handleStaffInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium mb-1'
                >
                  Email Address
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  value={newStaff.email}
                  onChange={handleStaffInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='role'
                  className='block text-sm font-medium mb-1'
                >
                  Role
                </label>
                <select
                  id='role'
                  name='role'
                  value={newStaff.role}
                  onChange={handleStaffInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value='Manager'>Manager</option>
                  <option value='Coordinator'>Coordinator</option>
                  <option value='Field Officer'>Field Officer</option>
                  <option value='Admin'>Admin</option>
                  <option value='Finance'>Finance</option>
                  <option value='Volunteer'>Volunteer</option>
                </select>
              </div>

              <div className='flex justify-end space-x-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddingStaff(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Add Staff</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Add New Task</h2>
              <button
                onClick={() => setIsAddingTask(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='projectId'
                  className='block text-sm font-medium mb-1'
                >
                  Project
                </label>
                <select
                  id='projectId'
                  name='projectId'
                  value={newTask.projectId}
                  onChange={handleTaskInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value=''>Select a project</option>
                  {projectsData?.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium mb-1'
                >
                  Task Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  rows={3}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='dueDate'
                  className='block text-sm font-medium mb-1'
                >
                  Due Date
                </label>
                <input
                  id='dueDate'
                  name='dueDate'
                  type='date'
                  value={newTask.dueDate}
                  onChange={handleTaskInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='status'
                  className='block text-sm font-medium mb-1'
                >
                  Status
                </label>
                <select
                  id='status'
                  name='status'
                  value={newTask.status}
                  onChange={handleTaskInputChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  <option value='Not Started'>Not Started</option>
                  <option value='In Progress'>In Progress</option>
                  <option value='Completed'>Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='staffIds'
                  className='block text-sm font-medium mb-1'
                >
                  Assign Staff (hold Ctrl/Cmd to select multiple)
                </label>
                <select
                  id='staffIds'
                  name='staffIds'
                  multiple
                  size={4}
                  value={newTask.staffIds}
                  onChange={handleStaffSelectionChange}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                  required
                >
                  {staffData.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex justify-end space-x-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Add Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
