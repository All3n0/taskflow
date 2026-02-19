'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircle, Clock, AlertCircle, TrendingUp, Timer, Flame,
  Calendar, X, Flag, Tag, Edit, Trash2, AlertTriangle,
  CheckCircle2, Circle, Loader, Archive,
} from 'lucide-react';
import {
  Task, Priority, Status,
  secondsToTimeDisplay, getTotalLoggedTime, isOverdue,
} from '../../types/task';
import { cn } from '../utils';

interface DashboardViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
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

// ── Task Detail Popup ──────────────────────────────────────────
function TaskDetailPopup({
  task, open, onClose, onEdit, onDelete,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleClose = () => { setConfirmDelete(false); onClose(); };
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task!.id);
    handleClose();
  };
  const handleEdit = () => { onEdit(task!); handleClose(); };

  if (!task) return null;

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const totalSeconds = getTotalLoggedTime(task.timeTracking);
  const timeDisplay = secondsToTimeDisplay(totalSeconds);
  const taskIsOverdue = isOverdue(task);

  const getTimeInfo = () => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const isFull = d.getHours() === 23 && d.getMinutes() === 59;
    if (isFull) return { date: format(d, 'EEE, MMM d yyyy'), time: 'Full day' };
    const entry = task.timeTracking?.entries?.[0];
    const endStr = entry?.endTime ? ` → ${format(new Date(entry.endTime), 'HH:mm')}` : '';
    return { date: format(d, 'EEE, MMM d yyyy'), time: `${format(d, 'HH:mm')}${endStr}` };
  };

  const timeInfo = getTimeInfo();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 
            Mobile  → bottom sheet (slides up from bottom)
            Desktop → centered card (scales in from center)
          */}
          <motion.div
            key="panel"
            // Mobile animation: slide up
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className={cn(
              "fixed z-50 bg-background border-t border-border shadow-2xl overflow-hidden",
              // Mobile: full-width bottom sheet
              "bottom-0 left-0 right-0 rounded-t-3xl",
              // Desktop: centered card, override bottom-sheet styles
              "sm:border sm:rounded-3xl sm:bottom-auto sm:left-1/2 sm:top-1/2",
              "sm:-translate-x-1/2 sm:-translate-y-1/2",
              "sm:w-[min(480px,calc(100vw-2rem))]",
            )}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Priority accent bar */}
            <div className={cn(
              "h-1 w-full mt-2 sm:mt-0 sm:rounded-t-3xl",
              task.priority === 'urgent' ? 'bg-destructive' :
              task.priority === 'high'   ? 'bg-yellow-500' :
              task.priority === 'medium' ? 'bg-primary' : 'bg-muted'
            )} />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-foreground leading-tight line-clamp-2">
                  {task.title}
                </h2>
                <div className={cn(
                  "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold",
                  status.color, status.bg
                )}>
                  <StatusIcon className={cn("w-3 h-3", task.status === 'in-progress' && 'animate-spin')} />
                  {status.label}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pb-3 space-y-3">
              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {task.description}
                </p>
              )}

              {/* Info grid — 2 cols always, tighter on mobile */}
              <div className="grid grid-cols-2 gap-2">
                {/* Priority */}
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-2xl", priority.bg)}>
                  <Flag className={cn("w-3 h-3 flex-shrink-0", priority.color)} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Priority</p>
                    <p className={cn("text-xs font-bold truncate", priority.color)}>{priority.label}</p>
                  </div>
                </div>

                {/* Due */}
                {timeInfo ? (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-2xl",
                    taskIsOverdue ? "bg-destructive/10" : "bg-secondary/60"
                  )}>
                    <Calendar className={cn("w-3 h-3 flex-shrink-0", taskIsOverdue ? "text-destructive" : "text-primary")} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Due</p>
                      <p className={cn("text-[10px] font-bold truncate", taskIsOverdue ? "text-destructive" : "text-foreground")}>
                        {timeInfo.date}
                      </p>
                      <p className={cn("text-[9px]", taskIsOverdue ? "text-destructive/70" : "text-muted-foreground")}>
                        {timeInfo.time}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/40">
                    <Calendar className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Due</p>
                      <p className="text-[10px] text-muted-foreground">No date</p>
                    </div>
                  </div>
                )}

                {/* Logged time */}
                {totalSeconds > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/60">
                    <Timer className="w-3 h-3 flex-shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Logged</p>
                      <p className="text-xs font-bold font-mono text-foreground truncate">
                        {timeDisplay.hours > 0 ? `${timeDisplay.hours}h ` : ''}
                        {timeDisplay.minutes > 0 ? `${timeDisplay.minutes}m ` : ''}
                        {timeDisplay.seconds}s
                      </p>
                    </div>
                  </div>
                )}

                {/* Running timer */}
                {task.timeTracking?.isRunning && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-primary/10">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Timer</p>
                      <p className="text-xs font-bold text-primary">Running</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Created */}
              <p className="text-[10px] text-muted-foreground">
                Created {format(new Date(task.createdAt), 'MMM d, yyyy · HH:mm')}
              </p>

              {/* Overdue warning */}
              {taskIsOverdue && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-destructive/10 border border-destructive/20"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                  <p className="text-xs font-bold text-destructive">This task is overdue</p>
                </motion.div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border mx-5" />

            {/* Footer */}
            <div className="px-5 py-4 pb-safe">
              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="space-y-2"
                  >
                    <p className="text-center text-xs text-muted-foreground">This action cannot be undone</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-foreground hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-3 rounded-2xl bg-destructive text-white text-sm font-black hover:opacity-90 transition-opacity"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center w-12 h-12 rounded-2xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── DashboardView ──────────────────────────────────────────────
export function DashboardView({ tasks, onEditTask, onDeleteTask }: DashboardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;
  const done = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  const totalTrackedSeconds = tasks.reduce((acc, t) => acc + getTotalLoggedTime(t.timeTracking), 0);
  const totalTrackedDisplay = secondsToTimeDisplay(totalTrackedSeconds);
  const activeTimer = tasks.find(t => t.timeTracking?.isRunning);

  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);

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
    { label: 'Total Tasks',     value: totalTasks,           icon: CheckCircle, color: 'text-primary' },
    { label: 'In Progress',     value: inProgress,           icon: Clock,       color: 'text-yellow-500' },
    { label: 'Overdue',         value: overdueCount,         icon: AlertCircle, color: 'text-destructive' },
    { label: 'Completion',      value: `${completionRate}%`, icon: TrendingUp,  color: 'text-green-500' },
  ];

  const recentActivity = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map(task => {
      const diffMs = Date.now() - new Date(task.updatedAt).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const timeAgo = diffDays > 0 ? `${diffDays}d ago`
        : diffHours > 0 ? `${diffHours}h ago`
        : 'Just now';
      const statusText: Record<string, string> = {
        done: 'completed', 'in-progress': 'started',
        todo: 'added to To Do', backlog: 'moved to Backlog',
      };
      return { task, text: `"${task.title}" ${statusText[task.status] ?? 'updated'}`, time: timeAgo };
    });

  return (
    <>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">

        {/* Active timer banner */}
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

        {/* Stats — 2 cols on mobile, 4 on desktop */}
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

        {/* Due Today + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">

          {/* Due Today */}
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
                        'bg-destructive':      task.priority === 'urgent',
                        'bg-yellow-500':       task.priority === 'high',
                        'bg-primary':          task.priority === 'medium',
                        'bg-muted-foreground': task.priority === 'low',
                      })} />
                      <p className="text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {task.status === 'in-progress' ? 'In Progress' : 'Todo'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
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
                    <p className="text-xs sm:text-sm group-hover:text-primary transition-colors truncate">
                      {activity.text}
                    </p>
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

          {/* 1 col mobile, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

            {/* Completion rate */}
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

            {/* Divider on mobile between items */}
            <div className="h-px bg-border/50 sm:hidden" />

            {/* Focus time */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Total Focus Time
              </p>
              <p className="text-xl sm:text-2xl font-semibold font-mono">
                {totalTrackedSeconds > 0
                  ? `${totalTrackedDisplay.hours}h ${totalTrackedDisplay.minutes}m`
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">across all tasks</p>
            </div>

            <div className="h-px bg-border/50 sm:hidden" />

            {/* Streak */}
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

      {/* Task Detail Popup */}
      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
      />
    </>
  );
}