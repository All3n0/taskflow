import { useEffect, useRef } from 'react';
import { Task } from '../../types/task';
import { useNotifications } from './useNotification';

export function useTaskReminders(tasks: Task[]) {
  const { sendNotification } = useNotifications();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const now = new Date();

      tasks.forEach(task => {
        if (!task.dueDate || task.status === 'done') return;

        const due = new Date(task.dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffMins = diffMs / 1000 / 60;

        // 30 minute warning
        if (diffMins > 0 && diffMins <= 30 && !notifiedIds.current.has(`${task.id}-30min`)) {
          sendNotification(`⏰ "${task.title}"`, {
            body: `Due in ${Math.round(diffMins)} minutes · ${task.priority} priority · Tap to mark complete`,
            tag: `${task.id}-30min`,
            requireInteraction: true,
          });
          notifiedIds.current.add(`${task.id}-30min`);
        }

        // Due now (within current minute)
        if (diffMins > -1 && diffMins <= 0 && !notifiedIds.current.has(`${task.id}-due`)) {
          sendNotification(`🔔 Due now: "${task.title}"`, {
            body: `This task is due right now! Tap to mark complete.`,
            tag: `${task.id}-due`,
            requireInteraction: true,
          });
          notifiedIds.current.add(`${task.id}-due`);
        }

        // Just became overdue
        if (diffMins > -2 && diffMins <= -1 && !notifiedIds.current.has(`${task.id}-overdue`)) {
          sendNotification(`🚨 Overdue: "${task.title}"`, {
            body: `This task is overdue! Tap to mark complete.`,
            tag: `${task.id}-overdue`,
            requireInteraction: true,
          });
          notifiedIds.current.add(`${task.id}-overdue`);
        }
      });
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [tasks, sendNotification]);
}