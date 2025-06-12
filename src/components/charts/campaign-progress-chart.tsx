'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Campaign {
  id: string;
  name: string;
  targetAmount: number;
  raisedAmount: number;
  progressPercentage: number;
}

interface CampaignProgressProps {
  className?: string;
  campaigns?: Campaign[];
}

export function CampaignProgressChart({
  className,
  campaigns,
}: CampaignProgressProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default mock campaigns if no data provided
  const campaignData = campaigns || [
    {
      id: '1',
      name: 'Clean Water Initiative',
      targetAmount: 100000,
      raisedAmount: 85000,
      progressPercentage: 85,
    },
    {
      id: '2',
      name: 'Education for All',
      targetAmount: 80000,
      raisedAmount: 52000,
      progressPercentage: 65,
    },
    {
      id: '3',
      name: 'Health Services',
      targetAmount: 120000,
      raisedAmount: 110400,
      progressPercentage: 92,
    },
    {
      id: '4',
      name: 'Community Development',
      targetAmount: 90000,
      raisedAmount: 67500,
      progressPercentage: 75,
    },
    {
      id: '5',
      name: 'Food Security Program',
      targetAmount: 70000,
      raisedAmount: 31500,
      progressPercentage: 45,
    },
  ];

  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        dataLabels: {
          position: 'top' as const,
        },
      },
    },
    colors: ['#10B981'], // green
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val + '%';
      },
      offsetX: 20,
      style: {
        fontSize: '12px',
        colors: mounted
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? ['#e5e7eb']
            : ['#374151']
          : ['#374151'],
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + '%';
        },
      },
    },
    xaxis: {
      categories: campaignData.map((c) => c.name),
      labels: {
        style: {
          colors: mounted
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#94a3b8'
              : '#6b7280'
            : '#6b7280',
        },
      },
    },
    yaxis: {
      max: 100,
      labels: {
        style: {
          colors: mounted
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#94a3b8'
              : '#6b7280'
            : '#6b7280',
        },
      },
    },
    grid: {
      borderColor: mounted
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '#334155'
          : '#e5e7eb'
        : '#e5e7eb',
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const series = [
    {
      name: 'Progress',
      data: campaignData.map((c) => c.progressPercentage),
    },
  ];

  // Don't render until mounted to prevent hydration issues
  if (!mounted) return <div className={`h-[350px] ${className}`} />;

  return (
    <div className={className}>
      <Chart options={options} series={series} type='bar' height='350' />
    </div>
  );
}
