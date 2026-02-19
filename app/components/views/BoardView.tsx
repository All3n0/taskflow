'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Task, Status } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailPopup } from '../../components/tasks/TaskDetailPopup';
import { cn } from '../utils';

interface BoardViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

interface Column {
  id: Status;
  title: string;
  dot: string;
  header: string;
}

const columns: Column[] = [
  { id: 'backlog',     title: 'Backlog',      dot: 'bg-muted-foreground', header: 'border-muted-foreground/30' },
  { id: 'todo',        title: 'To Do',         dot: 'bg-primary',          header: 'border-primary/30' },
  { id: 'in-progress', title: 'In Progress',   dot: 'bg-yellow-500',       header: 'border-yellow-500/30' },
  { id: 'done',        title: 'Done',          dot: 'bg-green-500',        header: 'border-green-500/30' },
];

export function BoardView({ tasks, onUpdateTask, onDeleteTask, onEditTask, onAddTask }: BoardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // Horizontal scroll on mobile, grid on desktop
        className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible"
      >
        {columns.map((column, colIndex) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.07 }}
              // Fixed width on mobile so it scrolls nicely, auto on desktop
              className="flex flex-col flex-shrink-0 w-[280px] sm:w-auto"
            >
              {/* Column header */}
              <div className={cn(
                "flex items-center justify-between mb-3 px-3 py-2.5 rounded-xl border bg-secondary/20",
                column.header
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.dot)} />
                  <h3 className="font-bold text-sm">{column.title}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2.5 min-h-[120px] p-2.5 rounded-xl bg-secondary/20 border border-border/40">
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
                    className="flex flex-col items-center justify-center h-20 gap-2"
                  >
                    <button
                      onClick={() => onAddTask(column.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add task
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
        onEdit={(task) => { closeDetail(); onEditTask(task); }}
      />
    </>
  );
}