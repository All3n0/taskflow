'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import {
  CheckCircle2, Clock, AlertCircle, TrendingUp, ArrowUpRight,
  Sun, Sunrise, CalendarDays, Inbox, ChevronRight,
} from 'lucide-react';
import { Task } from '../../types/task';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailPopup } from '../../components/tasks/TaskDetailPopup';
import { cn } from '../utils';

interface DashboardViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask?: (task: Task) => void; // Optional for duplicate functionality
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const TIME_TABS = [
  { id: 'today',    label: 'Today',     icon: Sun,         color: 'text-orange-400',  bg: 'bg-orange-400/10',  activeBg: 'bg-orange-400',  border: 'border-orange-400/30' },
  { id: 'tomorrow', label: 'Tomorrow',  icon: Sunrise,     color: 'text-blue-400',    bg: 'bg-blue-400/10',    activeBg: 'bg-blue-400',    border: 'border-blue-400/30' },
  { id: 'week',     label: 'This Week', icon: CalendarDays, color: 'text-violet-400', bg: 'bg-violet-400/10',  activeBg: 'bg-violet-400',  border: 'border-violet-400/30' },
  { id: 'other',   label: 'No Date',   icon: Inbox,        color: 'text-muted-foreground', bg: 'bg-secondary', activeBg: 'bg-secondary-foreground', border: 'border-border' },
] as const;

type TabId = typeof TIME_TABS[number]['id'];

function categorizeTasks(tasks: Task[]) {
  const active = tasks.filter(t => t.status !== 'done');
  const today: Task[]    = [];
  const tomorrow: Task[] = [];
  const week: Task[]     = [];
  const other: Task[]    = [];

  active.forEach(task => {
    if (!task.dueDate) { other.push(task); return; }
    const due = new Date(task.dueDate);
    if (isToday(due))          today.push(task);
    else if (isTomorrow(due))  tomorrow.push(task);
    else if (isThisWeek(due))  week.push(task);
    else                       other.push(task);
  });

  // Sort each group: overdue/urgent first
  const sort = (arr: Task[]) => arr.sort((a, b) => {
    const aUrgent = a.priority === 'urgent' || a.priority === 'high' ? 0 : 1;
    const bUrgent = b.priority === 'urgent' || b.priority === 'high' ? 0 : 1;
    return aUrgent - bUrgent;
  });

  return { today: sort(today), tomorrow: sort(tomorrow), week: sort(week), other: sort(other) };
}

export function DashboardView({ tasks, onUpdateTask, onDeleteTask, onEditTask, onAddTask }: DashboardViewProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('today');

  const openDetail = (task: Task) => { setDetailTask(task); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); };

  // Optional handlers for enhanced popup features
  const handleDuplicate = (task: Task) => {
    if (!onAddTask) return;
    
    const duplicatedTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'todo',
      completedAt: undefined,
      timeTracking: task.timeTracking ? {
        ...task.timeTracking,
        entries: [],
        totalTime: 0,
        isRunning: false,
        activeEntryId: undefined
      } : undefined
    };
    onAddTask(duplicatedTask);
  };

  const handleCopyLink = (task: Task) => {
    const url = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
  };

  const handleBookmark = (task: Task) => {
    // Store bookmarks in localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedTasks') || '[]');
    if (!bookmarks.includes(task.id)) {
      bookmarks.push(task.id);
      localStorage.setItem('bookmarkedTasks', JSON.stringify(bookmarks));
    }
  };

  const handleArchive = (task: Task) => {
    // Archive by moving to backlog
    onUpdateTask(task.id, { status: 'backlog' });
  };

  const handleAddReminder = (task: Task) => {
    // This would typically open a date picker modal
    console.log('Add reminder for task:', task.id);
  };

  const handleShare = (task: Task) => {
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: task.title,
        text: task.description || 'Check out this task',
        url: `${window.location.origin}/tasks/${task.id}`,
      }).catch(console.error);
    } else {
      // Fallback to copying link
      handleCopyLink(task);
    }
  };

  const handlePrint = (task: Task) => {
    // Create a printable version of the task
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${task.title} - Task Details</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
              h1 { font-size: 2rem; margin-bottom: 1rem; color: #1a1a1a; }
              .metadata { display: grid; gap: 1rem; margin: 2rem 0; background: #f5f5f5; padding: 1.5rem; border-radius: 0.5rem; }
              .row { display: flex; }
              .label { font-weight: 600; color: #666; width: 120px; }
              .value { color: #1a1a1a; }
              .description { background: #fafafa; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #007bff; }
              @media (prefers-color-scheme: dark) {
                body { background: #1a1a1a; color: #e5e5e5; }
                h1 { color: #e5e5e5; }
                .metadata { background: #2a2a2a; }
                .label { color: #999; }
                .value { color: #e5e5e5; }
                .description { background: #2a2a2a; border-left-color: #4d9fff; }
              }
            </style>
          </head>
          <body>
            <h1>${task.title}</h1>
            ${task.description ? `<div class="description"><p>${task.description}</p></div>` : ''}
            <div class="metadata">
              <div class="row"><span class="label">Status:</span><span class="value">${task.status}</span></div>
              <div class="row"><span class="label">Priority:</span><span class="value">${task.priority}</span></div>
              ${task.dueDate ? `<div class="row"><span class="label">Due:</span><span class="value">${format(new Date(task.dueDate), 'PPP')}</span></div>` : ''}
              ${task.startDate ? `<div class="row"><span class="label">Start:</span><span class="value">${format(new Date(task.startDate), 'PPP')}</span></div>` : ''}
              ${task.assignee ? `<div class="row"><span class="label">Assignee:</span><span class="value">${task.assignee}</span></div>` : ''}
              ${task.project ? `<div class="row"><span class="label">Project:</span><span class="value">${task.project}</span></div>` : ''}
              ${task.tags && task.tags.length > 0 ? `<div class="row"><span class="label">Tags:</span><span class="value">${task.tags.join(', ')}</span></div>` : ''}
              <div class="row"><span class="label">Created:</span><span class="value">${format(new Date(task.createdAt), 'PPP')}</span></div>
              ${task.completedAt ? `<div class="row"><span class="label">Completed:</span><span class="value">${format(new Date(task.completedAt), 'PPP')}</span></div>` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAssign = (task: Task) => {
    // This would typically open a user selector modal
    console.log('Assign task:', task.id);
    // For demo, we'll just log it
  };

  const handleMoveToProject = (task: Task) => {
    // This would typically open a project selector modal
    console.log('Move task to project:', task.id);
    // For demo, we'll just log it
  };

  const completedCount  = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const urgentCount     = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const completionRate  = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const stats = [
    { label: 'Completed',       value: completedCount,       icon: CheckCircle2, color: 'text-green-500',  bgColor: 'bg-green-500/10' },
    { label: 'In Progress',     value: inProgressCount,      icon: Clock,        color: 'text-primary',    bgColor: 'bg-primary/10' },
    { label: 'High Priority',   value: urgentCount,          icon: AlertCircle,  color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp,   color: 'text-primary',    bgColor: 'bg-primary/10' },
  ];

  const { today, tomorrow, week, other } = categorizeTasks(tasks);
  const categoryMap: Record<TabId, Task[]> = { today, tomorrow, week, other };
  const currentTasks = categoryMap[activeTab];
  const activeTabConfig = TIME_TABS.find(t => t.id === activeTab)!;
  const ActiveIcon = activeTabConfig.icon;

  const getEmptyMessage = (tab: TabId) => ({
    today:    { title: 'Nothing due today', sub: 'Enjoy the breathing room 🎉' },
    tomorrow: { title: 'Tomorrow is clear', sub: 'Plan ahead and add tasks for tomorrow' },
    week:     { title: 'Week is open',      sub: 'No upcoming tasks this week' },
    other:    { title: 'No undated tasks',  sub: 'All your tasks have due dates' },
  }[tab]);

  const empty = getEmptyMessage(activeTab);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">

        {/* Stats */}
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

        {/* Tabbed Task Section */}
        <motion.div variants={item} className="glass rounded-2xl overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-border/50 bg-secondary/10">
            {TIME_TABS.map(tab => {
              const count = categoryMap[tab.id].length;
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all text-center",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className={cn("absolute bottom-0 left-0 right-0 h-0.5", tab.activeBg)}
                    />
                  )}

                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-bold",
                    isActive ? tab.color : ""
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>

                  {/* Count badge */}
                  {count > 0 ? (
                    <span className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px]",
                      isActive
                        ? cn(tab.bg, tab.color)
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/50">—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-5">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", activeTabConfig.bg)}>
                  <ActiveIcon className={cn("w-3.5 h-3.5", activeTabConfig.color)} />
                </div>
                <div>
                  <h2 className="text-sm font-black">{activeTabConfig.label}</h2>
                  <p className="text-[10px] text-muted-foreground">
                    {currentTasks.length} task{currentTasks.length !== 1 ? 's' : ''}
                    {activeTab === 'today' && ' · ' + format(new Date(), 'MMM d')}
                  </p>
                </div>
              </div>

              {/* Overdue indicator for today */}
              {activeTab === 'today' && today.some(t => t.dueDate && isPast(new Date(t.dueDate))) && (
                <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                  Some overdue
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {currentTasks.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {currentTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                        onEdit={openDetail}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed",
                      activeTabConfig.border
                    )}
                  >
                    <div className={cn("p-4 rounded-full mb-3", activeTabConfig.bg)}>
                      <ActiveIcon className={cn("w-6 h-6", activeTabConfig.color)} />
                    </div>
                    <p className="text-sm font-bold text-foreground">{empty.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{empty.sub}</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Task Detail Popup with all features */}
    <TaskDetailPopup
  task={detailTask}
  open={detailOpen}
  onClose={closeDetail}
  onComplete={(id, done) => {
    onUpdateTask(id, {
      status: done ? 'done' : 'todo',
      completedAt: done ? new Date().toISOString() : undefined,
    });
    closeDetail();
  }}
  onDelete={(id) => { onDeleteTask(id); closeDetail(); }}
  onEdit={(task) => { closeDetail(); onEditTask(task); }}
  onDuplicate={(task) => {
    const duplicate = {
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'todo' as const,
      completedAt: undefined,
      timeTracking: task.timeTracking
        ? { ...task.timeTracking, entries: [], totalTime: 0, isRunning: false, activeEntryId: undefined }
        : undefined,
    };
    // Add it via store directly — need to expose addTask or use updateTask workaround
    onEditTask(duplicate); // opens it in the dialog so user can save it
    closeDetail();
  }}
/>
    </>
  );
}