'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  delay = 0,
}: StatsCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <div className='flex items-baseline gap-2'>
            <motion.h3
              initial={{ scale: 0.5, opacity: 0 }}
              animate={
                isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }
              }
              transition={{
                duration: 0.6,
                delay: delay * 0.1 + 0.2,
                type: 'spring',
                stiffness: 100,
              }}
              className='text-2xl font-bold'
            >
              {value}
            </motion.h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
          )}
        </div>
        <div className='rounded-full p-2 bg-primary/10 text-primary'>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
