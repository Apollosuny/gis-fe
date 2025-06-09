'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProjectTimelineProps {
  className?: string;
}

export function ProjectTimelineChart({ className }: ProjectTimelineProps) {
  // State to handle SSR and hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = {
    chart: {
      height: 350,
      type: 'rangeBar' as const,
      fontFamily: 'inherit',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
        borderRadius: 4,
      },
    },
    xaxis: {
      type: 'datetime' as const,
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
      row: {
        colors: ['transparent'],
      },
    },
    fill: {
      type: 'solid',
      opacity: 0.9,
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      labels: {
        colors: mounted
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? '#e5e7eb'
            : '#4b5563'
          : '#4b5563',
      },
    },
    tooltip: {
      /* eslint-disable-next-line */
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const startDate = new Date(data.x).toLocaleDateString();
        const endDate = new Date(data.x2).toLocaleDateString();

        return `
          <div class="p-2 bg-background">
            <div class="font-medium">${data.y}</div>
            <div class="text-xs text-muted-foreground">${startDate} to ${endDate}</div>
            <div class="text-xs text-muted-foreground">Status: ${data.status}</div>
          </div>
        `;
      },
    },
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
  };

  // Current date for reference
  const now = new Date();
  const currentYear = now.getFullYear();

  const series = [
    {
      name: 'Projects',
      data: [
        {
          x: 'Clean Water Project',
          y: [
            new Date(currentYear, 0, 1).getTime(),
            new Date(currentYear, 5, 30).getTime(),
          ],
          status: 'In Progress',
          fillColor: '#10B981', // green
        },
        {
          x: 'School Renovation',
          y: [
            new Date(currentYear, 2, 1).getTime(),
            new Date(currentYear, 7, 31).getTime(),
          ],
          status: 'In Progress',
          fillColor: '#10B981', // green
        },
        {
          x: 'Medical Camp',
          y: [
            new Date(currentYear - 1, 9, 1).getTime(),
            new Date(currentYear - 1, 11, 31).getTime(),
          ],
          status: 'Completed',
          fillColor: '#3B82F6', // blue
        },
        {
          x: 'Food Distribution',
          y: [
            new Date(currentYear, 4, 1).getTime(),
            new Date(currentYear, 8, 30).getTime(),
          ],
          status: 'Planning',
          fillColor: '#F59E0B', // amber
        },
        {
          x: 'Community Center',
          y: [
            new Date(currentYear, 6, 1).getTime(),
            new Date(currentYear + 1, 2, 31).getTime(),
          ],
          status: 'Planning',
          fillColor: '#F59E0B', // amber
        },
        {
          x: 'Educational Scholarship',
          y: [
            new Date(currentYear - 1, 6, 1).getTime(),
            new Date(currentYear, 5, 31).getTime(),
          ],
          status: 'In Progress',
          fillColor: '#10B981', // green
        },
        {
          x: 'Healthcare Initiative',
          y: [
            new Date(currentYear, 8, 1).getTime(),
            new Date(currentYear + 1, 1, 28).getTime(),
          ],
          status: 'Upcoming',
          fillColor: '#8B5CF6', // purple
        },
      ],
    },
  ];

  // Don't render until mounted to prevent hydration issues
  if (!mounted) return <div className={`h-[350px] ${className}`} />;

  return (
    <div className={className}>
      <Chart options={options} series={series} type='rangeBar' height='350' />
    </div>
  );
}
