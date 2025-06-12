'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { DonationTrendsChart } from '@/components/charts/donation-trends-chart';
import { CampaignProgressChart } from '@/components/charts/campaign-progress-chart';
import { DonationSourcesChart } from '@/components/charts/donation-sources-chart';
import { ProjectBudgetChart } from '@/components/charts/project-budget-chart';
import { MonthlyDonorsComparisonChart } from '@/components/charts/monthly-donors-comparison-chart';
import { ProjectTimelineChart } from '@/components/charts/project-timeline-chart';
import { useGetDashboardData } from '@/lib/hooks/use-dashboard';

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useGetDashboardData();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsItems = [
    {
      title: 'Total Donations',
      value: dashboardData
        ? formatCurrency(dashboardData.stats.totalDonations)
        : '-',
      percentChange: '+14%', // Could calculate this from historical data
      icon: <DollarSign />,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      title: 'Active Campaigns',
      value: dashboardData
        ? dashboardData.stats.activeCampaigns.toString()
        : '-',
      percentChange: '+3', // Could calculate this from historical data
      icon: <TrendingUp />,
      iconBg:
        'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    },
    {
      title: 'Total Donors',
      value: dashboardData
        ? dashboardData.stats.totalDonors.toLocaleString()
        : '-',
      percentChange: '+8%', // Could calculate this from historical data
      icon: <Users />,
      iconBg:
        'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      title: 'Active Projects',
      value: dashboardData
        ? dashboardData.stats.activeProjects.toString()
        : '-',
      percentChange: '+2', // Could calculate this from historical data
      icon: <Activity />,
      iconBg:
        'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    },
  ];

  return (
    <div className='space-y-8 py-8'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <h1 className='text-3xl font-bold mb-8'>Dashboard</h1>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {statsItems.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {stat.title}
                  </p>
                  <div className='flex items-baseline gap-2'>
                    <h3 className='text-2xl font-bold'>{stat.value}</h3>
                    <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                      {stat.percentChange}
                    </span>
                  </div>
                </div>
                <div className={`rounded-full p-2 ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Donation Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className='rounded-lg border bg-card p-6 shadow-sm'
      >
        <h2 className='font-semibold text-lg mb-4'>Annual Donation Trends</h2>
        {dashboardData ? (
          <DonationTrendsChart data={dashboardData.chartData.donationTrends} />
        ) : (
          <div className='h-[350px] flex items-center justify-center'>
            {isLoading
              ? 'Loading...'
              : error
              ? 'Failed to load data'
              : 'No data available'}
          </div>
        )}
      </motion.div>

      {/* Two column layout for charts */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='rounded-lg border bg-card p-6 shadow-sm'
        >
          <h2 className='font-semibold text-lg mb-4'>Campaign Progress</h2>
          {dashboardData ? (
            <CampaignProgressChart campaigns={dashboardData.campaignsData} />
          ) : (
            <div className='h-[350px] flex items-center justify-center'>
              {isLoading
                ? 'Loading...'
                : error
                ? 'Failed to load data'
                : 'No data available'}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='rounded-lg border bg-card p-6 shadow-sm'
        >
          <h2 className='font-semibold text-lg mb-4'>Donation Sources</h2>
          {dashboardData ? (
            <DonationSourcesChart
              data={dashboardData.chartData.donationSources}
            />
          ) : (
            <div className='h-[350px] flex items-center justify-center'>
              {isLoading
                ? 'Loading...'
                : error
                ? 'Failed to load data'
                : 'No data available'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Two column layout for more charts */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='rounded-lg border bg-card p-6 shadow-sm'
        >
          <h2 className='font-semibold text-lg mb-4'>
            Project Budget by Category
          </h2>
          {dashboardData ? (
            <ProjectBudgetChart data={dashboardData.chartData.projectBudget} />
          ) : (
            <div className='h-[350px] flex items-center justify-center'>
              {isLoading
                ? 'Loading...'
                : error
                ? 'Failed to load data'
                : 'No data available'}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='rounded-lg border bg-card p-6 shadow-sm'
        >
          <h2 className='font-semibold text-lg mb-4'>
            Monthly Donor Comparison
          </h2>
          {dashboardData ? (
            <MonthlyDonorsComparisonChart
              data={dashboardData.chartData.monthlyDonorsComparison}
            />
          ) : (
            <div className='h-[350px] flex items-center justify-center'>
              {isLoading
                ? 'Loading...'
                : error
                ? 'Failed to load data'
                : 'No data available'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Project Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className='rounded-lg border bg-card p-6 shadow-sm'
      >
        <h2 className='font-semibold text-lg mb-4'>Project Timeline</h2>
        {dashboardData ? (
          <ProjectTimelineChart
            projects={dashboardData.chartData.projectTimeline}
          />
        ) : (
          <div className='h-[350px] flex items-center justify-center'>
            {isLoading
              ? 'Loading...'
              : error
              ? 'Failed to load data'
              : 'No data available'}
          </div>
        )}
      </motion.div>

      {/* Original content in single row */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className='col-span-1 lg:col-span-2 rounded-lg border bg-card shadow-sm'
        >
          <div className='p-6'>
            <h2 className='font-semibold text-lg mb-4'>Recent Campaigns</h2>
            {dashboardData?.recentCampaigns ? (
              <div className='space-y-4'>
                {dashboardData.recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className='flex items-center justify-between border-b pb-4'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='size-10 rounded-md bg-muted flex items-center justify-center'>
                        <Calendar className='size-5 text-muted-foreground' />
                      </div>
                      <div>
                        <h4 className='font-medium'>{campaign.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          Target: {formatCurrency(campaign.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        {formatCurrency(campaign.raisedAmount)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {Math.round(campaign.progressPercentage)}% of goal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='h-[200px] flex items-center justify-center'>
                {isLoading
                  ? 'Loading...'
                  : error
                  ? 'Failed to load data'
                  : 'No campaigns available'}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className='rounded-lg border bg-card p-6 shadow-sm'
        >
          <h2 className='font-semibold text-lg mb-4'>Recent Donors</h2>
          {dashboardData?.recentDonors ? (
            <div className='space-y-4'>
              {dashboardData.recentDonors.map((donor) => (
                <div
                  key={donor.id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-4'>
                    <div className='size-8 rounded-full bg-muted flex items-center justify-center'>
                      <Users className='size-4 text-muted-foreground' />
                    </div>
                    <div>
                      <h4 className='font-medium'>{donor.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(donor.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className='font-medium text-green-600 dark:text-green-400'>
                    +{formatCurrency(donor.recentDonation)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className='h-[200px] flex items-center justify-center'>
              {isLoading
                ? 'Loading...'
                : error
                ? 'Failed to load data'
                : 'No donors available'}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
