import { Bell, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isCollapsed: boolean;
}

export function Header({ isCollapsed }: HeaderProps) {
  return (
    <motion.div
      className={cn(
        'fixed top-0 right-0 z-10 h-16 border-b border-border bg-background flex items-center justify-between px-6',
        isCollapsed ? 'left-16' : 'left-64'
      )}
      initial={false}
      animate={{ left: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className='flex items-center gap-2'>
        <div className='relative flex items-center'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <input
            type='search'
            placeholder='Search...'
            className='h-9 rounded-md border border-input bg-transparent pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring'
          />
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <button className='rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground'>
          <Bell className='h-5 w-5' />
        </button>
        <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
          <User className='h-5 w-5' />
        </div>
      </div>
    </motion.div>
  );
}
