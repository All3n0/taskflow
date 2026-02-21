'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, ChevronDown, X, Clock, Flag, 
  Circle, AlertTriangle, Zap, CheckCircle2,
  Loader2, Archive, Sparkles, ArrowRight,
  Tag, Timer, Coffee, Rocket
} from 'lucide-react';
import { Task, Status, Priority } from '../../types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../utils';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

const priorityConfig = {
  low: { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Low' },
  medium: { icon: Circle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Medium' },
  high: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'High' },
  urgent: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Urgent' },
};

const statusConfig = {
  backlog: { icon: Archive, color: 'text-muted-foreground', bg: 'bg-muted/40', label: 'Backlog' },
  todo: { icon: Circle, color: 'text-foreground', bg: 'bg-secondary', label: 'To Do' },
  'in-progress': { icon: Loader2, color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' },
  done: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Done' },
};

export function TaskDialog({ open, onOpenChange, task, onSave, onUpdate }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setStatus(task.status);
      setPriority(task.priority);
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        setDueDate(d);
        const isFull = d.getHours() === 23 && d.getMinutes() === 59;
        setIsFullDay(isFull);
        if (!isFull) setStartTime({ hours: d.getHours(), minutes: d.getMinutes() });
      }
      if (task.timeTracking?.entries?.length) {
        const last = task.timeTracking.entries[task.timeTracking.entries.length - 1];
        if (last.endTime) {
          const end = new Date(last.endTime);
          setEndTime({ hours: end.getHours(), minutes: end.getMinutes() });
        }
      }
    } else {
      setTitle('');
      setStatus('todo');
      setPriority('medium');
      setDueDate(undefined);
      setIsFullDay(true);
      setStartTime(null);
      setEndTime(null);
      setCalendarOpen(false);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalDate = dueDate ? new Date(dueDate) : undefined;
    if (finalDate) {
      if (isFullDay) finalDate.setHours(23, 59, 59, 999);
      else if (startTime) finalDate.setHours(startTime.hours, startTime.minutes, 0, 0);
    }

    let timeTracking = task?.timeTracking;
    if (!isFullDay && finalDate && startTime) {
      const startDate = new Date(finalDate);
      startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
      let endDate: Date | undefined;
      if (endTime) {
        endDate = new Date(finalDate);
        endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
      }
      const duration = endDate
        ? Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
        : undefined;
      timeTracking = {
        totalTime: duration ?? 0,
        estimatedTime: duration,
        isRunning: false,
        entries: [{
          id: crypto.randomUUID(),
          taskId: task?.id ?? '',
          startTime: startDate.toISOString(),
          endTime: endDate?.toISOString(),
          duration,
          createdAt: new Date().toISOString(),
        }],
      };
    }

    const updates: Partial<Task> = { title, status, priority, dueDate: finalDate?.toISOString(), timeTracking };
    task && onUpdate ? onUpdate(task.id, updates) : onSave(updates);
    onOpenChange(false);
  };

  const dueDateLabel = () => {
    if (!dueDate) return 'Set deadline';
    if (isFullDay) return format(dueDate, 'MMM d, yyyy');
    const s = startTime ? `${String(startTime.hours).padStart(2,'0')}:${String(startTime.minutes).padStart(2,'0')}` : '';
    const e = endTime ? ` → ${String(endTime.hours).padStart(2,'0')}:${String(endTime.minutes).padStart(2,'0')}` : '';
    return `${format(dueDate, 'MMM d')} ${s}${e}`;
  };

  const PriorityIcon = priorityConfig[priority].icon;
  const StatusIcon = statusConfig[status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-background border-border rounded-3xl p-0 shadow-2xl gap-0 overflow-hidden">
        {/* Decorative header gradient */}
        <motion.div 
          className="h-1.5 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <DialogHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              {task ? (
                <>
                  <Rocket className="w-4 h-4 text-primary" />
                  <DialogTitle className="text-xl font-black">Edit Task</DialogTitle>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-primary" />
                  <DialogTitle className="text-xl font-black">New Task</DialogTitle>
                </>
              )}
            </motion.div>
            <motion.button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
          {/* Title with animated focus ring */}
          <motion.div 
            className="space-y-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest flex items-center gap-1">
              <span>📝</span> Title
            </Label>
            <div className="relative">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-secondary/40 border-none h-10 rounded-xl text-base font-bold pl-3 pr-8 focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Enter task name..."
                autoFocus
              />
              {title && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Deadline — inline calendar toggle with enhanced UI */}
          <motion.div 
            className="space-y-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Deadline
            </Label>
            <motion.button
              type="button"
              onClick={() => setCalendarOpen(v => !v)}
              onHoverStart={() => setIsHovering('calendar')}
              onHoverEnd={() => setIsHovering(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 h-10 rounded-xl bg-secondary/40 text-left transition-all relative overflow-hidden group",
                !dueDate && "text-muted-foreground",
                isHovering === 'calendar' && "bg-secondary/60"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                animate={isHovering === 'calendar' ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              </motion.div>
              <span className="text-xs font-bold flex-1 truncate">{dueDateLabel()}</span>
              <motion.div animate={{ rotate: calendarOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
              
              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ x: '-100%' }}
                animate={{ x: isHovering === 'calendar' ? '0%' : '-100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            {/* Inline calendar with enhanced animations */}
            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <motion.div 
                    className="pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Calendar
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                      }}
                      isFullDay={isFullDay}
                      onFullDayChange={setIsFullDay}
                      startTime={startTime}
                      endTime={endTime}
                      onStartTimeChange={setStartTime}
                      onEndTimeChange={setEndTime}
                      className="w-full rounded-xl border border-border/50 shadow-lg"
                    />
                    {dueDate && (
                      <motion.button
                        type="button"
                        onClick={() => setCalendarOpen(false)}
                        className="w-full mt-2 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Confirm Date
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Priority + Status — side by side with icons */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest flex items-center gap-1">
                <Flag className="w-2.5 h-2.5" /> Priority
              </Label>
              <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                <SelectTrigger className="bg-secondary/40 border-none h-10 rounded-xl font-bold text-sm focus:ring-primary transition-all hover:bg-secondary/60">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <PriorityIcon className={cn("w-3.5 h-3.5", priorityConfig[priority].color)} />
                      <span>{priorityConfig[priority].label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(p => {
                    const Icon = priorityConfig[p].icon;
                    return (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-3.5 h-3.5", priorityConfig[p].color)} />
                          <span>{priorityConfig[p].label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Status
              </Label>
              <Select value={status} onValueChange={(v: Status) => setStatus(v)}>
                <SelectTrigger className="bg-secondary/40 border-none h-10 rounded-xl font-bold text-sm focus:ring-primary transition-all hover:bg-secondary/60">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("w-3.5 h-3.5", statusConfig[status].color, status === 'in-progress' && "animate-spin")} />
                      <span>{statusConfig[status].label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  {(['backlog', 'todo', 'in-progress', 'done'] as Status[]).map(s => {
                    const Icon = statusConfig[s].icon;
                    return (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-3.5 h-3.5", statusConfig[s].color, s === 'in-progress' && "animate-spin")} />
                          <span>{statusConfig[s].label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Time tracking indicator if exists */}
          {task?.timeTracking && task.timeTracking.totalTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10"
            >
              <Timer className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Time logged:</span>
              <span className="text-xs font-mono font-bold text-foreground ml-auto">
                {Math.floor(task.timeTracking.totalTime / 3600)}h {Math.floor((task.timeTracking.totalTime % 3600) / 60)}m
              </span>
            </motion.div>
          )}

          {/* Actions with enhanced animations - FIXED: removed motion props from Button */}
          <motion.div 
            className="flex gap-2 pt-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {/* Cancel button wrapped in motion.div for animations */}
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl font-bold h-10 text-sm hover:bg-secondary/80 transition-all"
              >
                Cancel
              </Button>
            </motion.div>

            {/* Submit button wrapped in motion.div for animations */}
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={!title.trim()}
                className="w-full bg-primary text-white rounded-xl h-10 font-black text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {task ? 'Update Task' : 'Create Task'}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.4 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}