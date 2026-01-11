'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { Task, Status } from './types/task';

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your productivity at a glance' },
  tasks: { title: 'All Tasks', subtitle: 'View and manage all your tasks' },
  board: { title: 'Project Board', subtitle: 'Kanban-style task management' },
  calendar: { title: 'Calendar', subtitle: 'Tasks by due date' },
  notifications: { title: 'Notifications', subtitle: 'Manage alerts and reminders' },
  settings: { title: 'Settings', subtitle: 'Customize your workspace' },
};

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  // Using the task store
  const { tasks, addTask, updateTask, deleteTask, isLoaded } = useTaskStore();

  const urgentTasks = useMemo(
    () => tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').length,
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

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask({ ...taskData, status: taskData.status || defaultStatus });
  };

  const handleClearAllTasks = () => {
    localStorage.removeItem('taskflow-tasks');
    window.location.reload();
  };

  const viewInfo = viewTitles[activeView] || { title: 'TaskFlow' };

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
        onViewChange={setActiveView}
        notificationCount={urgentTasks}
      />

      <main className="ml-64 min-h-screen">
        {activeView !== 'notifications' && activeView !== 'settings' && (
          <Header
            title={viewInfo.title}
            subtitle={viewInfo.subtitle}
            onAddTask={handleAddTask}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <DashboardView
                key="dashboard"
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onEditTask={handleEditTask}
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
        </div>
      </main>

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