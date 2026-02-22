'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Timer, Play, Square, CheckCircle2 } from 'lucide-react';
import { Task, Priority, getTotalLoggedTime, secondsToTimeDisplay } from '../../types/task';
import { cn } from '../utils';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onTimerToggle?: (id: string) => void;
}

const priorityConfig: Record<Priority, { label: string; dot: string; bar: string }> = {
  low:    { label: 'Low',    dot: 'bg-muted-foreground', bar: 'bg-muted' },
  medium: { label: 'Medium', dot: 'bg-primary',          bar: 'bg-primary' },
  high:   { label: 'High',   dot: 'bg-yellow-500',       bar: 'bg-yellow-500' },
  urgent: { label: 'Urgent', dot: 'bg-destructive',      bar: 'bg-destructive' },
};

const formatDueDate = (task: Task): string => {
  if (!task.dueDate) return '';
  const d = new Date(task.dueDate);
  const isFullDay = d.getHours() === 23 && d.getMinutes() === 59;
  if (isFullDay) return format(d, 'MMM d');
  const entry = task.timeTracking?.entries?.[0];
  if (entry?.endTime) {
    return `${format(d, 'MMM d')} · ${format(d, 'HH:mm')}–${format(new Date(entry.endTime), 'HH:mm')}`;
  }
  return `${format(d, 'MMM d')} · ${format(d, 'HH:mm')}`;
};

export function TaskCard({ task, onUpdate, onDelete, onEdit, onTimerToggle }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const isRunning = task.timeTracking?.isRunning ?? false;
  const totalSeconds = getTotalLoggedTime(task.timeTracking);
  const timeDisplay = secondsToTimeDisplay(totalSeconds);
  const dueDateStr = formatDueDate(task);
  const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
  const isDone = task.status === 'done';

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(task.id, {
      status: isDone ? 'todo' : 'done',
      completedAt: isDone ? undefined : new Date().toISOString(),
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onEdit(task)}
      className={cn(
        "group glass rounded-xl cursor-pointer transition-all hover:shadow-lg border border-border/50 hover:border-primary/20 overflow-hidden task-card",
        isDone && "opacity-60"
      )}
      data-task-id={task.id}
      data-priority={task.priority}
      data-status={task.status}
      data-has-due-date={!!task.dueDate}
      data-overdue={isOverdue}
    >
      {/* Priority accent bar */}
      <div className={cn("h-0.5 w-full", isDone ? "bg-green-500" : priority.bar)} data-testid="priority-bar" />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-3">
          {/* Complete checkbox */}
          <button
            onClick={handleComplete}
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 complete-button",
              isDone
                ? "bg-green-500 border-green-500"
                : "border-border hover:border-green-500 hover:bg-green-500/10"
            )}
            data-testid={`complete-button-${task.id}`}
            data-task-status={task.status}
          >
            {isDone && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </button>

          <h3 className={cn(
            "font-medium text-sm text-foreground leading-snug flex-1 min-w-0 task-title",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>

          {onTimerToggle && !isDone && (
            <button
              onClick={(e) => { e.stopPropagation(); onTimerToggle(task.id); }}
              className={cn(
                "flex-shrink-0 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 timer-button",
                isRunning
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-primary hover:bg-primary/10"
              )}
              data-running={isRunning}
              data-testid={`timer-button-${task.id}`}
            >
              {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 ml-8 task-description">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-4 text-xs flex-wrap ml-8 task-metadata">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", isDone ? "bg-green-500" : priority.dot)} />
            <span className="text-muted-foreground priority-label">{isDone ? 'Done' : priority.label}</span>
          </div>

          {dueDateStr && (
            <div className={cn(
              "flex items-center gap-1 due-date",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              <span>{dueDateStr}</span>
            </div>
          )}

          {task.timeTracking && totalSeconds > 0 && (
            <div className={cn(
              "flex items-center gap-1 ml-auto font-mono time-tracking",
              isRunning ? "text-primary animate-pulse" : "text-muted-foreground"
            )}>
              <Timer className="w-3 h-3" />
              <span>{timeDisplay.formatted}</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className={cn("flex items-center gap-1 tags-container", totalSeconds === 0 && "ml-auto")}>
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] tag">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-muted-foreground text-[10px]">+{task.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>

        {/* Running timer bar */}
        {isRunning && (
          <div className="mt-3 h-0.5 bg-secondary rounded-full overflow-hidden" data-testid="timer-progress">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}