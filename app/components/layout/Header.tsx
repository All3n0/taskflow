'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Menu, Bell, X, Clock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { ThemeToggle } from './ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';
import { Task } from '../../types/task';
import { KazistackLogo } from '../KazistackLogo';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
  tasks?: Task[];
  onViewChange?: (view: string) => void;
  streakCount?: number;
  streakAlive?: boolean;
}

export function Header({
  title,
  subtitle,
  onAddTask,
  searchQuery,
  onSearchChange,
  onMenuClick,
  tasks = [],
  onViewChange,
  streakCount = 0,
  streakAlive = false,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  const now = new Date();

  const overdueTasks = tasks.filter(
    t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now
  );

  const dueSoonTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const diff = new Date(t.dueDate).getTime() - now.getTime();
    return diff > 0 && diff <= 30 * 60 * 1000;
  });

  const urgentTasks = tasks.filter(
    t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done'
  );

  const notifCount = overdueTasks.length + dueSoonTasks.length;

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-4 md:py-6 md:px-8 border-b border-border relative z-30"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden rounded-full w-10 h-10 hover:bg-secondary"
          data-testid="menu-button"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="lg:hidden">
          <KazistackLogo size={28} showText={false} />
        </div>
        
        <div className="hidden sm:block">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:flex-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(v => !v)}
            className="sm:hidden rounded-full w-10 h-10 hover:bg-secondary"
            data-testid="mobile-search-toggle"
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute sm:hidden top-full right-0 mt-2 w-[calc(100vw-2rem)] z-50 bg-background border border-border rounded-2xl shadow-xl p-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    data-testid="mobile-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-[10px] text-muted-foreground mt-2 px-1">
                    Showing results in All Tasks view
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden sm:block relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className={cn(isSearchOpen ? "hidden sm:block" : "block")}>
          <ThemeToggle />
        </div>

        {/* ── Streak badge — always visible ── */}
        {(() => {
          const n = streakCount;
          const alive = streakAlive;
          // Tier colours: 0=grey, 1-2=yellow, 3-6=orange, 7-13=red-orange, 14-29=red, 30+=purple
          const style =
            !alive || n === 0 ? 'bg-secondary text-slate-400 border-border' :
            n < 3             ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' :
            n < 7             ? 'bg-orange-400/15 text-orange-400 border-orange-400/30' :
            n < 14            ? 'bg-orange-600/15 text-orange-600 border-orange-600/30' :
            n < 30            ? 'bg-red-500/15 text-red-500 border-red-500/30' :
                                'bg-purple-500/15 text-purple-500 border-purple-500/30';
          const tip =
            n === 0    ? 'Start your streak — complete a task!' :
            !alive     ? 'Complete a task to keep your streak!' :
            n < 3      ? `${n} day streak — keep going!` :
            n < 7      ? `${n} day streak 🔥` :
            n < 14     ? `${n} day streak 🔥🔥` :
            n < 30     ? `${n} day streak 🔥🔥🔥` :
                         `${n} day streak ⚡ Legendary!`;
          return (
            <motion.button
              onClick={() => onViewChange?.('dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={tip}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all',
                isSearchOpen ? 'hidden sm:flex' : 'flex',
                style
              )}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{n}</span>
            </motion.button>
          );
        })()}

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(v => !v)}
            className={cn(
              "rounded-full w-10 h-10 hover:bg-secondary relative",
              isSearchOpen ? "hidden sm:inline-flex" : "inline-flex"
            )}
            aria-label="Notifications"
            data-testid="notification-bell"
          >
            <Bell className={cn("w-5 h-5", notifOpen && "text-primary")} />
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center"
              >
                {notifCount > 9 ? '9+' : notifCount}
              </motion.span>
            )}
          </Button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                data-testid="notification-dropdown"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="font-black text-sm">Notifications</h3>
                  {notifCount > 0 && (
                    <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                      {notifCount} alert{notifCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {overdueTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
                        Overdue
                      </p>
                      {overdueTasks.slice(0, 5).map(task => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                          onClick={() => { setNotifOpen(false); onViewChange?.('tasks'); }}
                          data-testid={`notification-overdue-${task.id}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{task.title}</p>
                            <p className="text-xs text-destructive">Overdue · {task.priority} priority</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {dueSoonTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
                        Due Soon
                      </p>
                      {dueSoonTasks.map(task => {
                        const diffMins = Math.round((new Date(task.dueDate!).getTime() - now.getTime()) / 60000);
                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                            onClick={() => { setNotifOpen(false); onViewChange?.('tasks'); }}
                            data-testid={`notification-duesoon-${task.id}`}
                          >
                            <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-yellow-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{task.title}</p>
                              <p className="text-xs text-yellow-500">Due in {diffMins} min</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {urgentTasks.length > 0 && overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
                        High Priority
                      </p>
                      {urgentTasks.slice(0, 4).map(task => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                          onClick={() => { setNotifOpen(false); onViewChange?.('tasks'); }}
                          data-testid={`notification-urgent-${task.id}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{task.priority} priority · {task.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {overdueTasks.length === 0 && dueSoonTasks.length === 0 && urgentTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm font-semibold">All clear!</p>
                      <p className="text-xs">No urgent notifications</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 px-4 py-2.5">
                  <button
                    onClick={() => { setNotifOpen(false); onViewChange?.('notifications'); }}
                    className="w-full text-xs font-bold text-primary hover:text-primary/80 transition-colors text-center"
                    data-testid="notification-settings-link"
                  >
                    Manage notification settings →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Task */}
        <Button
          onClick={onAddTask}
          className={cn(
            "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20",
            isSearchOpen ? "hidden sm:flex" : "flex"
          )}
          data-testid="add-task-button"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Task</span>
        </Button>
      </div>
    </motion.header>
  );
}