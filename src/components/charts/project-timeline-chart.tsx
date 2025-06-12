'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';

// Dynamic import to prevent SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProjectData {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  budget?: number;
  spent?: number;
  teamSize?: number;
  completion?: number;
  kpis?: {
    beneficiaries: number;
    communities: number;
  };
}

interface ProjectTimelineProps {
  className?: string;
  projects?: ProjectData[];
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

        try {
          // Format dates using Luxon - properly handling timestamps
          const startTimestamp = data.y[0];
          const endTimestamp = data.y[1];

          // Ensure timestamps are valid numbers
          const validStartTimestamp =
            typeof startTimestamp === 'number'
              ? startTimestamp
              : Number(startTimestamp);
          const validEndTimestamp =
            typeof endTimestamp === 'number'
              ? endTimestamp
              : Number(endTimestamp);

          // Check if timestamps are valid
          if (isNaN(validStartTimestamp) || isNaN(validEndTimestamp)) {
            throw new Error('Invalid timestamp values');
          }

          const startDate = DateTime.fromMillis(validStartTimestamp)
            .setLocale('en-US')
            .toFormat('LLL dd, yyyy');
          const endDate = DateTime.fromMillis(validEndTimestamp)
            .setLocale('en-US')
            .toFormat('LLL dd, yyyy');

          return `
            <div class="p-2 bg-background">
              <div class="font-medium">${data.x}</div>
              <div class="text-xs text-muted-foreground">${startDate} to ${endDate}</div>
              <div class="text-xs text-muted-foreground">Status: ${
                data.status
              }</div>
              ${
                data.completion !== undefined
                  ? `<div class="text-xs text-muted-foreground">Completion: ${data.completion}%</div>`
                  : ''
              }
            </div>
          `;
        } catch (err) {
          console.error('Error formatting timeline dates:', err);
          return `<div class="p-2 bg-background">
            <div class="font-medium">${data.x}</div>
            <div class="text-xs text-muted-foreground">Date error</div>
          </div>`;
        }
      },
    },
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
  };

  // Helper function to get color based on status
  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === 'completed') return '#3B82F6'; // blue
    if (status === 'active' || status === 'in-progress') return '#10B981'; // green
    if (status === 'planned' || status === 'planning') return '#F59E0B'; // amber
    if (status === 'at-risk') return '#EF4444'; // red
    return '#8B5CF6'; // purple for other statuses
  };

  // Process project data for timeline
  const projectData = projects
    ? projects.map((project) => {
        try {
          // Make sure dates are parsed correctly
          const startDate = project.startDate || project.start_date || '';
          const endDate = project.endDate || project.end_date || '';

          console.log('Project:', project.name);
          console.log('Raw dates:', { startDate, endDate });

          // Try parsing with Luxon in different formats
          let startDateTime = DateTime.fromISO(startDate);
          if (!startDateTime.isValid) {
            startDateTime = DateTime.fromFormat(startDate, 'yyyy-MM-dd');
          }
          if (!startDateTime.isValid) {
            startDateTime = DateTime.fromFormat(
              startDate,
              "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            );
          }

          let endDateTime = DateTime.fromISO(endDate);
          if (!endDateTime.isValid) {
            endDateTime = DateTime.fromFormat(endDate, 'yyyy-MM-dd');
          }
          if (!endDateTime.isValid) {
            endDateTime = DateTime.fromFormat(
              endDate,
              "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            );
          }

          console.log('Parsed dates valid?', {
            startValid: startDateTime.isValid,
            endValid: endDateTime.isValid,
          });

          // Fallback to JavaScript Date if Luxon parsing fails
          const startTimestamp = startDateTime.isValid
            ? startDateTime.toMillis()
            : new Date(startDate).getTime();

          const endTimestamp = endDateTime.isValid
            ? endDateTime.toMillis()
            : new Date(endDate).getTime();

          return {
            x: project.name,
            y: [startTimestamp, endTimestamp],
            status: project.status.replace('-', ' '),
            fillColor: getStatusColor(project.status),
            completion: project.completion,
          };
        } catch (err) {
          console.error(`Error processing project ${project.name}:`, err);
          // Return a fallback with current date if there's an error
          const now = DateTime.now();
          return {
            x: project.name,
            y: [
              now.minus({ months: 1 }).toMillis(),
              now.plus({ months: 1 }).toMillis(),
            ],
            status: project.status.replace('-', ' '),
            fillColor: getStatusColor(project.status),
            completion: project.completion,
          };
        }
      })
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
