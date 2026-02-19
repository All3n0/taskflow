'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  X, Trash2, Edit2, Check, Clock, ChevronRight,
  CheckCircle2, Circle, Loader2, Archive, AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { Task, Priority, Status, getTotalLoggedTime, secondsToTimeDisplay } from '../../types/task';
import { cn } from '../utils';

interface TaskDetailPopupProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityDot: Record<Priority, string> = {
  low:    'bg-muted-foreground',
  medium: 'bg-primary',
  high:   'bg-yellow-500',
  urgent: 'bg-destructive',
};

const priorityLabel: Record<Priority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  backlog:       { label: 'Backlog',     icon: Archive,      color: 'text-muted-foreground', bg: 'bg-muted/40' },
  todo:          { label: 'To Do',       icon: Circle,       color: 'text-foreground',       bg: 'bg-secondary' },
  'in-progress': { label: 'In Progress', icon: Loader2,      color: 'text-primary',          bg: 'bg-primary/10' },
  done:          { label: 'Done',        icon: CheckCircle2, color: 'text-green-500',        bg: 'bg-green-500/10' },
};

export function TaskDetailPopup({ task, open, onClose, onEdit, onDelete }: TaskDetailPopupProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task!.id);
    handleClose();
  };

  const handleEdit = () => {
    onEdit(task!);
    handleClose();
  };

  if (!task) return null;

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const totalSeconds = getTotalLoggedTime(task.timeTracking);
  const timeDisplay = secondsToTimeDisplay(totalSeconds);
  const taskIsOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const getTimeInfo = () => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const isFull = d.getHours() === 23 && d.getMinutes() === 59;
    if (isFull) return { date: format(d, 'MMM d, yyyy'), time: 'Full day' };
    const entry = task.timeTracking?.entries?.[0];
    const endStr = entry?.endTime ? ` → ${format(new Date(entry.endTime), 'HH:mm')}` : '';
    return { date: format(d, 'MMM d, yyyy'), time: `${format(d, 'HH:mm')}${endStr}` };
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
            transition={{ duration: 0.18 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet — slides up from bottom on mobile, centered on desktop */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className={cn(
              "fixed z-50 bg-background border border-border shadow-2xl overflow-hidden",
              // Mobile: bottom sheet
              "bottom-0 left-0 right-0 rounded-t-3xl",
              // Desktop: centered card
              "md:rounded-3xl md:bottom-auto md:left-1/2 md:top-1/2",
              "md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm"
            )}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Status strip at top */}
            <div className={cn("mx-4 mt-3 mb-0 rounded-2xl px-4 py-3 flex items-center gap-3", status.bg)}>
              <StatusIcon className={cn("w-4 h-4 flex-shrink-0", status.color,
                task.status === 'in-progress' && "animate-spin"
              )} />
              <span className={cn("text-sm font-bold", status.color)}>{status.label}</span>
              <button
                onClick={handleClose}
                className="ml-auto p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-2 space-y-5">

              {/* Title */}
              <div>
                <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Detail rows */}
              <div className="space-y-1">

                {/* Priority row */}
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Priority</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", priorityDot[task.priority])} />
                    <span className="text-sm font-semibold text-foreground">{priorityLabel[task.priority]}</span>
                  </div>
                </div>

                {/* Due date row */}
                {timeInfo && (
                  <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Due</span>
                    <div className={cn("flex items-center gap-2", taskIsOverdue ? "text-destructive" : "text-foreground")}>
                      {taskIsOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                      <div className="text-right">
                        <p className="text-sm font-semibold">{timeInfo.date}</p>
                        <p className="text-xs text-muted-foreground">{timeInfo.time}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time logged row */}
                {totalSeconds > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logged</span>
                    <div className="flex items-center gap-2">
                      {task.timeTracking?.isRunning && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      <span className="text-sm font-semibold font-mono text-foreground">
                        {timeDisplay.hours > 0 ? `${timeDisplay.hours}h ` : ''}
                        {timeDisplay.minutes > 0 ? `${timeDisplay.minutes}m ` : ''}
                        {timeDisplay.seconds}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags row */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tags</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {task.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project row */}
                {task.project && (
                  <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Project</span>
                    <span className="text-sm font-semibold text-foreground">{task.project}</span>
                  </div>
                )}

                {/* Created row */}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Created</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(task.createdAt), 'MMM d, yyyy · HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-6 pt-2">
              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  /* Confirm delete state */
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-2"
                  >
                    <p className="text-center text-sm text-muted-foreground pb-1">
                      This action cannot be undone
                    </p>
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
                  /* Default actions */
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center gap-2 w-12 h-12 rounded-2xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-[1.01] transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
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