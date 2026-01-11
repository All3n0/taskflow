import { motion, AnimatePresence } from 'framer-motion';
import { Task, Status } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
import { CheckCircle2 } from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  searchQuery: string;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const statusOrder: Status[] = ['in-progress', 'todo', 'backlog', 'done'];

export function TasksView({ tasks, searchQuery, onUpdateTask, onDeleteTask, onEditTask }: TasksViewProps) {
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTasks = statusOrder.reduce((acc, status) => {
    acc[status] = filteredTasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<Status, Task[]>);

  const statusLabels: Record<Status, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Completed',
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <CheckCircle2 className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">
          {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      {statusOrder.map((status) => {
        const statusTasks = groupedTasks[status];
        if (statusTasks.length === 0) return null;

        return (
          <motion.section
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">{statusLabels[status]}</h2>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                {statusTasks.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        );
      })}
    </motion.div>
  );
}
