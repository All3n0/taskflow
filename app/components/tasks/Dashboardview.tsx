'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircle, Clock, AlertCircle, TrendingUp, Timer, Flame,
  Calendar, X, Flag, Tag, Edit, Trash2, AlertTriangle,
  CheckCircle2, Circle, Loader, Archive, Link2,
  Copy, Share2, Bookmark, Bell, Folder, User,
  Star, Printer, Mail, MessageCircle, MessageSquare
} from 'lucide-react';
import {
  Task, Priority, Status,
  secondsToTimeDisplay, getTotalLoggedTime, isOverdue,
} from '../../types/task';
import { cn } from '../utils';
import { TaskDetailPopup } from './TaskDetailPopup'; // Import the enhanced version

interface DashboardViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask?: (task: Task) => void; // Optional for duplicate functionality
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

export function DashboardView({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onUpdateTask,
  onAddTask 
}: DashboardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (task: Task) => { 
    setDetailTask(task); 
    setDetailOpen(true); 
  };
  
  const closeDetail = () => { 
    setDetailOpen(false); 
    setDetailTask(null); 
  };

  const handleComplete = (id: string, done: boolean) => {
    onUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  // Optional handlers for enhanced popup features
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
    
    // You could show a toast notification here
    console.log('Task duplicated:', duplicatedTask.title);
  };

  const handleCopyLink = (task: Task) => {
    const url = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
    console.log('Link copied to clipboard:', url);
  };

  const handleBookmark = (task: Task) => {
    // You would need to add a bookmarked field to your Task type
    // For now, we'll just log it
    console.log('Bookmark task:', task.id);
    // You could store bookmarks in localStorage or a separate state
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedTasks') || '[]');
    if (!bookmarks.includes(task.id)) {
      bookmarks.push(task.id);
      localStorage.setItem('bookmarkedTasks', JSON.stringify(bookmarks));
    }
  };

  const handleArchive = (task: Task) => {
    // You would need to add an archived field to your Task type
    // For now, we'll just update the status or move to a different list
    onUpdateTask(task.id, { status: 'backlog' as Status });
    console.log('Archive task:', task.id);
  };

  const handleAddReminder = (task: Task) => {
    // This would typically open a date picker modal
    console.log('Add reminder for task:', task.id);
    // You could store reminders in localStorage or a separate state
  };

  const handleShare = (task: Task) => {
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: task.title,
        text: task.description || 'Check out this task',
        url: `${window.location.origin}/tasks/${task.id}`,
      }).catch(console.error);
    } else {
      // Fallback to copying link
      handleCopyLink(task);
    }
  };

  const handlePrint = (task: Task) => {
    // Create a printable version of the task
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${task.title} - Task Details</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 2rem; }
              h1 { font-size: 2rem; margin-bottom: 1rem; }
              .metadata { display: grid; gap: 0.5rem; margin-bottom: 2rem; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <h1>${task.title}</h1>
            ${task.description ? `<p>${task.description}</p>` : ''}
            <div class="metadata">
              <div><span class="label">Status:</span> ${task.status}</div>
              <div><span class="label">Priority:</span> ${task.priority}</div>
              ${task.dueDate ? `<div><span class="label">Due:</span> ${format(new Date(task.dueDate), 'PPP')}</div>` : ''}
              ${task.assignee ? `<div><span class="label">Assignee:</span> ${task.assignee}</div>` : ''}
              ${task.project ? `<div><span class="label">Project:</span> ${task.project}</div>` : ''}
              <div><span class="label">Created:</span> ${format(new Date(task.createdAt), 'PPP')}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAssign = (task: Task) => {
    // This would typically open a user selector modal
    console.log('Assign task:', task.id);
    // You could update the assignee field
    // onUpdateTask(task.id, { assignee: 'user@example.com' });
  };

  const handleMoveToProject = (task: Task) => {
    // This would typically open a project selector modal
    console.log('Move task to project:', task.id);
    // You could update the project field
    // onUpdateTask(task.id, { project: 'new-project-id' });
  };

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

  const getStreak = () => {
    const completedDates = tasks
      .filter(t => t.completedAt)
      .map(t => new Date(t.completedAt!).toDateString());
    const uniqueDates = [...new Set(completedDates)].sort().reverse();
    let streak = 0; 
    const check = new Date();
    for (const dateStr of uniqueDates) {
      if (new Date(dateStr).toDateString() === check.toDateString()) { 
        streak++; 
        check.setDate(check.getDate() - 1); 
      } else break;
    }
    return streak;
  };

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
      return { 
        task, 
        text: `"${task.title}" ${statusText[task.status] ?? 'updated'}`, 
        time: timeAgo 
      };
    });

  return (
    <>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.08 }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
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
            transition={{ delay: 0.4 }} 
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="glass p-4 sm:p-6 rounded-2xl"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Productivity Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
            <div className="h-px bg-border/50 sm:hidden" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Total Focus Time
              </p>
              <p className="text-xl sm:text-2xl font-semibold font-mono">
                {totalTrackedSeconds > 0 ? `${totalTrackedDisplay.hours}h ${totalTrackedDisplay.minutes}m` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">across all tasks</p>
            </div>
            <div className="h-px bg-border/50 sm:hidden" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Streak
              </p>
              <p className="text-xl sm:text-2xl font-semibold">{getStreak()} days</p>
              <p className="text-xs text-muted-foreground">consecutive active days</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Task Detail Popup with all features */}
     <TaskDetailPopup
  task={detailTask}
  open={detailOpen}
  onClose={closeDetail}
  onComplete={(id, done) => {
    onUpdateTask(id, {
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
    // Add it via store directly — need to expose addTask or use updateTask workaround
    onEditTask(duplicate); // opens it in the dialog so user can save it
    closeDetail();
  }}
/>
    </>
  );
}