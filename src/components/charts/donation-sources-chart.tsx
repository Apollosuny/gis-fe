'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonationSourcesProps {
  className?: string;
  data?: {
    method: string;
    amount: number;
    percentage: number;
  }[];
}

export function DonationSourcesChart({
  className,
  data,
}: DonationSourcesProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Process the data for the chart
  const sourceData = data || [
    { method: 'Online', amount: 42000, percentage: 42 },
    { method: 'Bank Transfer', amount: 28000, percentage: 28 },
    { method: 'Corporate', amount: 15000, percentage: 15 },
    { method: 'Events', amount: 10000, percentage: 10 },
    { method: 'Other', amount: 5000, percentage: 5 },
  ];

  const options = {
    chart: {
      type: 'donut' as const,
      fontFamily: 'inherit',
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    labels: sourceData.map((item) => item.method),
    legend: {
      position: 'bottom' as const,
      fontSize: '14px',
      labels: {
        colors: mounted
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? '#e5e7eb'
            : '#4b5563'
          : '#4b5563',
      },
      itemMargin: {
        horizontal: 12,
        vertical: 5,
      },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'inherit',
      },
      formatter: function (val: string) {
        return val + '%';
      },
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + '%';
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
            },
            value: {
              show: true,
              fontSize: '20px',
              formatter: function (val: string) {
                return val + '%';
              },
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function () {
                return '100%';
              },
            },
          },
        },
      },
    },
  };

  const series = sourceData.map((item) => item.percentage);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) return <div className={`h-[350px] ${className}`} />;

  return (
    <div className={className}>
      <Chart options={options} series={series} type='donut' height='350' />
    </div>
  );
}
