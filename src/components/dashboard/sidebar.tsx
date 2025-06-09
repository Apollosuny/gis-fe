import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard />,
      href: '/dashboard',
    },
    {
      title: 'Donor Management',
      icon: <Users />,
      href: '/dashboard/donors',
    },
    {
      title: 'Campaigns',
      icon: <TrendingUp />,
      href: '/dashboard/campaigns',
    },
    {
      title: 'Projects',
      icon: <FileText />,
      href: '/dashboard/projects',
    },
    {
      title: 'Finance',
      icon: <DollarSign />,
      href: '/dashboard/finance',
    },
    {
      title: 'HR Management',
      icon: <UserCog />,
      href: '/dashboard/hr',
    },
  ];

  return (
    <motion.div
      className={cn(
        'fixed left-0 top-0 z-20 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className='flex h-16 items-center justify-between px-4'>
        <AnimatePresence initial={false} mode='wait'>
          {!isCollapsed && (
            <motion.div
              key='logo'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='font-semibold text-xl'
            >
              GIS System
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleSidebar}
          className='rounded-full p-2 hover:bg-sidebar-accent'
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              isCollapsed && 'rotate-180'
            )}
          />
        </motion.button>
      </div>

      <div className='mt-4 px-2 space-y-1'>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
            >
              <span className='mr-3 h-5 w-5'>{item.icon}</span>
              <AnimatePresence initial={false} mode='wait'>
                {!isCollapsed && (
                  <motion.span
                    key={item.title}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className='whitespace-nowrap'
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
