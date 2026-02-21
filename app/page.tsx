'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer'; // Import Footer
import { TaskDialog } from './components/tasks/TaskDialog';
import { DashboardView } from './components/views/DashboardView';
import { BoardView } from './components/views/BoardView';
import { TasksView } from './components/views/TasksView';
import { CalendarView } from './components/views/CalendarView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { useTaskStore } from './components/hooks/useTaskStore';
import { useTaskReminders } from './components/hooks/useTaskReminders';
import { useAccentColor } from './components/hooks/useAccentColor';
import { Task, Status } from './types/task';
import { cn } from './components/utils';

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard:     { title: 'Dashboard',     subtitle: 'Your productivity at a glance' },
  tasks:         { title: 'All Tasks',     subtitle: 'View and manage all your tasks' },
  board:         { title: 'Project Board', subtitle: 'Kanban-style task management' },
  calendar:      { title: 'Calendar',      subtitle: 'Tasks by due date' },
  notifications: { title: 'Notifications', subtitle: 'Tasks that need your attention' },
  settings:      { title: 'Settings',      subtitle: 'Customize your workspace' },
};

// Views where search results make sense — search is ACTIVE on all other views
// but searching only makes sense where tasks are displayed
const SEARCHABLE_VIEWS = ['tasks', 'dashboard', 'board', 'calendar'];

export default function Home() {
  const [activeView, setActiveView]         = useState('dashboard');
  const [searchQuery, setSearchQuery]       = useState('');
  const [isDialogOpen, setIsDialogOpen]     = useState(false);
  const [editingTask, setEditingTask]       = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus]   = useState<Status>('todo');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { tasks, addTask, updateTask, deleteTask, isLoaded } = useTaskStore();

  // Restores saved accent color + theme on every page load
  useAccentColor();

  // Auto-fires reminders when task due times are reached
  useTaskReminders(tasks);

  // Listen for "mark done" events from OS notification clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const { taskId } = (e as CustomEvent).detail;
      updateTask(taskId, { status: 'done' });
      toast.success('Task marked as done! ✓');
    };
    window.addEventListener('kazistack:complete', handler);
    return () => window.removeEventListener('kazistack:complete', handler);
  }, [updateTask]);

  // Clear search when switching views so stale queries don't persist
  useEffect(() => {
    setSearchQuery('');
  }, [activeView]);

  const urgentTasks = useMemo(
    () => tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    [tasks]
  );

  // Filter tasks by search query — used across all task-displaying views
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q)) ||
      (t.tags?.some(tag => tag.toLowerCase().includes(q)))
    );
  }, [tasks, searchQuery]);

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
    localStorage.removeItem('kazistack-tasks');
    window.location.reload();
  };

  // Called from NotificationsView's settings gear icon
  const handleGoToNotificationSettings = () => {
    setActiveView('settings');
  };

  const viewInfo = viewTitles[activeView] || { title: 'kazistack' };
  const isSearchActive = searchQuery.trim().length > 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        notificationCount={urgentTasks}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header shown on ALL views including settings */}
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

        {/* Global search results overlay — shown when searching on non-task views */}
        {isSearchActive && !SEARCHABLE_VIEWS.includes(activeView) && (
          <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-1">
            <p className="text-xs text-muted-foreground font-medium">
              Showing search results across all tasks
            </p>
          </div>
        )}

        {/* Main content area - grows to push footer down */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <DashboardView
                key="dashboard"
                tasks={filteredTasks}
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
                tasks={filteredTasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onEditTask={handleEditTask}
                onAddTask={handleAddTaskWithStatus}
              />
            )}

            {activeView === 'calendar' && (
              <CalendarView
                key="calendar"
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}

            {activeView === 'notifications' && (
              <NotificationsView
                key="notifications"
                tasks={tasks}
                onViewTask={handleEditTask}
                onCompleteTask={(id) => updateTask(id, { status: 'done' })}
                onGoToSettings={handleGoToNotificationSettings}
              />
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

        {/* Footer - now at the bottom of every page */}
        <Footer />
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