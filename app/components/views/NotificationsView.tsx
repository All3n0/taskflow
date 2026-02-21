'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, BellRing, AlertTriangle,
  CheckCircle2, Clock, Calendar, ArrowRight,
  Check, Inbox, Filter, Settings,
} from 'lucide-react';
import { Task } from '../../types/task';
import { cn } from '../utils';
import { isPast, isToday, isTomorrow, formatDistanceToNow, differenceInMinutes } from 'date-fns';

interface NotificationsViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onGoToSettings: () => void;
}

type FilterType = 'all' | 'overdue' | 'today' | 'upcoming';

// ── Time helpers ──────────────────────────────────────────────

function getTimeInfo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (isPast(d)) {
    const mins = Math.abs(differenceInMinutes(d, now));
    if (mins < 60)   return { label: `${mins}m overdue`,                       color: 'text-red-500',   bg: 'bg-red-500/8',   Icon: AlertTriangle };
    if (mins < 1440) return { label: `${Math.floor(mins / 60)}h overdue`,      color: 'text-red-500',   bg: 'bg-red-500/8',   Icon: AlertTriangle };
                     return { label: `${Math.floor(mins / 1440)}d overdue`,    color: 'text-red-500',   bg: 'bg-red-500/8',   Icon: AlertTriangle };
  }
  const mins = differenceInMinutes(d, now);
  if (mins < 30)   return { label: `Due in ${mins}m`,                         color: 'text-amber-500', bg: 'bg-amber-500/8', Icon: Clock };
  if (mins < 1440) return { label: `Due in ${Math.floor(mins / 60)}h`,        color: 'text-amber-500', bg: 'bg-amber-500/8', Icon: Clock };
                   return { label: formatDistanceToNow(d, { addSuffix: true }), color: 'text-blue-500', bg: 'bg-blue-500/8',  Icon: Calendar };
}

const PRIORITY = {
  urgent: { label: 'Urgent', textColor: 'text-red-500',    bgColor: 'bg-red-500/10' },
  high:   { label: 'High',   textColor: 'text-amber-500',  bgColor: 'bg-amber-500/10' },
  medium: { label: 'Medium', textColor: 'text-blue-500',   bgColor: 'bg-blue-500/10' },
  low:    { label: 'Low',    textColor: 'text-slate-400',  bgColor: 'bg-slate-400/10' },
} as const;

// ── Single notification card ──────────────────────────────────

function NotifCard({ task, onComplete, onView }: {
  task: Task;
  onComplete: (id: string) => void;
  onView: (task: Task) => void;
}) {
  const [completing, setCompleting] = useState(false);
  const p        = PRIORITY[task.priority] ?? PRIORITY.medium;
  const timeInfo = task.dueDate ? getTimeInfo(task.dueDate) : null;
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) : false;

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => onComplete(task.id), 380);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: completing ? 0 : 1, x: completing ? 20 : 0, scale: completing ? 0.97 : 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className={cn(
        'glass rounded-2xl p-4 flex items-start gap-3 transition-colors',
        isOverdue && 'border-red-500/25 bg-red-500/[0.02]'
      )}
    >
      {/* Completion button */}
      <motion.button
        onClick={handleComplete}
        whileTap={{ scale: 0.85 }}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
          completing
            ? 'bg-green-500 border-green-500'
            : 'border-border hover:border-primary hover:bg-primary/8'
        )}
      >
        <AnimatePresence>
          {completing && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-bold leading-snug', completing && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5', p.bgColor, p.textColor)}>
            {p.label}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {timeInfo && (
            <div className={cn('flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', timeInfo.bg, timeInfo.color)}>
              <timeInfo.Icon className="w-2.5 h-2.5" />
              {timeInfo.label}
            </div>
          )}
          {task.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded-full text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Open task button */}
      <motion.button
        onClick={() => onView(task)}
        whileHover={{ x: 2 }}
        className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}

// ── Main view ─────────────────────────────────────────────────

export function NotificationsView({ tasks = [], onViewTask, onCompleteTask, onGoToSettings }: NotificationsViewProps) {
  const [filter, setFilter]       = useState<FilterType>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  // Tasks that need attention: not done, has a due date, not dismissed locally
  const actionable = useMemo(() =>
    tasks.filter(t => t.status !== 'done' && t.dueDate && !dismissed.has(t.id)),
    [tasks, dismissed]
  );

  const counts = useMemo(() => ({
    all:      actionable.length,
    overdue:  actionable.filter(t => isPast(new Date(t.dueDate!))).length,
    today:    actionable.filter(t => isToday(new Date(t.dueDate!)) && !isPast(new Date(t.dueDate!))).length,
    upcoming: actionable.filter(t => !isPast(new Date(t.dueDate!)) && !isToday(new Date(t.dueDate!))).length,
  }), [actionable]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'overdue':  return actionable.filter(t => isPast(new Date(t.dueDate!)));
      case 'today':    return actionable.filter(t => isToday(new Date(t.dueDate!)) && !isPast(new Date(t.dueDate!)));
      case 'upcoming': return actionable.filter(t => !isPast(new Date(t.dueDate!)) && !isToday(new Date(t.dueDate!)));
      default:         return actionable;
    }
  }, [actionable, filter]);

  // Sort: overdue first → soonest → priority
  const sorted = useMemo(() => {
    const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...filtered].sort((a, b) => {
      const aOver = isPast(new Date(a.dueDate!)) ? 0 : 1;
      const bOver = isPast(new Date(b.dueDate!)) ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const dateDiff = new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
    });
  }, [filtered]);

  const handleComplete = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    onCompleteTask(id);
  };

  const clearAll = () => setDismissed(prev => new Set([...prev, ...actionable.map(t => t.id)]));

  const FILTERS: { id: FilterType; label: string; dot?: string }[] = [
    { id: 'all',      label: `All (${counts.all})` },
    { id: 'overdue',  label: `Overdue${counts.overdue > 0 ? ` · ${counts.overdue}` : ''}`,  dot: 'bg-red-500' },
    { id: 'today',    label: `Today${counts.today > 0 ? ` · ${counts.today}` : ''}`,        dot: 'bg-amber-500' },
    { id: 'upcoming', label: `Upcoming${counts.upcoming > 0 ? ` · ${counts.upcoming}` : ''}`, dot: 'bg-blue-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.all === 0
              ? "You're all caught up!"
              : `${counts.all} task${counts.all !== 1 ? 's' : ''} need${counts.all === 1 ? 's' : ''} attention`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {sorted.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
              Clear all
            </button>
          )}
          <button
            onClick={onGoToSettings}
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Notification settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Push permission banner ── */}
      <AnimatePresence>
        {permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 flex items-center gap-3 border-primary/20 overflow-hidden"
          >
            <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Enable push notifications</p>
              <p className="text-xs text-muted-foreground">Get OS alerts when tasks are due, even with the app closed</p>
            </div>
            <button
              onClick={() => Notification.requestPermission()}
              className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 flex-shrink-0 transition-all active:scale-[0.97]"
            >
              Enable
            </button>
          </motion.div>
        )}

        {permission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 flex items-center gap-3 border-destructive/20"
          >
            <div className="p-2 rounded-xl bg-destructive/10 flex-shrink-0">
              <BellOff className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Push notifications blocked</p>
              <p className="text-xs text-muted-foreground">Go to Settings → Notifications to re-enable</p>
            </div>
            <button onClick={onGoToSettings} className="text-xs font-bold bg-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/80 flex-shrink-0 transition-all">
              Settings
            </button>
          </motion.div>
        )}

        {permission === 'granted' && counts.all > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Push alerts <span className="font-bold text-green-500">active</span> — you'll get OS alerts when tasks are due
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter tabs ── */}
      {counts.all > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0',
                filter === f.id
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
              )}
            >
              {f.dot && filter !== f.id && <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', f.dot)} />}
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Notification list ── */}
      <AnimatePresence mode="popLayout">
        {sorted.length > 0 ? (
          <motion.div key="list" className="space-y-2">
            {sorted.map(task => (
              <NotifCard key={task.id} task={task} onComplete={handleComplete} onView={onViewTask} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-14 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="font-black text-base">
                {filter === 'all' ? "All caught up!" : `No ${filter} tasks`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all'
                  ? 'Nothing needs your attention right now'
                  : 'Switch to "All" to see everything'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats strip ── */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-4 grid grid-cols-3 divide-x divide-border/40 text-center"
        >
          {[
            { label: 'Total tasks',  value: tasks.length,                                  color: '' },
            { label: 'Completed',    value: tasks.filter(t => t.status === 'done').length, color: 'text-green-500' },
            { label: 'Needs action', value: counts.all,                                    color: counts.all > 0 ? 'text-amber-500' : '' },
          ].map(s => (
            <div key={s.label} className="px-3">
              <p className={cn('text-xl font-black', s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}