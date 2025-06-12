'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface MonthlyDonorsComparisonProps {
  className?: string;
  data?: {
    currentYear: number;
    previousYear: number;
    currentYearData: number[];
    previousYearData: number[];
  };
}

export function MonthlyDonorsComparisonChart({
  className,
  data,
}: MonthlyDonorsComparisonProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = {
    chart: {
      type: 'bar' as const,
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#3B82F6', '#10B981'],
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
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
      title: {
        text: 'Number of Donors',
        style: {
          color: mounted
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#94a3b8'
              : '#6b7280'
            : '#6b7280',
        },
      },
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
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: {
        colors: mounted
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? '#e5e7eb'
            : '#4b5563'
          : '#4b5563',
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const series = data
    ? [
        {
          name: `${data.currentYear} Donors`,
          data: data.currentYearData,
        },
        {
          name: `${data.previousYear} Donors`,
          data: data.previousYearData,
        },
      ]
    : [
        {
          name: 'Current Year Donors',
          data: [120, 145, 165, 132, 175, 215, 245, 255, 272, 280, 295, 310],
        },
        {
          name: 'Previous Year Donors',
          data: [350, 365, 375, 380, 395, 415, 425, 440, 450, 465, 480, 495],
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
