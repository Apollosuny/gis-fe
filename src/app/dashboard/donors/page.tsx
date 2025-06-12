'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { FilterableTable } from '@/components/ui/filterable-table';
import {
  Users,
  TrendingUp,
  UserPlus,
  DollarSign,
  Mail,
  Phone,
  Plus,
  Loader2,
} from 'lucide-react';
import { useGetDonors } from '@/lib/hooks/use-donors';

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

interface FormattedDonor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  totalDonated: number;
  lastDonation: string;
  donationCount: number;
  type: string;
  status: string;
}

export default function DonorsPage() {
  const { data: donors, isLoading, error } = useGetDonors();
  const [formattedDonors, setFormattedDonors] = useState<FormattedDonor[]>([]);
  const [activeDonorsCount, setActiveDonorsCount] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [individualDonorsCount, setIndividualDonorsCount] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);

  useEffect(() => {
    if (donors) {
      // Format the donor data from API to match our table structure
      const formatted = donors.map((donor: any) => {
        // Calculate total donated amount for this donor
        const total = donor.donations.reduce(
          (sum: number, donation: any) => sum + donation.amount,
          0
        );

        // Get the most recent donation date
        let lastDonationDate = '';
        if (donor.donations.length > 0) {
          const sortedDonations = [...donor.donations].sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          lastDonationDate = sortedDonations[0].date;
        }

        // Split name into first and last name
        const nameParts = donor.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // All donors from API are considered active for this example
        // In a real application, you might have a status field
        return {
          id: donor.id,
          firstName,
          lastName,
          email: donor.email || '',
          phone: donor.phone || '',
          totalDonated: total,
          lastDonation: lastDonationDate || new Date().toISOString(),
          donationCount: donor.donations.length,
          type: donor.type.toLowerCase(),
          status: 'active',
        };
      });

      setFormattedDonors(formatted);

      // Calculate summary statistics
      const activeDonors = formatted.filter(
        (donor: FormattedDonor) => donor.status === 'active'
      ).length;
      setActiveDonorsCount(activeDonors);

      const totalAmount = formatted.reduce(
        (sum: number, donor: FormattedDonor) => sum + donor.totalDonated,
        0
      );
      setTotalDonated(totalAmount);

      const individualDonors = formatted.filter(
        (donor: FormattedDonor) => donor.type === 'individual'
      ).length;
      setIndividualDonorsCount(individualDonors);

      const totalDonationCount = formatted.reduce(
        (sum: number, donor: FormattedDonor) => sum + donor.donationCount,
        0
      );
      setAverageDonation(
        totalDonationCount > 0 ? totalAmount / totalDonationCount : 0
      );
    }
  }, [donors]);

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
          Error loading donors data. Please try again later.
        </p>
      </div>
    );
  }

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
          value={activeDonorsCount}
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
          value={individualDonorsCount}
          description={
            activeDonorsCount > 0
              ? `${Math.round(
                  (individualDonorsCount / activeDonorsCount) * 100
                )}% of all donors`
              : ''
          }
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
            data={formattedDonors}
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
