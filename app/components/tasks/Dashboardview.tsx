'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfDay } from 'date-fns';
import {
  CheckCircle, Clock, AlertCircle, TrendingUp, Timer, Flame,
  Calendar, X, Flag, Tag, Edit, Trash2, AlertTriangle,
  CheckCircle2, Circle, Loader, Archive, Link2,
  Copy, Share2, Bookmark, Bell, Folder, User,
  Star, Printer, Mail, MessageCircle, MessageSquare, Trophy, Zap
} from 'lucide-react';
import {
  Task, Priority, Status,
  secondsToTimeDisplay, getTotalLoggedTime, isOverdue,
} from '../../types/task';
import { cn } from '../utils';
import { TaskDetailPopup } from './TaskDetailPopup';
import { useStreaks } from '../hooks/UseStreaks';

interface DashboardViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask?: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: 'text-muted-foreground', bg: 'bg-muted/50' },
  medium: { label: 'Medium', color: 'text-primary',          bg: 'bg-primary/10' },
  high:   { label: 'High',   color: 'text-yellow-500',       bg: 'bg-yellow-500/10' },
  urgent: { label: 'Urgent', color: 'text-destructive',      bg: 'bg-destructive/10' },
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  backlog:       { label: 'Backlog',     icon: Archive,      color: 'text-muted-foreground', bg: 'bg-muted/40' },
  todo:          { label: 'To Do',       icon: Circle,       color: 'text-foreground',       bg: 'bg-secondary' },
  'in-progress': { label: 'In Progress', icon: Loader,       color: 'text-primary',          bg: 'bg-primary/10' },
  done:          { label: 'Done',        icon: CheckCircle2, color: 'text-green-500',        bg: 'bg-green-500/10' },
};

// Activity Dots Component
function ActivityDots({ completedDates }: { completedDates: string[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(startOfDay(new Date()), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const isToday = i === 6;
    const done = completedDates.includes(key);
    const label = format(d, 'EEE');
    
    return { key, isToday, done, label };
  });

  return (
    <div className="flex items-end gap-1.5">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05 * days.indexOf(d) }}
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all duration-300',
              d.done
                ? d.isToday
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/20'
                  : 'bg-gradient-to-br from-orange-400/80 to-orange-500/80'
                : d.isToday
                  ? 'bg-secondary/40 border-2 border-dashed border-orange-400/30'
                  : 'bg-secondary/40'
            )}
          >
            {d.done && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/60" />
              </div>
            )}
          </motion.div>
          <span className={cn(
            'text-[8px] font-bold tracking-wide',
            d.isToday ? 'text-orange-400' : 'text-muted-foreground/60'
          )}>
            {d.isToday ? 'TODAY' : d.label.slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Streak Tier Helper
function getStreakTier(n: number, alive: boolean) {
  if (!alive || n === 0) return {
    flameColor: 'text-muted-foreground/40',
    numColor: 'text-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted-foreground/20',
    label: 'Complete a task to start!',
  };
  if (n < 3)  return { 
    flameColor: 'text-yellow-400',  
    numColor: 'text-yellow-400',  
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Getting warmed up…' 
  };
  if (n < 7)  return { 
    flameColor: 'text-orange-400',  
    numColor: 'text-orange-400',  
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'On a roll! 🔥' 
  };
  if (n < 14) return { 
    flameColor: 'text-orange-600',  
    numColor: 'text-orange-600',  
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/20',
    label: 'Week streak! 🔥🔥' 
  };
  if (n < 30) return { 
    flameColor: 'text-red-500',     
    numColor: 'text-red-500',     
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'On fire! 🔥🔥🔥' 
  };
  return       { 
    flameColor: 'text-purple-500',        
    numColor: 'text-purple-500',  
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: '⚡ Legendary streak!' 
  };
}

export function DashboardView({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onUpdateTask,
  onAddTask 
}: DashboardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Streaks ──────────────────────────────────────────────────
  const streak = useStreaks();

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    if (updates.status === 'done') {
      streak.recordCompletion(updates.completedAt || new Date().toISOString());
    }
    onUpdateTask(id, updates);
  };
  // ─────────────────────────────────────────────────────────────

  const openDetail = (task: Task) => { 
    setDetailTask(task); 
    setDetailOpen(true); 
  };
  
  const closeDetail = () => { 
    setDetailOpen(false); 
    setDetailTask(null); 
  };

  const handleComplete = (id: string, done: boolean) => {
    handleUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  const handleDuplicate = (task: Task) => {
    if (!onAddTask) return;
    const duplicatedTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'todo' as Status,
      completedAt: undefined,
      timeTracking: task.timeTracking ? {
        ...task.timeTracking,
        entries: [],
        totalTime: 0,
        isRunning: false,
        activeEntryId: undefined
      } : undefined
    };
    onAddTask(duplicatedTask);
  };

  // Stats calculations
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;
  const done = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  const totalTrackedSeconds = tasks.reduce((acc, t) => acc + getTotalLoggedTime(t.timeTracking), 0);
  const totalTrackedDisplay = secondsToTimeDisplay(totalTrackedSeconds);
  const activeTimer = tasks.find(t => t.timeTracking?.isRunning);

  const startOfToday = new Date(); 
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(); 
  endOfToday.setHours(23, 59, 59, 999);
  
  const dueTodayTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const due = new Date(t.dueDate);
    return due >= startOfToday && due <= endOfToday;
  });

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: CheckCircle, color: 'text-primary' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-yellow-500' },
    { label: 'Overdue', value: overdueCount, icon: AlertCircle, color: 'text-destructive' },
    { label: 'Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'text-green-500' },
  ];

  const recentActivity = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map(task => {
      const diffMs = Date.now() - new Date(task.updatedAt).getTime();
      const diffHours = Math.floor(diffMs / 3_600_000);
      const diffDays = Math.floor(diffHours / 24);
      const timeAgo = diffDays > 0 ? `${diffDays}d ago` : diffHours > 0 ? `${diffHours}h ago` : 'Just now';
      const statusText: Record<string, string> = { 
        done: 'completed', 
        'in-progress': 'started', 
        todo: 'added to To Do', 
        backlog: 'moved to Backlog' 
      };
      return { task, text: `"${task.title}" ${statusText[task.status] ?? 'updated'}`, time: timeAgo };
    });

  const streakTier = getStreakTier(streak.currentStreak, streak.streakAlive);

  return (
    <>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Active Timer Banner */}
        {activeTimer && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            onClick={() => openDetail(activeTimer)}
            className="glass border border-primary/30 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors gap-3"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium flex-shrink-0">Timer running:</span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">{activeTimer.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary font-mono font-semibold flex-shrink-0 text-xs sm:text-sm">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {secondsToTimeDisplay(getTotalLoggedTime(activeTimer.timeTracking)).formatted}
            </div>
          </motion.div>
        )}

        {/* Streak Section - Well Designed & Adaptive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            'glass rounded-2xl p-5 sm:p-6 relative overflow-hidden',
            'border transition-all duration-500',
            streakTier.borderColor
          )}
        >
          {/* Background glow effect for active streaks */}
          {streak.currentStreak >= 7 && (
            <div className={cn(
              'absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none',
              streakTier.bgColor.replace('bg-', 'bg-').replace('/10', '/5')
            )} />
          )}

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
            {/* Left: Flame + Streak Number */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
                'transition-all duration-300',
                streakTier.bgColor
              )}>
                <motion.div
                  animate={streak.currentStreak >= 14 ? {
                    scale: [1, 1.1, 1],
                    rotate: [-3, 3, -3, 0],
                  } : streak.currentStreak >= 7 ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ 
                    duration: streak.currentStreak >= 14 ? 2 : 3, 
                    repeat: Infinity,
                    repeatType: 'loop'
                  }}
                >
                  <Flame className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 transition-colors',
                    streakTier.flameColor,
                    streak.currentStreak >= 14 && 'drop-shadow-lg'
                  )} />
                </motion.div>
                
                {streak.currentStreak > 0 && (
                  <motion.div
                    key={streak.currentStreak}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      'absolute -top-1 -right-1 min-w-[1.75rem] h-7 px-1.5 rounded-full',
                      'flex items-center justify-center',
                      'text-xs font-black text-white',
                      streak.currentStreak >= 14 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40' 
                        : streak.currentStreak >= 7
                          ? 'bg-orange-500 shadow-md shadow-orange-500/30'
                          : 'bg-orange-400 shadow-sm shadow-orange-400/20'
                    )}
                  >
                    {streak.currentStreak > 99 ? '99+' : streak.currentStreak}
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    'text-3xl sm:text-4xl font-black tabular-nums leading-none',
                    streakTier.numColor
                  )}>
                    {streak.currentStreak}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground/70">
                    day{streak.currentStreak !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className={cn(
                  'text-xs sm:text-sm font-bold mt-1',
                  streakTier.flameColor
                )}>
                  {streakTier.label}
                </p>
              </div>
            </div>

            {/* Middle: Activity Dots */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Weekly Activity
                </p>
                {streak.activityToday && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    ACTIVE
                  </span>
                )}
              </div>
              <ActivityDots completedDates={streak.completedDates} />
            </div>

            {/* Right: Stats */}
            <div className="flex gap-4 sm:gap-6 flex-shrink-0 self-center lg:self-auto">
              <div className="text-center min-w-[60px]">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Trophy className={cn(
                    'w-4 h-4',
                    streak.longestStreak >= 14 ? 'text-yellow-500' : 'text-muted-foreground/40'
                  )} />
                </div>
                <p className="text-xl sm:text-2xl font-black tabular-nums leading-none">
                  {streak.longestStreak}
                </p>
                <p className="text-[9px] font-semibold text-muted-foreground/60 mt-1 uppercase tracking-wider">
                  Best
                </p>
              </div>
              
              <div className="w-px bg-border/30 self-stretch" />
              
              <div className="text-center min-w-[60px]">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Zap className="w-4 h-4 text-primary/60" />
                </div>
                <p className="text-xl sm:text-2xl font-black tabular-nums leading-none">
                  {streak.totalTasksCompleted}
                </p>
                <p className="text-[9px] font-semibold text-muted-foreground/60 mt-1 uppercase tracking-wider">
                  Total
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar for Next Milestone */}
          {streak.currentStreak > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60">
                <span>
                  Next: {streak.currentStreak < 7 ? '7 days' : 
                         streak.currentStreak < 14 ? '14 days' : 
                         streak.currentStreak < 30 ? '30 days' : 'Legendary'}
                </span>
                <span className="flex-1 text-right">
                  {streak.currentStreak < 7 
                    ? `${7 - streak.currentStreak} days to go` 
                    : streak.currentStreak < 14 
                      ? `${14 - streak.currentStreak} days to go`
                      : streak.currentStreak < 30
                        ? `${30 - streak.currentStreak} days to go`
                        : '🏆 MAX'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: streak.currentStreak < 7 
                      ? `${(streak.currentStreak / 7) * 100}%` 
                      : streak.currentStreak < 14 
                        ? `${((streak.currentStreak - 7) / 7) * 100}%`
                        : streak.currentStreak < 30 
                          ? `${((streak.currentStreak - 14) / 16) * 100}%`
                          : '100%'
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    'h-full rounded-full',
                    streak.currentStreak >= 14 
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                      : streak.currentStreak >= 7 
                        ? 'bg-gradient-to-r from-orange-400/80 to-orange-500/80'
                        : 'bg-gradient-to-r from-orange-300 to-orange-400'
                  )}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.08 * (index + 1) }}
              className="glass p-4 sm:p-5 lg:p-6 rounded-2xl"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stat.value}</h3>
                </div>
                <stat.icon className={cn("w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5", stat.color)} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Due Today & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }} 
            className="glass p-4 sm:p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">Due Today</h2>
              <span className="ml-auto text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                {dueTodayTasks.length} tasks
              </span>
            </div>
            {dueTodayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 sm:py-6">Nothing due today 🎉</p>
            ) : (
              <div className="space-y-1">
                {dueTodayTasks.map(task => (
                  <motion.div 
                    key={task.id} 
                    whileHover={{ x: 2 }} 
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openDetail(task)}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", {
                        'bg-destructive': task.priority === 'urgent', 
                        'bg-yellow-500': task.priority === 'high',
                        'bg-primary': task.priority === 'medium', 
                        'bg-muted-foreground': task.priority === 'low',
                      })} />
                      <p className="text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{task.title}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {task.status === 'in-progress' ? 'In Progress' : 'Todo'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.45 }} 
            className="glass p-4 sm:p-6 rounded-2xl"
          >
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 sm:py-6">No activity yet</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ x: 2 }} 
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openDetail(activity.task)}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 cursor-pointer group gap-3"
                  >
                    <p className="text-xs sm:text-sm group-hover:text-primary transition-colors truncate">{activity.text}</p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Productivity Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="glass p-4 sm:p-6 rounded-2xl"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Productivity Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground">Completion Rate</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary rounded-full" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${completionRate}%` }} 
                  transition={{ duration: 0.8, ease: 'easeOut' }} 
                />
              </div>
              <p className="text-xs text-muted-foreground">{done} of {totalTasks} tasks done</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Total Focus Time
              </p>
              <p className="text-xl sm:text-2xl font-semibold font-mono">
                {totalTrackedSeconds > 0 ? `${totalTrackedDisplay.hours}h ${totalTrackedDisplay.minutes}m` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">across all tasks</p>
            </div>
          </div>
        </motion.div>
      </div>

      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onComplete={(id, done) => {
          handleUpdateTask(id, {
            status: done ? 'done' : 'todo',
            completedAt: done ? new Date().toISOString() : undefined,
          });
          closeDetail();
        }}
        onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
        onEdit={(task) => { closeDetail(); onEditTask(task); }}
        onDuplicate={(task) => {
          const duplicate = {
            ...task,
            id: crypto.randomUUID(),
            title: `${task.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'todo' as const,
            completedAt: undefined,
            timeTracking: task.timeTracking
              ? { ...task.timeTracking, entries: [], totalTime: 0, isRunning: false, activeEntryId: undefined }
              : undefined,
          };
          onEditTask(duplicate);
          closeDetail();
        }}
      />
    </>
  );
}