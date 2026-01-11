'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  defaultView?: string;
}

export function Layout({ children, defaultView = 'dashboard' }: LayoutProps) {
  const [activeView, setActiveView] = useState(defaultView);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationCount = 3; // This would come from your backend later

  const handleAddTask = () => {
    // This will be implemented when we create the task modal
    console.log('Add task clicked');
  };

  // Determine title based on active view
  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Tasks';
      case 'board': return 'Kanban Board';
      case 'calendar': return 'Calendar';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Settings';
      default: return 'TaskFlow';
    }
  };

  const getSubtitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Overview of your productivity';
      case 'tasks': return 'Manage your tasks and priorities';
      case 'board': return 'Visualize your workflow';
      case 'calendar': return 'Schedule and deadlines';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        notificationCount={notificationCount}
      />
      <div className="pl-64">
        <Header
          title={getTitle()}
          subtitle={getSubtitle()}
          onAddTask={handleAddTask}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}