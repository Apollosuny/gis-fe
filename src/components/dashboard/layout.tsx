'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className='min-h-screen bg-background'>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <Header isCollapsed={isCollapsed} />
      <motion.main
        className={cn('pt-16 pb-8 px-6', isCollapsed ? 'ml-16' : 'ml-64')}
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className='mx-auto container max-w-7xl'>{children}</div>
      </motion.main>
    </div>
  );
}
