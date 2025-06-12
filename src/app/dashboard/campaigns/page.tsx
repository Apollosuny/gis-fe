'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { FilterableTable } from '@/components/ui/filterable-table';
import { Target, Users, TrendingUp, Calendar, Plus, Mail } from 'lucide-react';
import { useState } from 'react';
import { Campaign, useGetCampaigns } from '@/lib/hooks/use-campaigns';

// Prepare campaign data for the table
interface CampaignTableItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  target: number;
  raised: number;
  donors: number;
  status: string;
}

const CampaignsPage = () => {
  const { data: campaigns, isLoading, isError } = useGetCampaigns();

  // Transform API data to table format
  const campaignsData: CampaignTableItem[] = campaigns?.map(
    (campaign: Campaign) => {
      const totalRaised =
        campaign.donations?.reduce(
          (sum: number, donation: { amount: number }) => sum + donation.amount,
          0
        ) || 0;

      return {
        id: campaign.id,
        name: campaign.name,
        startDate: new Date(campaign.start_date).toLocaleDateString(),
        endDate: new Date(campaign.end_date).toLocaleDateString(),
        target: campaign.target_amount,
        raised: totalRaised,
        donors: campaign.donations?.length || 0,
        status: campaign.status.toLowerCase(),
      };
    }
  ) || [
    // Fallback data for preview when no campaigns are loaded
    {
      id: '1',
      name: 'Clean Water Initiative',
      startDate: '2025-01-15',
      endDate: '2025-07-15',
      target: 50000,
      raised: 42500,
      donors: 215,
      status: 'active',
    },
    {
      id: '2',
      name: 'Education for All',
      startDate: '2025-03-01',
      endDate: '2025-09-01',
      target: 75000,
      raised: 48750,
      donors: 342,
      status: 'active',
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

  // Calculate summary stats with proper typing
  const totalTargetAmount = campaignsData.reduce(
    (acc: number, campaign: CampaignTableItem) => acc + campaign.target,
    0
  );
  const totalRaisedAmount = campaignsData.reduce(
    (acc: number, campaign: CampaignTableItem) => acc + campaign.raised,
    0
  );
  const totalDonors = campaignsData.reduce(
    (acc: number, campaign: CampaignTableItem) => acc + campaign.donors,
    0
  );
  const activeCampaigns = campaignsData.filter(
    (campaign: CampaignTableItem) => campaign.status === 'active'
  ).length;
  const columns = [
    {
      key: 'name',
      title: 'Campaign Name',
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
      key: 'target',
      title: 'Target Amount',
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'raised',
      title: 'Amount Raised',
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
                  Math.round((value / item.target) * 100)
                )}%`,
              }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>
            {Math.round((value / item.target) * 100)}%
          </span>
        </div>
      ),
    },
    {
      key: 'donors',
      title: 'Donors',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => {
        const statusClasses = {
          active:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          completed:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          planned:
            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        };
        const status = value as keyof typeof statusClasses;

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusClasses[status]}`}
          >
            {value}
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
            <Mail size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      column: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Planned', value: 'planned' },
      ],
    },
  ];

  return (
    <div className='space-y-8 py-8'>
      <PageHeader
        title='Fundraising Campaigns'
        subtitle='Create, manage and track all your fundraising campaigns'
        action={
          <button className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'>
            <Plus className='mr-2 h-4 w-4' /> New Campaign
          </button>
        }
      />

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Target'
          value={formatCurrency(totalTargetAmount)}
          icon={<Target className='h-5 w-5' />}
          delay={1}
        />
        <StatsCard
          title='Total Raised'
          value={formatCurrency(totalRaisedAmount)}
          description={`${Math.round(
            (totalRaisedAmount / totalTargetAmount) * 100
          )}% of total target`}
          icon={<TrendingUp className='h-5 w-5' />}
          trend={{ value: '+12% this month', isPositive: true }}
          delay={2}
        />
        <StatsCard
          title='Total Donors'
          value={totalDonors}
          icon={<Users className='h-5 w-5' />}
          trend={{ value: '+24 this week', isPositive: true }}
          delay={3}
        />
        <StatsCard
          title='Active Campaigns'
          value={activeCampaigns}
          icon={<Calendar className='h-5 w-5' />}
          delay={4}
        />
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className='bg-background rounded-lg border shadow-sm'>
          <FilterableTable
            data={campaignsData}
            columns={columns}
            initialSortColumn='startDate'
            initialSortDirection='desc'
            filterOptions={filterOptions}
            onRowClick={(campaign) =>
              console.log('Clicked campaign:', campaign)
            }
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignsPage;
