'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TaskDialog } from './components/tasks/TaskDialog';
import { DashboardView } from './components/views/DashboardView';
import { BoardView } from './components/views/BoardView';
import { TasksView } from './components/views/TasksView';
import { CalendarView } from './components/views/CalendarView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { useTaskStore } from './components/hooks/useTaskStore';
import { useTaskReminders } from './components/hooks/useTaskReminders';
import { useAccentColor } from './components/hooks/useAccentColor'; // ← ADD THIS IMPORT
import { Task, Status } from './types/task';

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard:     { title: 'Dashboard',     subtitle: 'Your productivity at a glance' },
  tasks:         { title: 'All Tasks',     subtitle: 'View and manage all your tasks' },
  board:         { title: 'Project Board', subtitle: 'Kanban-style task management' },
  calendar:      { title: 'Calendar',      subtitle: 'Tasks by due date' },
  notifications: { title: 'Notifications', subtitle: 'Manage alerts and reminders' },
  settings:      { title: 'Settings',      subtitle: 'Customize your workspace' },
};

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { tasks, addTask, updateTask, deleteTask, isLoaded } = useTaskStore();

  // ✅ ADD THIS — restores saved accent color + theme on every page load
  // This is what makes the color persist when you refresh or open a new tab
  useAccentColor();

  // 🔔 Auto-fires reminders when task due times are reached
  useTaskReminders(tasks);

  // ✅ Listen for "mark done" events fired from OS notification clicks or toast buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const { taskId } = (e as CustomEvent).detail;
      updateTask(taskId, { status: 'done' });
      toast.success('Task marked as done! ✓');
    };
    window.addEventListener('kazora:complete', handler);
    return () => window.removeEventListener('kazora:complete', handler);
  }, [updateTask]);

  const urgentTasks = useMemo(
    () => tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    [tasks]
  );

  const handleAddTask = () => {
    setEditingTask(null);
    setDefaultStatus('todo');
    setIsDialogOpen(true);
  };

  const handleAddTaskWithStatus = (status: Status) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    addTask({
      title:        taskData.title || '',
      description:  taskData.description,
      status:       taskData.status || defaultStatus,
      priority:     taskData.priority || 'medium',
      dueDate:      taskData.dueDate,
      tags:         taskData.tags || [],
      timeTracking: taskData.timeTracking,
    });
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  const handleClearAllTasks = () => {
    localStorage.removeItem('kazora-tasks');
    window.location.reload();
  };

  const viewInfo = viewTitles[activeView] || { title: 'Kazora' };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        notificationCount={urgentTasks}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header hidden on settings — settings has its own full layout */}
        {activeView !== 'settings' && (
          <Header
            title={viewInfo.title}
            subtitle={viewInfo.subtitle}
            onAddTask={handleAddTask}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMenuClick={() => setIsMobileMenuOpen(true)}
            tasks={tasks}
            onViewChange={handleViewChange}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <DashboardView
                key="dashboard"
                tasks={tasks}
                onEditTask={handleEditTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {activeView === 'tasks' && (
              <TasksView
                key="tasks"
                tasks={tasks}
                searchQuery={searchQuery}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onEditTask={handleEditTask}
              />
            )}
            {activeView === 'board' && (
              <BoardView
                key="board"
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onEditTask={handleEditTask}
                onAddTask={handleAddTaskWithStatus}
              />
            )}
            {activeView === 'calendar' && (
              <CalendarView
                key="calendar"
                tasks={tasks}
                onEditTask={handleEditTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {activeView === 'notifications' && (
              <NotificationsView key="notifications" />
            )}
            {activeView === 'settings' && (
              <SettingsView
                key="settings"
                tasks={tasks}
                onClearAllTasks={handleClearAllTasks}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        onUpdate={updateTask}
      />
    </div>
  );
}