'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
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

export function TaskDialog({ open, onOpenChange, task, onSave, onUpdate }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Smaller max-width, less padding */}
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-background border-border rounded-3xl p-5 shadow-2xl gap-0">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black">
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
              Title
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-secondary/40 border-none h-10 rounded-xl text-base font-bold"
              placeholder="Task name..."
              autoFocus
            />
          </div>

          {/* Deadline — inline calendar toggle */}
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
              Deadline
            </Label>
            <button
              type="button"
              onClick={() => setCalendarOpen(v => !v)}
              className={cn(
                "w-full flex items-center gap-2 px-3 h-10 rounded-xl bg-secondary/40 text-left transition-colors hover:bg-secondary/60",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-bold flex-1 truncate">{dueDateLabel()}</span>
              <motion.div animate={{ rotate: calendarOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
            </button>

            {/* Inline calendar — expands below the button */}
            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <Calendar
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        // Don't auto-close so user can also set time
                      }}
                      isFullDay={isFullDay}
                      onFullDayChange={setIsFullDay}
                      startTime={startTime}
                      endTime={endTime}
                      onStartTimeChange={setStartTime}
                      onEndTimeChange={setEndTime}
                      className="w-full rounded-xl border border-border/50"
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setCalendarOpen(false)}
                        className="w-full mt-1.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority + Status — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                Priority
              </Label>
              <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                <SelectTrigger className="bg-secondary/40 border-none h-10 rounded-xl font-bold text-sm focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                Status
              </Label>
              <Select value={status} onValueChange={(v: Status) => setStatus(v)}>
                <SelectTrigger className="bg-secondary/40 border-none h-10 rounded-xl font-bold text-sm focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl font-bold h-10 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-primary text-white rounded-xl h-10 font-black text-sm shadow-lg shadow-primary/20"
            >
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}