'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useGetProjects } from '@/lib/hooks/use-projects';

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

// Project interface for formatted data
interface FormattedProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamSize: number;
  completion: number;
  status: string;
  kpis: {
    beneficiaries: number;
    communities: number;
  };
}

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useGetProjects();
  const [formattedProjects, setFormattedProjects] = useState<
    FormattedProject[]
  >([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);

  useEffect(() => {
    if (projects) {
      // Format the project data from API to match our table structure
      const formatted = projects.map((project: any) => {
        // Calculate total financial records
        let budget =
          project.projectFinancialRecords
            ?.filter((record: any) => record.type === 'Budget')
            .reduce((sum: number, record: any) => sum + record.amount, 0) || 0;

        // If no budget records, use the sum of expenses as an estimate
        if (budget === 0) {
          const totalExpenses =
            project.projectFinancialRecords
              ?.filter((record: any) => record.type === 'Expense')
              .reduce((sum: number, record: any) => sum + record.amount, 0) ||
            0;

          // Set budget to slightly higher than expenses or default value
          budget = totalExpenses > 0 ? Math.round(totalExpenses * 1.2) : 10000;
        }

        const spent =
          project.projectFinancialRecords
            ?.filter((record: any) => record.type === 'Expense')
            .reduce((sum: number, record: any) => sum + record.amount, 0) || 0;

        // Calculate completion based on date progress
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        const currentDate = new Date();

        let completion = 0;
        if (project.status.toLowerCase() === 'completed') {
          completion = 100;
        } else if (project.status.toLowerCase() === 'planning') {
          completion = 0;
        } else {
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsedDuration = currentDate.getTime() - startDate.getTime();
          completion = Math.round((elapsedDuration / totalDuration) * 100);
          completion = Math.min(Math.max(completion, 0), 100); // Clamp between 0-100
        }

        // Calculate team size based on task assignments
        const teamMembers = new Set<string>();
        project.tasks?.forEach((task: any) => {
          task.taskStaff?.forEach((staffAssignment: any) => {
            teamMembers.add(staffAssignment.staff_id);
          });
        });

        // Get beneficiaries data from KPIs or project-beneficiary relations
        let beneficiariesCount = 0;
        let communitiesCount = 0;

        // Check for KPIs with beneficiary data
        const beneficiaryKPI = project.kpis?.find((kpi: any) =>
          kpi.name.toLowerCase().includes('beneficiar')
        );

        if (beneficiaryKPI) {
          beneficiariesCount =
            parseInt(String(beneficiaryKPI.current_value)) || 0;
        } else {
          // If no KPI, count number of beneficiaries from relations
          beneficiariesCount = project.projectBeneficiaries?.length || 0;
        }

        // Look for community KPI
        const communityKPI = project.kpis?.find((kpi: any) =>
          kpi.name.toLowerCase().includes('communit')
        );
        if (communityKPI) {
          communitiesCount = parseInt(String(communityKPI.current_value)) || 0;
        }

        // Map status to our frontend values
        let status = project.status.toLowerCase();
        // Convert statuses to match our frontend values if needed
        if (status === 'active') status = 'in-progress';
        if (status === 'planned') status = 'planning';
        if (status === 'in progress') status = 'in-progress';

        return {
          id: project.id,
          name: project.name,
          startDate: project.start_date,
          endDate: project.end_date,
          budget,
          spent,
          teamSize: teamMembers.size,
          completion,
          status,
          kpis: {
            beneficiaries: beneficiariesCount,
            communities: communitiesCount,
          },
        };
      });

      setFormattedProjects(formatted);

      // Calculate summary statistics
      const activeProjects = formatted.filter(
        (project: FormattedProject) => project.status === 'in-progress'
      ).length;
      setActiveProjectsCount(activeProjects);

      const totalBudgetAmount = formatted.reduce(
        (sum: number, project: FormattedProject) => sum + project.budget,
        0
      );
      setTotalBudget(totalBudgetAmount);

      const totalSpentAmount = formatted.reduce(
        (sum: number, project: FormattedProject) => sum + project.spent,
        0
      );
      setTotalSpent(totalSpentAmount);

      const beneficiariesCount = formatted.reduce(
        (sum: number, project: FormattedProject) =>
          sum + project.kpis.beneficiaries,
        0
      );
      setTotalBeneficiaries(beneficiariesCount);
    }
  }, [projects]);

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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-10'>
        <p className='text-red-500'>
          Error loading projects data. Please try again later.
        </p>
      </div>
    );
  }

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
          value={activeProjectsCount}
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
          value={
            totalBudget > 0
              ? `${Math.round((totalSpent / totalBudget) * 100)}%`
              : '0%'
          }
          description={`${formatCurrency(totalSpent)} spent of ${formatCurrency(
            totalBudget
          )}`}
          icon={<AlertTriangle className='h-5 w-5' />}
          trend={
            totalBudget > 0 && totalSpent / totalBudget > 0.9
              ? { value: 'Near Budget Limit', isPositive: false }
              : totalBudget > 0 && totalSpent / totalBudget < 0.3
              ? { value: 'Under Budget', isPositive: true }
              : undefined
          }
          delay={3}
        />
        <StatsCard
          title='Total Beneficiaries'
          value={totalBeneficiaries.toLocaleString()}
          icon={<Users className='h-5 w-5' />}
          trend={
            totalBeneficiaries > 0
              ? {
                  value: `Impacting ${formattedProjects.reduce(
                    (sum, project) => sum + (project.kpis?.communities || 0),
                    0
                  )} communities`,
                  isPositive: true,
                }
              : undefined
          }
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
        <ProjectTimelineChart projects={formattedProjects} />
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className='bg-background rounded-lg border shadow-sm'>
          <FilterableTable
            data={formattedProjects}
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
