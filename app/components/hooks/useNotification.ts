import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

interface ExtendedNotificationOptions extends NotificationOptions {
  body?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission as PermissionState);
    } else {
      setPermission('unsupported');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    return result === 'granted';
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: ExtendedNotificationOptions) => {
      // Always show in-app toast with action button
      toast(title, {
        description: options?.body,
        duration: options?.requireInteraction ? Infinity : 5000,
        action: options?.requireInteraction ? {
          label: '✓ Mark done',
          onClick: () => {
            const taskId = options?.tag?.split('-')[0];
            if (taskId) {
              window.dispatchEvent(new CustomEvent('kazistack:complete', {
                detail: { taskId }
              }));
            }
          },
        } : undefined,
      });

      // Fire native OS notification
      if (!isSupported || Notification.permission !== 'granted') return null;

      try {
        const n = new Notification(title, {
          body: options?.body,
          tag: options?.tag,
          requireInteraction: options?.requireInteraction ?? false,
        });

        n.onclick = () => {
          const taskId = options?.tag?.split('-')[0];
          if (taskId) {
            window.dispatchEvent(new CustomEvent('kazistack:complete', {
              detail: { taskId }
            }));
          }
          window.focus();
          n.close();
        };

        return n;
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