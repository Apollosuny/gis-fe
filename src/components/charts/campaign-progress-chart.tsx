'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CampaignProgressProps {
  className?: string;
}

export function CampaignProgressChart({ className }: CampaignProgressProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaigns = [
    { name: 'Clean Water Initiative', progress: 85 },
    { name: 'Education for All', progress: 65 },
    { name: 'Health Services', progress: 92 },
    { name: 'Community Development', progress: 75 },
    { name: 'Food Security Program', progress: 45 },
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
      categories: campaigns.map((c) => c.name),
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
      data: campaigns.map((c) => c.progress),
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
