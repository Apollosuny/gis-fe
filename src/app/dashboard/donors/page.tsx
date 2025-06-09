'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { FilterableTable } from '@/components/ui/filterable-table';
import {
  Users,
  TrendingUp,
  UserPlus,
  DollarSign,
  ArrowUpRight,
  Mail,
  Phone,
  Plus,
} from 'lucide-react';

// Mock donors data
const donorsData = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    totalDonated: 5200,
    lastDonation: '2025-05-28',
    donationCount: 8,
    type: 'individual',
    status: 'active',
  },
  {
    id: '2',
    firstName: 'ABC',
    lastName: 'Corporation',
    email: 'contact@abccorp.com',
    phone: '+1 (555) 987-6543',
    totalDonated: 25000,
    lastDonation: '2025-06-02',
    donationCount: 3,
    type: 'corporate',
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.j@example.com',
    phone: '+1 (555) 234-5678',
    totalDonated: 850,
    lastDonation: '2025-05-15',
    donationCount: 2,
    type: 'individual',
    status: 'active',
  },
  {
    id: '4',
    firstName: 'Tech',
    lastName: 'Innovate Inc.',
    email: 'donations@techinnovate.com',
    phone: '+1 (555) 876-5432',
    totalDonated: 15000,
    lastDonation: '2025-04-22',
    donationCount: 1,
    type: 'corporate',
    status: 'active',
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@example.com',
    phone: '+1 (555) 345-6789',
    totalDonated: 3200,
    lastDonation: '2025-05-30',
    donationCount: 6,
    type: 'individual',
    status: 'active',
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 456-7890',
    totalDonated: 2150,
    lastDonation: '2025-06-01',
    donationCount: 4,
    type: 'individual',
    status: 'active',
  },
  {
    id: '7',
    firstName: 'Global',
    lastName: 'Foundation',
    email: 'info@globalfoundation.org',
    phone: '+1 (555) 765-4321',
    totalDonated: 35000,
    lastDonation: '2025-05-20',
    donationCount: 5,
    type: 'organization',
    status: 'active',
  },
  {
    id: '8',
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'robert.d@example.com',
    phone: '+1 (555) 567-8901',
    totalDonated: 1800,
    lastDonation: '2025-04-15',
    donationCount: 3,
    type: 'individual',
    status: 'inactive',
  },
  {
    id: '9',
    firstName: 'Community',
    lastName: 'Trust',
    email: 'grants@communitytrust.org',
    phone: '+1 (555) 654-3210',
    totalDonated: 28000,
    lastDonation: '2025-03-28',
    donationCount: 2,
    type: 'organization',
    status: 'active',
  },
  {
    id: '10',
    firstName: 'Jessica',
    lastName: 'Wilson',
    email: 'jessica.w@example.com',
    phone: '+1 (555) 678-9012',
    totalDonated: 950,
    lastDonation: '2025-05-25',
    donationCount: 1,
    type: 'individual',
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

// Calculate summary stats
const activeDonors = donorsData.filter(
  (donor) => donor.status === 'active'
).length;
const totalDonated = donorsData.reduce(
  (acc, donor) => acc + donor.totalDonated,
  0
);
const individualDonors = donorsData.filter(
  (donor) => donor.type === 'individual'
).length;
const corporateDonors = donorsData.filter(
  (donor) => donor.type === 'corporate' || donor.type === 'organization'
).length;
const averageDonation =
  totalDonated /
  donorsData.reduce((acc, donor) => acc + donor.donationCount, 0);

export default function DonorsPage() {
  const columns = [
    {
      key: 'fullName' as any,
      title: 'Donor Name',
      sortable: true,
      render: (value: any, item: any) => `${item.firstName} ${item.lastName}`,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      title: 'Phone',
      sortable: true,
    },
    {
      key: 'totalDonated',
      title: 'Total Donated',
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'lastDonation',
      title: 'Last Donation',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'donationCount',
      title: 'Donations',
      sortable: true,
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value: string) => {
        const typeClasses = {
          individual:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          corporate:
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          organization:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        };
        const type = value as keyof typeof typeClasses;

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium capitalize ${typeClasses[type]}`}
          >
            {value}
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
            <Mail size={16} />
          </button>
          <button className='p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20'>
            <Phone size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      column: 'type',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Organization', value: 'organization' },
      ],
    },
    {
      column: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ];

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

  return (
    <div className='space-y-8 py-8'>
      <PageHeader
        title='Donor Management'
        subtitle='Manage donor profiles and track donation history'
        action={
          <button className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90'>
            <Plus className='mr-2 h-4 w-4' /> Add Donor
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
          title='Active Donors'
          value={activeDonors}
          icon={<Users className='h-5 w-5' />}
          trend={{ value: '+5 this month', isPositive: true }}
          delay={1}
        />
        <StatsCard
          title='Total Donations'
          value={formatCurrency(totalDonated)}
          icon={<DollarSign className='h-5 w-5' />}
          trend={{ value: '+8% this quarter', isPositive: true }}
          delay={2}
        />
        <StatsCard
          title='Individual Donors'
          value={individualDonors}
          description={`${Math.round(
            (individualDonors / activeDonors) * 100
          )}% of all donors`}
          icon={<UserPlus className='h-5 w-5' />}
          delay={3}
        />
        <StatsCard
          title='Average Donation'
          value={formatCurrency(Math.round(averageDonation))}
          icon={<TrendingUp className='h-5 w-5' />}
          delay={4}
        />
      </motion.div>

      {/* Donors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className='bg-background rounded-lg border shadow-sm'>
          <FilterableTable
            data={donorsData}
            columns={columns}
            initialSortColumn='lastDonation'
            initialSortDirection='desc'
            filterOptions={filterOptions}
            searchable={true}
            onRowClick={(donor) => console.log('Clicked donor:', donor)}
          />
        </div>
      </motion.div>
    </div>
  );
}
