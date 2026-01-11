import { motion } from 'framer-motion';
import { Bell, BellOff, BellRing, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../hooks/useNotification';
import { cn } from '../utils';

export function NotificationsView() {
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification('Notifications Enabled!', {
        body: 'You will now receive task reminders and updates.',
      });
    }
  };

  const handleTestNotification = () => {
    sendNotification('Test Notification', {
      body: 'This is how your task reminders will appear.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className={cn(
            "p-4 rounded-2xl",
            permission === 'granted' ? "bg-success/10" : "bg-primary/10"
          )}>
            {permission === 'granted' ? (
              <BellRing className="w-8 h-8 text-success" />
            ) : (
              <Bell className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Browser Notifications</h2>
            <p className="text-muted-foreground">
              Get reminded about upcoming tasks and deadlines
            </p>
          </div>
        </div>

        {!isSupported ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive">
            <BellOff className="w-5 h-5" />
            <p>Your browser doesn't support notifications.</p>
          </div>
        ) : permission === 'granted' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 text-success">
              <Check className="w-5 h-5" />
              <p>Notifications are enabled</p>
            </div>
            
            <Button onClick={handleTestNotification} variant="outline" className="w-full">
              Send Test Notification
            </Button>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-medium">Notification Settings</h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Task reminders', description: 'Get notified before task deadlines' },
                  { label: 'Daily digest', description: 'Summary of tasks due today' },
                  { label: 'Status updates', description: 'When tasks are completed' },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="w-10 h-6 rounded-full bg-primary/20 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-primary shadow-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : permission === 'denied' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive">
              <X className="w-5 h-5" />
              <div>
                <p className="font-medium">Notifications are blocked</p>
                <p className="text-sm opacity-80">
                  Please enable notifications in your browser settings
                </p>
              </div>
            </div>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 p-4 rounded-xl bg-secondary/50">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" in the permissions</li>
              <li>Change it from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Enable notifications to receive reminders about upcoming tasks and deadlines.
            </p>
            
            <Button
              onClick={handleEnableNotifications}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>

            <ul className="space-y-3 text-sm">
              {[
                'Get reminded before task deadlines',
                'Receive daily task summaries',
                'Stay on top of your productivity',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Extension Promo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-2">Quick Add Extension</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add tasks from anywhere on the web with our browser extension (coming soon).
        </p>
        <Button variant="outline" disabled>
          Coming Soon
        </Button>
      </motion.div>
    </motion.div>
  );
}