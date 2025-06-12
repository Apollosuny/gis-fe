'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProjectTimelineProps {
  className?: string;
  projects?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  }[];
}

export function ProjectTimelineChart({
  className,
  projects,
}: ProjectTimelineProps) {
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

  // Helper function to get color based on status
  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === 'completed') return '#3B82F6'; // blue
    if (status === 'active' || status === 'in progress') return '#10B981'; // green
    if (status === 'planned' || status === 'planning') return '#F59E0B'; // amber
    return '#8B5CF6'; // purple for other statuses
  };

  // Process project data for timeline
  const projectData = projects
    ? projects.map((project) => ({
        x: project.name,
        y: [
          new Date(project.start_date).getTime(),
          new Date(project.end_date).getTime(),
        ],
        status: project.status,
        fillColor: getStatusColor(project.status),
      }))
    : [
        // Mock data if no real data provided
        {
          x: 'Clean Water Project',
          y: [new Date(2025, 0, 1).getTime(), new Date(2025, 5, 30).getTime()],
          status: 'In Progress',
          fillColor: '#10B981', // green
        },
        {
          x: 'School Renovation',
          y: [new Date(2025, 2, 1).getTime(), new Date(2025, 7, 31).getTime()],
          status: 'In Progress',
          fillColor: '#10B981', // green
        },
        {
          x: 'Medical Camp',
          y: [new Date(2024, 9, 1).getTime(), new Date(2024, 11, 31).getTime()],
          status: 'Completed',
          fillColor: '#3B82F6', // blue
        },
        {
          x: 'Food Distribution',
          y: [new Date(2025, 4, 1).getTime(), new Date(2025, 8, 30).getTime()],
          status: 'Planning',
          fillColor: '#F59E0B', // amber
        },
      ];

  const series = [
    {
      name: 'Projects',
      data: projectData,
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
