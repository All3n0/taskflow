'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Task, Priority } from '../../types/task';
import { Button } from '../../components/ui/Button';
import { cn } from '../../components/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-muted-foreground',
  medium: 'bg-primary',
  high: 'bg-warning',
  urgent: 'bg-destructive',
};

export function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) =>
    tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-border",
                  !isCurrentMonth && "bg-secondary/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-sm",
                      isCurrentDay && "bg-primary text-primary-foreground font-medium",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs truncate",
                        "bg-secondary/50 hover:bg-secondary transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", priorityColors[task.priority])} />
                        <span className="truncate">{task.title}</span>
                      </div>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4" /> Priority:
        </div>
        {Object.entries(priorityColors).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="capitalize">{priority}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
