'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths,
  startOfWeek, endOfWeek, isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Task, Priority } from '../../types/task';
import { TaskDetailPopup } from '../../components/tasks/TaskDetailPopup';
import { cn } from '../../components/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const priorityDot: Record<Priority, string> = {
  low: 'bg-muted-foreground', medium: 'bg-primary',
  high: 'bg-yellow-500', urgent: 'bg-destructive',
};
const priorityBar: Record<Priority, string> = {
  low: 'bg-muted-foreground/40', medium: 'bg-primary/70',
  high: 'bg-yellow-500/70', urgent: 'bg-destructive/70',
};

const WEEK_DAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarView({ tasks, onEditTask, onUpdateTask, onDeleteTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay]   = useState<Date | null>(null);
  const [detailTask, setDetailTask]     = useState<Task | null>(null);
  const [detailOpen, setDetailOpen]     = useState(false);

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const handleComplete = (id: string, done: boolean) => {
    onUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end:   endOfWeek(endOfMonth(currentMonth)),
  });

  const getTasksForDay = (date: Date) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-4"
        data-testid="calendar-view"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {format(currentMonth, 'MMMM')}
              <span className="text-muted-foreground font-light ml-2">{format(currentMonth, 'yyyy')}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tasks.filter(t => t.dueDate && isSameMonth(new Date(t.dueDate), currentMonth)).length} tasks this month
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 transition-colors mr-1 today-button"
              data-testid="calendar-today-button"
            >
              <CalendarDays className="w-3 h-3" /> Today
            </button>
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
              className="p-2 rounded-xl hover:bg-secondary transition-colors prev-month-button"
              data-testid="calendar-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
              className="p-2 rounded-xl hover:bg-secondary transition-colors next-month-button"
              data-testid="calendar-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="glass rounded-2xl overflow-hidden border border-border/50">
          <div className="grid grid-cols-7 border-b border-border/50 bg-secondary/20">
            {WEEK_DAYS_FULL.map((d, i) => (
              <div key={d} className="py-2.5 text-center">
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d}</span>
                <span className="sm:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">{WEEK_DAYS_SHORT[i]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayTasks   = getTasksForDay(day);
              const inMonth    = isSameMonth(day, currentMonth);
              const isTodays   = isToday(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              return (
                <motion.button
                  key={day.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    "relative min-h-[60px] sm:min-h-[90px] p-1 sm:p-2 border-b border-r border-border/30 text-left transition-colors calendar-day",
                    "hover:bg-secondary/30 active:bg-secondary/50",
                    !inMonth && "opacity-40",
                    isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                  )}
                  data-date={format(day, 'yyyy-MM-dd')}
                  data-in-month={inMonth}
                  data-is-today={isTodays}
                  data-is-selected={isSelected}
                  data-task-count={dayTasks.length}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold mb-1 day-number",
                    isTodays && "bg-primary text-primary-foreground",
                    !isTodays && inMonth && "text-foreground",
                    !inMonth && "text-muted-foreground",
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5 calendar-day-tasks">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        onClick={e => { e.stopPropagation(); openDetail(task); }}
                        className={cn(
                          "hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate calendar-day-task",
                          "bg-secondary/60 hover:bg-secondary transition-colors",
                          task.status === 'done' && "opacity-50 line-through"
                        )}
                        data-task-id={task.id}
                        data-priority={task.priority}
                        data-status={task.status}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", task.status === 'done' ? 'bg-green-500' : priorityDot[task.priority])} />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <p className="hidden sm:block text-[9px] text-muted-foreground pl-1.5">+{dayTasks.length - 2} more</p>
                    )}
                    {dayTasks.length > 0 && (
                      <div className="flex sm:hidden gap-0.5 flex-wrap mt-0.5 task-dots">
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id} 
                            className={cn("w-1.5 h-1.5 rounded-full", task.status === 'done' ? 'bg-green-500' : priorityDot[task.priority])} 
                          />
                        ))}
                        {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected day panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-2xl p-4 sm:p-5 border border-border/50 selected-day-panel">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-black text-sm selected-day-title">{format(selectedDay, 'EEEE, MMMM d')}</h3>
                    <p className="text-xs text-muted-foreground selected-day-count">{selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedDay(null)} 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors close-panel-button"
                    data-testid="close-day-panel"
                  >
                    Close
                  </button>
                </div>
                {selectedDayTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 empty-day-message">No tasks due this day</p>
                ) : (
                  <div className="space-y-2 selected-day-tasks">
                    {selectedDayTasks.map(task => (
                      <motion.button
                        key={task.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => openDetail(task)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors text-left group selected-day-task",
                          task.status === 'done' && "opacity-50"
                        )}
                        data-task-id={task.id}
                        data-priority={task.priority}
                        data-status={task.status}
                      >
                        <div className={cn("w-1 h-8 rounded-full flex-shrink-0", task.status === 'done' ? 'bg-green-500' : priorityBar[task.priority])} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-semibold truncate group-hover:text-primary transition-colors", task.status === 'done' && "line-through")}>
                            {task.title}
                          </p>
                          {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className={cn("w-2 h-2 rounded-full", task.status === 'done' ? 'bg-green-500' : priorityDot[task.priority])} />
                          <span className="text-[10px] text-muted-foreground capitalize">{task.status === 'done' ? 'Done' : task.priority}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-muted-foreground flex-wrap priority-legend">
          <span className="font-bold text-[10px] uppercase tracking-widest">Priority</span>
          {Object.entries(priorityDot).map(([p, color]) => (
            <div key={p} className="flex items-center gap-1.5 priority-item" data-priority={p}>
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="capitalize">{p}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
        onEdit={(task) => { closeDetail(); onEditTask(task); }}
        onComplete={(id, done) => {
  onUpdateTask(id, {
    status: done ? 'done' : 'todo',
    completedAt: done ? new Date().toISOString() : undefined,
  });
  closeDetail();
}}
      />
    </>
  );
}