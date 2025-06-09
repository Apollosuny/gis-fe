'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { FilterableTable } from '@/components/ui/filterable-table';
import { ProjectTimelineChart } from '@/components/charts/project-timeline-chart';
import {
  FileText,
  AlertTriangle,
  Users,
  CheckCircle,
  Plus,
  ExternalLink,
} from 'lucide-react';

// Mock projects data
const projectsData = [
  {
    id: '1',
    name: 'Clean Water Initiative',
    startDate: '2025-01-15',
    endDate: '2025-07-15',
    budget: 45000,
    spent: 28500,
    teamSize: 12,
    completion: 65,
    status: 'in-progress',
    kpis: {
      beneficiaries: 2500,
      communities: 5,
    },
  },
  {
    id: '2',
    name: 'School Renovation',
    startDate: '2025-03-01',
    endDate: '2025-08-15',
    budget: 65000,
    spent: 32500,
    teamSize: 18,
    completion: 48,
    status: 'in-progress',
    kpis: {
      beneficiaries: 1200,
      communities: 3,
    },
  },
  {
    id: '3',
    name: 'Medical Camp',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    budget: 28000,
    spent: 28000,
    teamSize: 24,
    completion: 100,
    status: 'completed',
    kpis: {
      beneficiaries: 3500,
      communities: 8,
    },
  },
  {
    id: '4',
    name: 'Food Distribution',
    startDate: '2025-05-01',
    endDate: '2025-09-30',
    budget: 35000,
    spent: 5250,
    teamSize: 16,
    completion: 15,
    status: 'in-progress',
    kpis: {
      beneficiaries: 4500,
      communities: 12,
    },
  },
  {
    id: '5',
    name: 'Community Center',
    startDate: '2025-07-01',
    endDate: '2026-03-31',
    budget: 95000,
    spent: 0,
    teamSize: 0,
    completion: 0,
    status: 'planning',
    kpis: {
      beneficiaries: 7500,
      communities: 4,
    },
  },
  {
    id: '6',
    name: 'Educational Scholarships',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    budget: 55000,
    spent: 42000,
    teamSize: 8,
    completion: 76,
    status: 'in-progress',
    kpis: {
      beneficiaries: 350,
      communities: 15,
    },
  },
  {
    id: '7',
    name: 'Healthcare Initiative',
    startDate: '2025-09-01',
    endDate: '2026-02-28',
    budget: 48000,
    spent: 0,
    teamSize: 0,
    completion: 0,
    status: 'planning',
    kpis: {
      beneficiaries: 5000,
      communities: 10,
    },
  },
];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate summary stats
const totalBudget = projectsData.reduce(
  (acc, project) => acc + project.budget,
  0
);
const totalSpent = projectsData.reduce(
  (acc, project) => acc + project.spent,
  0
);
const activeProjects = projectsData.filter(
  (project) => project.status === 'in-progress'
).length;
const totalBeneficiaries = projectsData.reduce(
  (acc, project) => acc + project.kpis.beneficiaries,
  0
);

export default function ProjectsPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const columns = [
    {
      key: 'name',
      title: 'Project Name',
      sortable: true,
    },
    {
      key: 'startDate',
      title: 'Start Date',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'endDate',
      title: 'End Date',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'budget',
      title: 'Budget',
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'spent',
      title: 'Spent',
      sortable: true,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      render: (value: number, item: any) => (
        <div>
          {formatCurrency(value)}
          <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
            <div
              className='bg-primary h-2 rounded-full'
              style={{
                width: `${Math.min(
                  100,
                  Math.round((value / item.budget) * 100)
                )}%`,
              }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>
            {Math.round((value / item.budget) * 100)}%
          </span>
        </div>
      ),
    },
    {
      key: 'completion',
      title: 'Completion',
      sortable: true,
      render: (value: number) => (
        <div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${
                value < 30
                  ? 'bg-red-500'
                  : value < 70
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>{value}%</span>
        </div>
      ),
    },
    {
      key: 'teamSize',
      title: 'Team Size',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => {
        const statusClasses = {
          completed:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          'in-progress':
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          planning:
            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
          'at-risk':
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        const status = value as keyof typeof statusClasses;

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusClasses[status]}`}
          >
            {value.replace('-', ' ')}
          </span>
        );
      },
    },
    {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      key: 'actions' as any,
      title: 'Actions',
      sortable: false,
      render: () => (
        <div className='flex space-x-2'>
          <button className='p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20'>
            <ExternalLink size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      column: 'status',
      options: [
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Planning', value: 'planning' },
        { label: 'At Risk', value: 'at-risk' },
      ],
    },
  ];

  return (
    <div className='space-y-8 py-8'>
      <PageHeader
        title='Project Management'
        subtitle='Monitor and manage project progress and budgets'
        action={
          <button className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'>
            <Plus className='mr-2 h-4 w-4' /> New Project
          </button>
        }
      />

      {/* Stats */}
      <motion.div
        className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'
        variants={containerVariants}
        initial='hidden'
        animate='show'
      >
        <StatsCard
          title='Active Projects'
          value={activeProjects}
          icon={<FileText className='h-5 w-5' />}
          delay={1}
        />
        <StatsCard
          title='Total Budget'
          value={formatCurrency(totalBudget)}
          icon={<CheckCircle className='h-5 w-5' />}
          delay={2}
        />
        <StatsCard
          title='Budget Utilization'
          value={`${Math.round((totalSpent / totalBudget) * 100)}%`}
          description={`${formatCurrency(totalSpent)} spent of ${formatCurrency(
            totalBudget
          )}`}
          icon={<AlertTriangle className='h-5 w-5' />}
          trend={
            totalSpent / totalBudget > 0.9
              ? { value: 'Near Budget Limit', isPositive: false }
              : undefined
          }
          delay={3}
        />
        <StatsCard
          title='Total Beneficiaries'
          value={totalBeneficiaries.toLocaleString()}
          icon={<Users className='h-5 w-5' />}
          trend={{ value: '+15% this quarter', isPositive: true }}
          delay={4}
        />
      </motion.div>

      {/* Project Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className='rounded-lg border bg-card p-6 shadow-sm'
      >
        <h2 className='font-semibold text-lg mb-4'>Project Timeline</h2>
        <ProjectTimelineChart />
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className='bg-background rounded-lg border shadow-sm'>
          <FilterableTable
            data={projectsData}
            columns={columns}
            initialSortColumn='startDate'
            initialSortDirection='desc'
            filterOptions={filterOptions}
            searchable={true}
            onRowClick={(project) => console.log('Clicked project:', project)}
          />
        </div>
      </motion.div>
    </div>
  );
}
