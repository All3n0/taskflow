'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Calendar,
  Kanban, Bell, Settings, Zap, X,
} from 'lucide-react';
import { cn } from '../utils';
import { useEffect } from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  notificationCount?: number;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
  { id: 'board',     label: 'Board',     icon: Kanban },
  { id: 'calendar',  label: 'Calendar',  icon: Calendar },
];

export function Sidebar({
  activeView,
  onViewChange,
  notificationCount = 0,
  isMobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) {
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleNavClick = (id: string) => {
    onViewChange(id);
    onMobileMenuClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center justify-between flex-shrink-0 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span
            className="text-lg font-black tracking-tight"
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            kazora
          </span>
        </div>
        <button
          onClick={onMobileMenuClose}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p
          className="text-[9px] font-black uppercase tracking-widest px-4 mb-2"
          style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}
        >
          Navigation
        </p>
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={isActive ? {
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              } : {
                color: 'var(--sidebar-foreground)',
                opacity: 0.7,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-accent)';
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.opacity = '0.7';
                }
              }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary-foreground)', opacity: 0.7 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-3 py-3 space-y-0.5 flex-shrink-0 border-t"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <p
          className="text-[9px] font-black uppercase tracking-widest px-4 mb-2"
          style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}
        >
          System
        </p>
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount > 0 ? notificationCount : null },
          { id: 'settings',      label: 'Settings',       icon: Settings, badge: null },
        ].map(item => {
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={isActive ? {
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              } : {
                color: 'var(--sidebar-foreground)',
                opacity: 0.7,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-accent)';
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.opacity = '0.7';
                }
              }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-black bg-destructive text-destructive-foreground rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // Shared aside style using your CSS variables directly
  const asideStyle = {
    backgroundColor: 'var(--sidebar-background)',
    borderColor: 'var(--sidebar-border)',
  };

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r z-40"
        style={asideStyle}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileMenuClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r z-50 lg:hidden"
              style={asideStyle}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}