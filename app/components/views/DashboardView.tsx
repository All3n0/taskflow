'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertCircle, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { Task } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailPopup } from '../../components/tasks/TaskDetailPopup';

interface DashboardViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardView({ tasks, onUpdateTask, onDeleteTask, onEditTask }: DashboardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  const completedCount  = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const urgentCount     = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const completionRate  = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const recentTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Completed',       value: completedCount,       icon: CheckCircle2, color: 'text-green-500',  bgColor: 'bg-green-500/10' },
    { label: 'In Progress',     value: inProgressCount,      icon: Clock,        color: 'text-primary',    bgColor: 'bg-primary/10' },
    { label: 'High Priority',   value: urgentCount,          icon: AlertCircle,  color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp,   color: 'text-primary',    bgColor: 'bg-primary/10' },
  ];

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 sm:space-y-6"
      >
        {/* Stats — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={item}
              className="glass rounded-2xl p-4 sm:p-5 lg:p-6 group hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 sm:p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-2xl sm:text-3xl font-semibold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Tasks */}
        <motion.div variants={item} className="glass rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold">Recent Tasks</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {tasks.filter(t => t.status !== 'done').length} active
            </span>
          </div>

          {recentTasks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onEdit={openDetail}        // ← opens detail popup
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm">All caught up! Create a new task to get started.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <TaskDetailPopup
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
        onEdit={(task) => { closeDetail(); onEditTask(task); }}  // ← closes detail, opens TaskDialog
      />
    </>
  );
}