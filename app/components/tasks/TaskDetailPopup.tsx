'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  X, Trash2, Edit2, CheckCircle2, Circle,
  Loader2, Archive, AlertTriangle, Calendar,
  Tag, Clock, Zap, Flag, Sparkles,
  ChevronDown, MoreVertical, Copy, Share2,
  Bell, Timer, Target,
  Link2, Star, Folder, User,
  Mail, MessageCircle, MessageSquare,
  Printer, Check,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Task, Priority, Status, getTotalLoggedTime, secondsToTimeDisplay, isOverdue } from '../../types/task';
import { cn } from '../utils';

interface TaskDetailPopupProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string, done: boolean) => void;
  onDuplicate?: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  low:    { label: 'Low',    icon: Circle,        color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  medium: { label: 'Medium', icon: Circle,        color: 'text-green-400',   bg: 'bg-green-400/10' },
  high:   { label: 'High',   icon: Zap,           color: 'text-yellow-500',  bg: 'bg-yellow-500/10' },
  urgent: { label: 'Urgent', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  backlog:       { label: 'Backlog',     icon: Archive,      color: 'text-muted-foreground', bg: 'bg-muted/40' },
  todo:          { label: 'To Do',       icon: Circle,       color: 'text-foreground',       bg: 'bg-secondary' },
  'in-progress': { label: 'In Progress', icon: Loader2,      color: 'text-primary',          bg: 'bg-primary/10' },
  done:          { label: 'Done',        icon: CheckCircle2, color: 'text-green-500',        bg: 'bg-green-500/10' },
};

export function TaskDetailPopup({
  task, open, onClose, onEdit, onDelete, onComplete, onDuplicate,
}: TaskDetailPopupProps) {
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [showMoreMenu, setShowMoreMenu]     = useState(false);
  const [showShareSub, setShowShareSub]     = useState(false);
  const [isHovering, setIsHovering]         = useState<string | null>(null);
  const [bookmarked, setBookmarked]         = useState(false);
  const [reminderSet, setReminderSet]       = useState(false);
  const [copied, setCopied]                 = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
        setShowShareSub(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClose = () => {
    setConfirmDelete(false);
    setShowMoreMenu(false);
    setShowShareSub(false);
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task.id);
    handleClose();
  };

  const handleEdit   = () => { if (task) { onEdit(task); handleClose(); } };
  const handleComplete = () => { if (task) onComplete(task.id, task.status !== 'done'); };

  // ── Three-dot actions ────────────────────────────────────────

  const handleDuplicate = () => {
    if (!task || !onDuplicate) return;
    onDuplicate(task);
    setShowMoreMenu(false);
    toast.success('Task duplicated!');
  };

  const handleCopyLink = () => {
    if (!task) return;
    const text = `Task: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}${task.dueDate ? `\nDue: ${format(new Date(task.dueDate), 'MMM d, yyyy')}` : ''}${task.description ? `\n\n${task.description}` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Task details copied to clipboard!');
    });
    setShowMoreMenu(false);
  };

  const handleBookmark = () => {
    setBookmarked(v => !v);
    toast.success(bookmarked ? 'Bookmark removed' : 'Task bookmarked!');
    setShowMoreMenu(false);
  };

  const handleArchive = () => {
    if (!task) return;
    onComplete(task.id, true); // mark done = archive equivalent
    toast.success('Task archived!');
    setShowMoreMenu(false);
    handleClose();
  };

  const handleSetReminder = () => {
    if (!task) return;
    setReminderSet(true);
    // Schedule a reminder 5 min from now as a demo
    const fiveMin = 5 * 60 * 1000;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('taskflow:complete', { detail: { taskId: task.id } }));
    }, fiveMin);
    toast.success('Reminder set for 5 minutes!', {
      description: `You'll be notified about "${task.title}"`,
    });
    setShowMoreMenu(false);
  };

  const handlePrint = () => {
    if (!task) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${task.title}</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;max-width:600px}h1{font-size:24px;margin-bottom:8px}p{color:#666;margin:4px 0}.meta{background:#f5f5f5;padding:16px;border-radius:8px;margin-top:16px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.label{font-weight:600;font-size:13px}.value{font-size:13px;color:#444}</style>
      </head><body>
      <h1>${task.title}</h1>
      ${task.description ? `<p>${task.description}</p>` : ''}
      <div class="meta">
        <div class="row"><span class="label">Status</span><span class="value">${task.status}</span></div>
        <div class="row"><span class="label">Priority</span><span class="value">${task.priority}</span></div>
        ${task.dueDate ? `<div class="row"><span class="label">Due</span><span class="value">${format(new Date(task.dueDate), 'MMM d, yyyy')}</span></div>` : ''}
        ${task.tags?.length ? `<div class="row"><span class="label">Tags</span><span class="value">${task.tags.join(', ')}</span></div>` : ''}
        <div class="row"><span class="label">Created</span><span class="value">${format(new Date(task.createdAt), 'MMM d, yyyy · HH:mm')}</span></div>
      </div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    win.document.close();
    setShowMoreMenu(false);
  };

  const handleShareVia = (channel: 'email' | 'sms' | 'slack') => {
    if (!task) return;
    const text = encodeURIComponent(`Task: ${task.title} | Priority: ${task.priority} | Due: ${task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}`);
    const urls: Record<string, string> = {
      email: `mailto:?subject=${encodeURIComponent(task.title)}&body=${text}`,
      sms:   `sms:?body=${text}`,
      slack: `https://slack.com/intl/en/share?text=${text}`,
    };
    window.open(urls[channel], '_blank');
    setShowShareSub(false);
    setShowMoreMenu(false);
    toast.success(`Opening ${channel}...`);
  };

  if (!task) return null;

  const isDone       = task.status === 'done';
  const status       = statusConfig[task.status];
  const priority     = priorityConfig[task.priority];
  const StatusIcon   = status.icon;
  const PriorityIcon = priority.icon;
  const totalSeconds = getTotalLoggedTime(task.timeTracking);
  const timeDisplay  = secondsToTimeDisplay(totalSeconds);
  const taskIsOverdue = isOverdue(task);

  const getTimeInfo = () => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const isFull = d.getHours() === 23 && d.getMinutes() === 59;
    if (isFull) return { date: format(d, 'MMM d, yyyy'), time: 'Full day' };
    return { date: format(d, 'MMM d, yyyy'), time: format(d, 'HH:mm') };
  };

  const timeInfo = getTimeInfo();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden",
              "bottom-0 left-0 right-0 rounded-t-3xl",
              "md:rounded-2xl md:bottom-auto md:left-1/2 md:top-1/2",
              "md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm"
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 rounded-full bg-border" />
            </div>

            {/* Status header */}
            <div className={cn("mx-4 mt-3 mb-0 rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-white/5", status.bg)}>
              <motion.div animate={task.status === 'in-progress' ? { rotate: 360 } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <StatusIcon className={cn("w-4 h-4 flex-shrink-0", status.color)} />
              </motion.div>
              <span className={cn("text-sm font-semibold", status.color)}>{status.label}</span>

              {/* Bookmark indicator */}
              {bookmarked && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 ml-1" />}

              {/* Three-dot menu */}
              <div ref={menuRef} className="ml-auto flex items-center gap-1 relative">
                <motion.button
                  onClick={() => { setShowMoreMenu(v => !v); setShowShareSub(false); }}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-9 w-52 bg-popover rounded-xl shadow-2xl border border-border py-1.5 z-30 overflow-hidden"
                    >
                      {/* Quick actions */}
                      <div className="px-1.5">
                        {[
                          { icon: copied ? Check : Copy,  label: copied ? 'Copied!' : 'Copy details', action: handleCopyLink, color: copied ? 'text-green-500' : '' },
                          { icon: bookmarked ? Star : Star, label: bookmarked ? 'Remove bookmark' : 'Bookmark', action: handleBookmark, color: bookmarked ? 'text-yellow-500' : '' },
                          ...(onDuplicate ? [{ icon: Copy, label: 'Duplicate task', action: handleDuplicate, color: '' }] : []),
                        ].map((action, i) => (
                          <motion.button
                            key={action.label}
                            onClick={action.action}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-lg flex items-center gap-2.5 group transition-colors"
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ x: 2 }}
                          >
                            <action.icon className={cn("w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors", action.color)} />
                            <span className={action.color || ''}>{action.label}</span>
                          </motion.button>
                        ))}
                      </div>

                      <div className="h-px bg-border my-1" />

                      {/* Share submenu */}
                      <div className="px-1.5">
                        <motion.button
                          onClick={() => setShowShareSub(v => !v)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-lg flex items-center justify-between group transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <span className="flex items-center gap-2.5">
                            <Share2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            Share task
                          </span>
                          <motion.div animate={{ rotate: showShareSub ? 180 : 0 }}>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {showShareSub && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pl-4"
                            >
                              {[
                                { icon: Mail,          label: 'Send via Email',   action: () => handleShareVia('email') },
                                { icon: MessageCircle, label: 'Send via SMS',     action: () => handleShareVia('sms') },
                                { icon: MessageSquare, label: 'Send to Slack',    action: () => handleShareVia('slack') },
                                { icon: Link2,         label: 'Copy as text',     action: handleCopyLink },
                              ].map((item, i) => (
                                <motion.button
                                  key={item.label}
                                  onClick={item.action}
                                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  whileHover={{ x: 2 }}
                                >
                                  <item.icon className="w-3 h-3" />
                                  {item.label}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="h-px bg-border my-1" />

                      {/* Utility actions */}
                      <div className="px-1.5">
                        {[
                          { icon: Bell,    label: reminderSet ? 'Reminder set ✓' : 'Set 5min reminder', action: handleSetReminder, color: reminderSet ? 'text-primary' : '' },
                          { icon: Printer, label: 'Print task',   action: handlePrint,   color: '' },
                          { icon: Archive, label: 'Archive task', action: handleArchive, color: 'text-muted-foreground' },
                        ].map((action, i) => (
                          <motion.button
                            key={action.label}
                            onClick={action.action}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-lg flex items-center gap-2.5 group transition-colors"
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ x: 2 }}
                          >
                            <action.icon className={cn("w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors", action.color)} />
                            <span className={cn(action.color)}>{action.label}</span>
                          </motion.button>
                        ))}
                      </div>

                      {/* Danger zone */}
                      <div className="h-px bg-border my-1" />
                      <div className="px-1.5">
                        <motion.button
                          onClick={() => { setConfirmDelete(true); setShowMoreMenu(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 rounded-lg flex items-center gap-2.5 text-destructive transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete task
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground"
                  whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-2 space-y-4">
              {/* Title */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-start gap-2">
                <div className={cn("w-1.5 h-8 rounded-full mt-1.5 flex-shrink-0", priority.color.replace('text', 'bg'))} />
                <div className="flex-1">
                  <h2 className={cn("text-xl font-black text-foreground leading-tight tracking-tight", isDone && "line-through text-muted-foreground")}>
                    {task.title}
                  </h2>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{task.description}</p>
                  )}
                </div>
              </motion.div>

              {/* Metadata */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="space-y-0.5 bg-muted/30 rounded-xl p-3 border border-border/50"
              >
                {/* Priority */}
                <div className="flex items-center justify-between py-2" onMouseEnter={() => setIsHovering('priority')} onMouseLeave={() => setIsHovering(null)}>
                  <div className="flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Priority</span>
                  </div>
                  <motion.div animate={{ scale: isHovering === 'priority' ? 1.05 : 1 }} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg", priority.bg)}>
                    <PriorityIcon className={cn("w-3.5 h-3.5", priority.color)} />
                    <span className="text-xs font-semibold">{priority.label}</span>
                  </motion.div>
                </div>

                {/* Due date */}
                {timeInfo && (
                  <div className="flex items-center justify-between py-2" onMouseEnter={() => setIsHovering('due')} onMouseLeave={() => setIsHovering(null)}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Due</span>
                    </div>
                    <motion.div animate={{ scale: isHovering === 'due' ? 1.05 : 1 }} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg", taskIsOverdue ? "bg-destructive/10" : "bg-muted")}>
                      {taskIsOverdue && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      <div className="text-right">
                        <p className={cn("text-xs font-semibold", taskIsOverdue && "text-destructive")}>{timeInfo.date}</p>
                        <p className="text-[10px] text-muted-foreground">{timeInfo.time}</p>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Logged time */}
                {totalSeconds > 0 && (
                  <div className="flex items-center justify-between py-2" onMouseEnter={() => setIsHovering('time')} onMouseLeave={() => setIsHovering(null)}>
                    <div className="flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Logged</span>
                    </div>
                    <motion.div animate={{ scale: isHovering === 'time' ? 1.05 : 1 }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted">
                      {task.timeTracking?.isRunning && (
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                      )}
                      <span className="text-xs font-semibold font-mono">
                        {timeDisplay.hours > 0 ? `${timeDisplay.hours}h ` : ''}
                        {timeDisplay.minutes > 0 ? `${timeDisplay.minutes}m ` : ''}
                        {timeDisplay.seconds}s
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Tags</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[180px]">
                      {task.tags.map((tag, i) => (
                        <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.1, y: -1 }}
                          className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold"
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Created</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                    {format(new Date(task.createdAt), 'MMM d, yyyy · HH:mm')}
                  </span>
                </div>

                {/* Completed */}
                {task.completedAt && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-medium text-muted-foreground">Completed</span>
                    </div>
                    <span className="text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                      {format(new Date(task.completedAt), 'MMM d, yyyy · HH:mm')}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer actions */}
            <div className="px-4 pb-5 pt-2">
              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-2">
                    <p className="text-center text-xs text-muted-foreground pb-1 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> This cannot be undone
                    </p>
                    <div className="flex gap-2">
                      <motion.button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Cancel
                      </motion.button>
                      <motion.button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-2">
                    {/* Complete */}
                    <motion.button
                      onClick={handleComplete}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all relative overflow-hidden group",
                        isDone ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-green-500 text-white hover:shadow-md hover:shadow-green-500/20"
                      )}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      <motion.div className="absolute inset-0 bg-white/20" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.5 }} />
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isDone ? 'Mark as Incomplete' : 'Mark as Done'}
                      <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>

                    {/* Edit + Delete */}
                    <div className="flex gap-1.5">
                      <motion.button onClick={() => setConfirmDelete(true)} className="flex items-center justify-center w-9 h-9 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button onClick={handleEdit} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Edit2 className="w-3.5 h-3.5" /> Edit Task
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none overflow-hidden opacity-50">
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}