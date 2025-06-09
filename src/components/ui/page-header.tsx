'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-3xl font-bold'>{title}</h1>
        {subtitle && <p className='text-muted-foreground mt-1'>{subtitle}</p>}
      </motion.div>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
