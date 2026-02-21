'use client';

import { useState } from 'react';
import { Task } from '../../types/task';
import { TaskCard } from '../tasks/TaskCard';
import { TaskDetailPopup } from '../tasks/TaskDetailPopup';

interface TasksViewProps {
  tasks: Task[];
  searchQuery: string;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export function TasksView({ tasks, searchQuery, onUpdateTask, onDeleteTask, onEditTask }: TasksViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const handleComplete = (id: string, done: boolean) => {
    onUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = {
    'in-progress': filtered.filter(t => t.status === 'in-progress'),
    'todo':        filtered.filter(t => t.status === 'todo'),
    'backlog':     filtered.filter(t => t.status === 'backlog'),
    'done':        filtered.filter(t => t.status === 'done'),
  };

  const groupLabels: Record<string, string> = {
    'in-progress': 'In Progress',
    'todo':        'To Do',
    'backlog':     'Backlog',
    'done':        'Done',
  };

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groups).map(([status, groupTasks]) => {
          if (groupTasks.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {groupLabels[status]}
                </h2>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-semibold">
                  {groupTasks.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {groupTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onEdit={openDetail}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No tasks found</p>
          </div>
        )}
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