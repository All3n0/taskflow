'use client';

import { useCallback, useEffect, useState } from 'react';
import { format, startOfDay, subDays } from 'date-fns';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completedDates: string[];
  totalTasksCompleted: number;
}

const KEY = 'kazistack-streaks';

function empty(): StreakData {
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, completedDates: [], totalTasksCompleted: 0 };
}

function load(): StreakData {
  if (typeof window === 'undefined') return empty();
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : empty(); }
  catch { return empty(); }
}

function save(d: StreakData) { localStorage.setItem(KEY, JSON.stringify(d)); }

function recalc(dates: string[]): Pick<StreakData, 'currentStreak' | 'longestStreak'> {
  if (!dates.length) return { currentStreak: 0, longestStreak: 0 };
  const sorted = [...new Set(dates)].sort().reverse();
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const yesterday = format(subDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');

  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    let cursor = sorted[0] === today ? new Date() : subDays(new Date(), 1);
    for (const d of sorted) {
      if (d === format(startOfDay(cursor), 'yyyy-MM-dd')) { current++; cursor = subDays(cursor, 1); }
      else break;
    }
  }

  const asc = [...new Set(dates)].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < asc.length; i++) {
    const diff = (new Date(asc[i]).getTime() - new Date(asc[i-1]).getTime()) / 86400000;
    if (diff === 1) { run++; longest = Math.max(longest, run); } else run = 1;
  }

  return { currentStreak: current, longestStreak: Math.max(longest, current) };
}

export function useStreaks() {
  const [data, setData] = useState<StreakData>(empty);
  useEffect(() => { setData(load()); }, []);

  const recordCompletion = useCallback((completedAt?: string) => {
    setData(prev => {
      const dateKey = format(startOfDay(completedAt ? new Date(completedAt) : new Date()), 'yyyy-MM-dd');
      const dates = [...new Set([...prev.completedDates, dateKey])];
      const { currentStreak, longestStreak } = recalc(dates);
      const next: StreakData = { ...prev, completedDates: dates, lastActiveDate: dateKey, totalTasksCompleted: prev.totalTasksCompleted + 1, currentStreak, longestStreak };
      save(next);
      return next;
    });
  }, []);

  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const yesterday = format(subDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
  const streakAlive = data.currentStreak > 0 && (data.lastActiveDate === today || data.lastActiveDate === yesterday);
  const activityToday = data.completedDates.includes(today);

  return { ...data, streakAlive, activityToday, recordCompletion };
}