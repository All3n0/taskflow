'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Trophy, Zap, Timer } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { Task, Status } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailPopup } from '../../components/tasks/TaskDetailPopup';
import { cn } from '../utils';
import { useStreaks } from '../hooks/UseStreaks';

interface BoardViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

const columns = [
  { id: 'backlog'     as Status, title: 'Backlog',     dot: 'bg-muted-foreground', header: 'border-muted-foreground/30' },
  { id: 'todo'        as Status, title: 'To Do',        dot: 'bg-primary',          header: 'border-primary/30' },
  { id: 'in-progress' as Status, title: 'In Progress',  dot: 'bg-yellow-500',       header: 'border-yellow-500/30' },
  { id: 'done'        as Status, title: 'Done',         dot: 'bg-green-500',        header: 'border-green-500/30' },
];

// Activity Dots Component
function ActivityDots({ completedDates }: { completedDates: string[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(startOfDay(new Date()), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const isToday = i === 6;
    const done = completedDates.includes(key);
    const label = format(d, 'EEE');
    
    return { key, isToday, done, label };
  });

  return (
    <div className="flex items-end gap-1.5">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05 * days.indexOf(d) }}
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all duration-300',
              d.done
                ? d.isToday
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/20'
                  : 'bg-gradient-to-br from-orange-400/80 to-orange-500/80'
                : d.isToday
                  ? 'bg-secondary/40 border-2 border-dashed border-orange-400/30'
                  : 'bg-secondary/40'
            )}
          >
            {d.done && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/60" />
              </div>
            )}
          </motion.div>
          <span className={cn(
            'text-[8px] font-bold tracking-wide',
            d.isToday ? 'text-orange-400' : 'text-muted-foreground/60'
          )}>
            {d.isToday ? 'TODAY' : d.label.slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Streak Tier Helper
function getStreakTier(n: number, alive: boolean) {
  if (!alive || n === 0) return {
    flameColor: 'text-muted-foreground/40',
    numColor: 'text-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted-foreground/20',
    label: 'Complete a task to start!',
  };
  if (n < 3)  return { 
    flameColor: 'text-yellow-400',  
    numColor: 'text-yellow-400',  
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Getting warmed up…' 
  };
  if (n < 7)  return { 
    flameColor: 'text-orange-400',  
    numColor: 'text-orange-400',  
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'On a roll! 🔥' 
  };
  if (n < 14) return { 
    flameColor: 'text-orange-600',  
    numColor: 'text-orange-600',  
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/20',
    label: 'Week streak! 🔥🔥' 
  };
  if (n < 30) return { 
    flameColor: 'text-red-500',     
    numColor: 'text-red-500',     
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'On fire! 🔥🔥🔥' 
  };
  return       { 
    flameColor: 'text-purple-500',        
    numColor: 'text-purple-500',  
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: '⚡ Legendary streak!' 
  };
}

export function BoardView({ tasks, onUpdateTask, onDeleteTask, onEditTask, onAddTask }: BoardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Streak hook
  const streak = useStreaks();

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const handleComplete = (id: string, done: boolean) => {
    if (done) {
      streak.recordCompletion(new Date().toISOString());
    }
    onUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  const streakTier = getStreakTier(streak.currentStreak, streak.streakAlive);

  return (
    <>
      <div className="space-y-6">
        {/* Streak Section - Integrated above the board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            'glass rounded-2xl p-5 sm:p-6 relative overflow-hidden',
            'border transition-all duration-500',
            streakTier.borderColor
          )}
        >
          {/* Background glow effect for active streaks */}
          {streak.currentStreak >= 7 && (
            <div className={cn(
              'absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none',
              streakTier.bgColor.replace('bg-', 'bg-').replace('/10', '/5')
            )} />
          )}

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
            {/* Left: Flame + Streak Number */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
                'transition-all duration-300',
                streakTier.bgColor
              )}>
                <motion.div
                  animate={streak.currentStreak >= 14 ? {
                    scale: [1, 1.1, 1],
                    rotate: [-3, 3, -3, 0],
                  } : streak.currentStreak >= 7 ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ 
                    duration: streak.currentStreak >= 14 ? 2 : 3, 
                    repeat: Infinity,
                    repeatType: 'loop'
                  }}
                >
                  <Flame className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 transition-colors',
                    streakTier.flameColor,
                    streak.currentStreak >= 14 && 'drop-shadow-lg'
                  )} />
                </motion.div>
                
                {streak.currentStreak > 0 && (
                  <motion.div
                    key={streak.currentStreak}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      'absolute -top-1 -right-1 min-w-[1.75rem] h-7 px-1.5 rounded-full',
                      'flex items-center justify-center',
                      'text-xs font-black text-white',
                      streak.currentStreak >= 14 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40' 
                        : streak.currentStreak >= 7
                          ? 'bg-orange-500 shadow-md shadow-orange-500/30'
                          : 'bg-orange-400 shadow-sm shadow-orange-400/20'
                    )}
                  >
                    {streak.currentStreak > 99 ? '99+' : streak.currentStreak}
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    'text-3xl sm:text-4xl font-black tabular-nums leading-none',
                    streakTier.numColor
                  )}>
                    {streak.currentStreak}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground/70">
                    day{streak.currentStreak !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className={cn(
                  'text-xs sm:text-sm font-bold mt-1',
                  streakTier.flameColor
                )}>
                  {streakTier.label}
                </p>
              </div>
            </div>

            {/* Middle: Activity Dots */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Weekly Activity
                </p>
                {streak.activityToday && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    ACTIVE
                  </span>
                )}
              </div>
              <ActivityDots completedDates={streak.completedDates} />
            </div>

            {/* Right: Stats */}
            <div className="flex gap-4 sm:gap-6 flex-shrink-0 self-center lg:self-auto">
              <div className="text-center min-w-[60px]">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Trophy className={cn(
                    'w-4 h-4',
                    streak.longestStreak >= 14 ? 'text-yellow-500' : 'text-muted-foreground/40'
                  )} />
                </div>
                <p className="text-xl sm:text-2xl font-black tabular-nums leading-none">
                  {streak.longestStreak}
                </p>
                <p className="text-[9px] font-semibold text-muted-foreground/60 mt-1 uppercase tracking-wider">
                  Best
                </p>
              </div>
              
              <div className="w-px bg-border/30 self-stretch" />
              
              <div className="text-center min-w-[60px]">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Zap className="w-4 h-4 text-primary/60" />
                </div>
                <p className="text-xl sm:text-2xl font-black tabular-nums leading-none">
                  {streak.totalTasksCompleted}
                </p>
                <p className="text-[9px] font-semibold text-muted-foreground/60 mt-1 uppercase tracking-wider">
                  Total
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar for Next Milestone */}
          {streak.currentStreak > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60">
                <span>
                  Next: {streak.currentStreak < 7 ? '7 days' : 
                         streak.currentStreak < 14 ? '14 days' : 
                         streak.currentStreak < 30 ? '30 days' : 'Legendary'}
                </span>
                <span className="flex-1 text-right">
                  {streak.currentStreak < 7 
                    ? `${7 - streak.currentStreak} days to go` 
                    : streak.currentStreak < 14 
                      ? `${14 - streak.currentStreak} days to go`
                      : streak.currentStreak < 30
                        ? `${30 - streak.currentStreak} days to go`
                        : '🏆 MAX'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: streak.currentStreak < 7 
                      ? `${(streak.currentStreak / 7) * 100}%` 
                      : streak.currentStreak < 14 
                        ? `${((streak.currentStreak - 7) / 7) * 100}%`
                        : streak.currentStreak < 30 
                          ? `${((streak.currentStreak - 14) / 16) * 100}%`
                          : '100%'
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    'h-full rounded-full',
                    streak.currentStreak >= 14 
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                      : streak.currentStreak >= 7 
                        ? 'bg-gradient-to-r from-orange-400/80 to-orange-500/80'
                        : 'bg-gradient-to-r from-orange-300 to-orange-400'
                  )}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Board Columns */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible"
          data-testid="board-view"
        >
          {columns.map((column, colIndex) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * (colIndex + 1) }} // Offset by streak delay
                className="flex flex-col flex-shrink-0 w-[280px] sm:w-auto board-column"
                data-column={column.id}
                data-column-title={column.title}
                data-task-count={columnTasks.length}
              >
                <div className={cn(
                  "flex items-center justify-between mb-3 px-3 py-2.5 rounded-xl border bg-secondary/20 column-header",
                  column.header
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", column.dot)} />
                    <h3 className="font-bold text-sm column-title">{column.title}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full column-count">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddTask(column.id)}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground add-task-button"
                    data-column={column.id}
                    data-testid={`add-task-column-${column.id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div 
                  className="flex-1 space-y-2.5 min-h-[120px] p-2.5 rounded-xl bg-secondary/20 border border-border/40 column-content"
                  data-column={column.id}
                >
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                        onEdit={openDetail}
                      />
                    ))}
                  </AnimatePresence>
                  {columnTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-20 empty-state"
                    >
                      <button
                        onClick={() => onAddTask(column.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors empty-add-button"
                        data-column={column.id}
                      >
                        <Plus className="w-3 h-3" /> Add task
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
        onEdit={(task) => { closeDetail(); onEditTask(task); }}
        onComplete={handleComplete}
      />
    </>
  );
}