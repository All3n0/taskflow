import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    if (supported) setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions & { body?: string }) => {
      // Always fire an in-app toast — works 100% of the time
      toast(title, {
        description: options?.body,
        duration: 5000,
      });

      // Also fire native OS notification if browser allows
      if (!isSupported) return null;
      if (Notification.permission !== 'granted') return null;

      try {
        return new Notification(title, {
          // Don't pass icon if you don't have one — it causes silent failures
          ...options,
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
        return null;
      }
    },
    [isSupported]
  );

  const scheduleReminder = useCallback(
    (title: string, body: string, delay: number) => {
      const timeoutId = setTimeout(() => {
        sendNotification(title, { body });
      }, delay);
      return timeoutId;
    },
    [sendNotification]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    scheduleReminder,
  };
}