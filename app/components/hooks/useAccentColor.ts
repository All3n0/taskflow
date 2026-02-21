'use client';

import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────
// LOCATION: app/components/hooks/useAccentColor.ts
//
// Exports:
//   applyAccentColor(hex, fg?)  – call anywhere to change color instantly
//   applyTheme(theme)           – call anywhere to change light/dark/system
//   useAccentColor()            – call ONCE in page.tsx to restore on load
// ─────────────────────────────────────────────────────────────────

/**
 * Updates every CSS variable that uses the primary/accent color.
 * Because both :root and .dark read from these same vars, one call
 * updates the whole app in both light AND dark mode simultaneously.
 */
export function applyAccentColor(hex: string, foreground = '#ffffff') {
  const root = document.documentElement;
  root.style.setProperty('--primary',                    hex);
  root.style.setProperty('--primary-foreground',         foreground);
  root.style.setProperty('--accent',                     hex);
  root.style.setProperty('--accent-foreground',          foreground);
  root.style.setProperty('--ring',                       hex);
  root.style.setProperty('--sidebar-primary',            hex);
  root.style.setProperty('--sidebar-primary-foreground', foreground);
  root.style.setProperty('--sidebar-ring',               hex);
  root.style.setProperty('--gradient-primary',
    `linear-gradient(135deg, ${hex}, ${hex}cc)`);
  root.style.setProperty('--shadow-glow',
    `0 0 40px -10px ${hex}66`);
}

/**
 * Adds/removes the .dark class on <html> based on the chosen theme.
 */
export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Place useAccentColor() once inside Home() in page.tsx.
 * Restores the saved accent + theme on every page load/refresh.
 */
export function useAccentColor() {
  useEffect(() => {
    // Restore accent
    const savedHex = localStorage.getItem('kazora-accent');
    const savedFg  = localStorage.getItem('kazora-accent-fg') || '#ffffff';
    if (savedHex) applyAccentColor(savedHex, savedFg);

    // Restore theme
    const savedTheme = (localStorage.getItem('kazora-theme') || 'system') as
      'light' | 'dark' | 'system';
    applyTheme(savedTheme);

    // Keep "system" mode in sync if OS setting changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if ((localStorage.getItem('kazora-theme') || 'system') === 'system') {
        applyTheme('system');
      }
    };
    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  }, []);
}