'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProjectBudgetProps {
  className?: string;
}

export function ProjectBudgetChart({ className }: ProjectBudgetProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = {
    chart: {
      type: 'radar' as const,
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.2,
      },
    },
    colors: ['#3B82F6', '#EF4444'],
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      categories: [
        'Admin',
        'Operations',
        'Marketing',
        'Development',
        'Research',
        'Training',
        'Materials',
      ],
      labels: {
        style: {
          colors: Array(7).fill(
            mounted
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? '#94a3b8'
                : '#6b7280'
              : '#6b7280'
          ),
          fontSize: '12px',
        },
      },
    },
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
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return '$' + val.toLocaleString();
        },
      },
    },
  };

  const series = [
    {
      name: 'Budget Allocated',
      data: [35000, 48000, 25000, 38000, 20000, 15000, 25000],
    },
    {
      name: 'Actual Spent',
      data: [32000, 45000, 27000, 35000, 18000, 14000, 22000],
    },
  ];

  // Don't render until mounted to prevent hydration issues
  if (!mounted) return <div className={`h-[350px] ${className}`} />;

  return (
    <div className={className}>
      <Chart options={options} series={series} type='radar' height='350' />
    </div>
  );
}
