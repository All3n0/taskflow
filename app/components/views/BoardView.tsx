'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Task, Status } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
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
  color: string;
}

const columns: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-muted-foreground' },
  { id: 'todo', title: 'To Do', color: 'bg-primary' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-warning' },
  { id: 'done', title: 'Done', color: 'bg-success' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export function BoardView({ tasks, onUpdateTask, onDeleteTask, onEditTask, onAddTask }: BoardViewProps) {
  const getTasksByStatus = (status: Status) => 
    tasks.filter((task) => task.status === status);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 h-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)} />
                  <h3 className="font-medium text-sm">{column.title}</h3>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="p-1 rounded-md hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-3 min-h-[200px] p-3 rounded-xl bg-secondary/30">
                <AnimatePresence mode="popLayout">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onEdit={onEditTask}
                    />
                  ))}
                </AnimatePresence>

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
