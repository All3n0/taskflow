// components/contexts/TutorialContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TutorialContextType {
  showTutorial: boolean;
  currentStep: number;
  startTutorial: () => void;
  skipTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeTutorial: () => void;
  setActiveView: (view: string) => void;
  isFromSettings: boolean;
  setIsFromSettings: (value: boolean) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to Kazistack!',
    description: 'Let\'s take a 2-minute tour to explore all the features. You can skip anytime.',
    view: 'dashboard',
    target: null,
    position: 'center' as const,
    icon: 'Sparkles',
    color: 'from-purple-500 to-pink-500',
    mobileMessage: 'Swipe or tap to continue',
  },
  {
    id: 'sidebar',
    title: '📱 Navigation Sidebar',
    description: 'This is your command center. Use it to switch between different views.',
    view: 'dashboard',
    target: '.sidebar',
    position: 'right' as const,
    highlight: 'ring-2 ring-primary ring-offset-2',
    icon: 'Layout',
    color: 'from-blue-500 to-cyan-500',
    mobileMessage: 'Tap the ☰ icon to open sidebar',
  },
  {
    id: 'tasks-view',
    title: '✅ Tasks View',
    description: 'All your tasks in one place. Filter, search, and organize them.',
    view: 'tasks',
    target: '[data-view="tasks"]',
    position: 'bottom' as const,
    icon: 'ListChecks',
    color: 'from-green-500 to-emerald-500',
    mobileMessage: 'This is where you manage all tasks',
  },
  {
    id: 'add-task',
    title: '➕ Adding Tasks',
    description: 'Click the + button to create new tasks. Add descriptions, due dates, and priorities.',
    view: 'tasks',
    target: '[data-testid="add-task-button"]',
    position: 'bottom' as const,
    icon: 'Plus',
    color: 'from-green-500 to-emerald-500',
    mobileMessage: 'Tap + to add a new task',
  },
  {
    id: 'task-card',
    title: '📌 Task Cards',
    description: 'Each task shows its priority, due date, and status. Click to edit, check to complete.',
    view: 'tasks',
    target: '.task-card:first-child',
    position: 'top' as const,
    icon: 'FileText',
    color: 'from-green-500 to-emerald-500',
    mobileMessage: 'Tap any task to edit or complete',
  },
  {
    id: 'board-view',
    title: '📊 Board View',
    description: 'Visualize your workflow with Kanban. Drag and drop tasks between columns.',
    view: 'board',
    target: '[data-view="board"]',
    position: 'bottom' as const,
    icon: 'Kanban',
    color: 'from-orange-500 to-amber-500',
    mobileMessage: 'Swipe horizontally to see all columns',
  },
  {
    id: 'board-columns',
    title: '🎯 Drag & Drop',
    description: 'Move tasks across columns to update their status.',
    view: 'board',
    target: '.board-column:first-child',
    position: 'right' as const,
    icon: 'Move',
    color: 'from-orange-500 to-amber-500',
    mobileMessage: 'Long press to drag on mobile',
  },
  {
    id: 'calendar-view',
    title: '📅 Calendar View',
    description: 'See your tasks by due date. Great for planning your week.',
    view: 'calendar',
    target: '[data-view="calendar"]',
    position: 'bottom' as const,
    icon: 'Calendar',
    color: 'from-red-500 to-rose-500',
    mobileMessage: 'Pinch to zoom on mobile',
  },
  {
    id: 'calendar-today',
    title: '🗓️ Today\'s Date',
    description: 'Current day is highlighted. Click any date to see what\'s due.',
    view: 'calendar',
    target: '.calendar-day[data-is-today="true"]',
    position: 'top' as const,
    icon: 'Clock',
    color: 'from-red-500 to-rose-500',
    mobileMessage: 'Tap any date to view tasks',
  },
  {
    id: 'notifications-view',
    title: '🔔 Notifications Center',
    description: 'See all tasks that need attention: overdue, due today, and upcoming.',
    view: 'notifications',
    target: '[data-view="notifications"]',
    position: 'bottom' as const,
    icon: 'Bell',
    color: 'from-yellow-500 to-orange-500',
    mobileMessage: 'Pull down to refresh notifications',
  },
  {
    id: 'notification-groups',
    title: '⏰ Time Groups',
    description: 'Notifications are grouped by time: Today, Tomorrow, Next Week, and overdue.',
    view: 'notifications',
    target: '.notification-group:first-child',
    position: 'right' as const,
    icon: 'Clock',
    color: 'from-yellow-500 to-orange-500',
    mobileMessage: 'Tap groups to expand/collapse',
  },
  {
    id: 'notification-complete',
    title: '✅ Complete from Here',
    description: 'Mark tasks as done directly from notifications. No need to open each task.',
    view: 'notifications',
    target: '.complete-button:first-child',
    position: 'left' as const,
    icon: 'CheckCircle',
    color: 'from-yellow-500 to-orange-500',
    mobileMessage: 'Tap the circle to complete',
  },
  {
    id: 'settings-view',
    title: '⚙️ Settings',
    description: 'Customize your experience: themes, accent colors, notifications, and data management.',
    view: 'settings',
    target: '[data-view="settings"]',
    position: 'bottom' as const,
    icon: 'Settings',
    color: 'from-indigo-500 to-purple-500',
    mobileMessage: 'All your preferences in one place',
  },
  {
    id: 'settings-appearance',
    title: '🎨 Appearance',
    description: 'Switch between light/dark themes and choose your accent color.',
    view: 'settings',
    target: '[data-section="appearance"]',
    position: 'right' as const,
    icon: 'Palette',
    color: 'from-indigo-500 to-purple-500',
    mobileMessage: 'Tap to customize colors',
  },
  {
    id: 'settings-notifications',
    title: '🔔 Notification Settings',
    description: 'Enable browser notifications, choose sound alerts, and set your preferences.',
    view: 'settings',
    target: '[data-section="notifications"]',
    position: 'left' as const,
    icon: 'Bell',
    color: 'from-indigo-500 to-purple-500',
    mobileMessage: 'Control how you get alerted',
  },
  {
    id: 'settings-tutorial',
    title: '📚 Tutorial',
    description: 'You can restart this tutorial anytime from the Settings page.',
    view: 'settings',
    target: '[data-section="tutorial"]',
    position: 'top' as const,
    icon: 'Sparkles',
    color: 'from-purple-500 to-pink-500',
    mobileMessage: 'Come back here for a refresher',
  },
  {
    id: 'settings-data',
    title: '💾 Data Management',
    description: 'Export your tasks as JSON or CSV, or clear all data. Your data stays on your device.',
    view: 'settings',
    target: '[data-section="data"]',
    position: 'bottom' as const,
    icon: 'Database',
    color: 'from-blue-500 to-cyan-500',
    mobileMessage: 'Backup or clear your tasks',
  },
  {
    id: 'search',
    title: '🔍 Global Search',
    description: 'Search across all tasks from anywhere. Results update in real-time.',
    view: 'dashboard',
    target: '[data-testid="search-input"]',
    position: 'bottom' as const,
    icon: 'Search',
    color: 'from-purple-500 to-pink-500',
    mobileMessage: 'Tap search to filter tasks',
  },
  {
    id: 'complete',
    title: '🎉 You\'re a Pro!',
    description: 'You now know all the key features. Remember, you can restart this tour anytime from Settings.',
    view: 'dashboard',
    target: null,
    position: 'center' as const,
    icon: 'CheckCircle2',
    color: 'from-green-500 to-teal-500',
    mobileMessage: 'Thanks for taking the tour!',
  },
];

export type TutorialStep = typeof TUTORIAL_STEPS[number];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean | null>(null); // Start with null to indicate loading
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isFromSettings, setIsFromSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if user has seen tutorial before - ONLY ONCE
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const seen = localStorage.getItem('kazistack-tutorial-seen');
      
      if (seen === 'true') {
        setHasSeenTutorial(true);
        setShowTutorial(false); // Ensure tutorial is hidden
      } else {
        // First time user - set flag but DON'T show tutorial automatically
        // The tutorial should ONLY be shown when triggered from Settings
        localStorage.setItem('kazistack-tutorial-seen', 'true');
        setHasSeenTutorial(false);
        setShowTutorial(false); // Don't show automatically
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setHasSeenTutorial(false);
      setShowTutorial(false);
    }
  }, []); // Empty dependency array - runs once on mount

  // Auto-navigate when step changes
  useEffect(() => {
    if (showTutorial && TUTORIAL_STEPS[currentStep]) {
      const step = TUTORIAL_STEPS[currentStep];
      if (step.view && step.view !== activeView) {
        setActiveView(step.view);
      }
    }
  }, [currentStep, showTutorial, activeView]);

  const startTutorial = () => {
    console.log('Starting tutorial from Settings');
    setShowTutorial(true);
    setCurrentStep(0);
    setActiveView('dashboard');
    setIsFromSettings(true);
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => {
      if (prev === TUTORIAL_STEPS.length - 1) {
        completeTutorial();
        return prev;
      }
      return prev + 1;
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.min(step, TUTORIAL_STEPS.length - 1));
  };

  // Don't render children until we've checked localStorage
  if (hasSeenTutorial === null) {
    return null; // or a loading spinner
  }

  return (
    <TutorialContext.Provider value={{
      showTutorial,
      currentStep,
      startTutorial,
      skipTutorial,
      nextStep,
      prevStep,
      goToStep,
      completeTutorial,
      setActiveView,
      isFromSettings,
      setIsFromSettings,
    }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}