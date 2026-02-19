'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { ThemeToggle } from './ThemeToggle';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
}

export function Header({ 
  title, 
  subtitle, 
  onAddTask, 
  searchQuery, 
  onSearchChange,
  onMenuClick 
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-4 md:py-6 md:px-8 border-b border-border"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden rounded-full w-10 h-10 hover:bg-secondary"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Toggle */}
        <div className="relative flex-1 sm:flex-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden rounded-full w-10 h-10 hover:bg-secondary"
          >
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Desktop Search */}
          <div className={cn(
            "absolute sm:relative top-full right-0 mt-2 sm:mt-0 w-[calc(100vw-2rem)] sm:w-64",
            "sm:block",
            isSearchOpen ? "block" : "hidden"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                autoFocus={isSearchOpen}
              />
            </div>
          </div>
        </div>

        {/* Theme Toggle - Hidden on mobile when search is open */}
        <div className={cn(isSearchOpen ? "hidden sm:block" : "block")}>
          <ThemeToggle />
        </div>

        {/* Notification Bell - Hidden on mobile when search is open */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-10 h-10 hover:bg-secondary relative",
            isSearchOpen ? "hidden sm:inline-flex" : "inline-flex"
          )}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Add Task Button - Hidden on mobile when search is open */}
        <Button
          onClick={onAddTask}
          className={cn(
            "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20",
            isSearchOpen ? "hidden sm:flex" : "flex"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Task</span>
        </Button>
      </div>
    </motion.header>
  );
}