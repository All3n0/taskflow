'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../providers/theme-provider';
import { cn } from '../utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-7 rounded-full p-1 transition-colors duration-300",
        theme === 'dark' 
          ? 'bg-primary/20 hover:bg-primary/30' 
          : 'bg-secondary hover:bg-secondary/80',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-background shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          x: theme === 'dark' ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-primary" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
      
      {/* Background dots */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className="w-3 h-3 text-muted-foreground" />
        <Moon className="w-3 h-3 text-muted-foreground" />
      </div>
    </button>
  );
}