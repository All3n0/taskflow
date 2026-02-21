'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, BellRing, Check, X, Send, Clock, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../hooks/useNotification';
import { cn } from '../utils';

const NOTIFICATION_SETTINGS = [
  {
    id: 'reminders',
    label: 'Task reminders',
    description: 'Get notified before task deadlines',
    defaultOn: true,
  },
  {
    id: 'digest',
    label: 'Daily digest',
    description: 'Summary of tasks due today',
    defaultOn: true,
  },
  {
    id: 'updates',
    label: 'Status updates',
    description: 'When tasks are completed',
    defaultOn: false,
  },
];

export function NotificationsView() {
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    reminders: true,
    digest: true,
    updates: false,
  });
  const [testSent, setTestSent] = useState(false);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification('kazora Notifications Enabled! 🎉', {
        body: 'You will now receive task reminders and updates.',
      });
    }
  };

  const handleTestNotification = () => {
    sendNotification('Test Notification 🔔', {
      body: 'Your task "Design system review" is due in 30 minutes.',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const toggleSetting = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const benefits = [
    { icon: Clock,        text: 'Get reminded before task deadlines' },
    { icon: CheckCircle2, text: 'Receive daily task summaries' },
    { icon: Zap,          text: 'Stay on top of your productivity' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-4"
    >
      {/* Main card */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Status banner */}
        <div className={cn(
          "px-6 py-4 flex items-center gap-4 border-b border-border/50",
          permission === 'granted' ? "bg-green-500/10" :
          permission === 'denied'  ? "bg-destructive/10" :
          "bg-primary/10"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            permission === 'granted' ? "bg-green-500/20" :
            permission === 'denied'  ? "bg-destructive/20" :
            "bg-primary/20"
          )}>
            {permission === 'granted' ? (
              <BellRing className="w-5 h-5 text-green-500" />
            ) : permission === 'denied' ? (
              <BellOff className="w-5 h-5 text-destructive" />
            ) : (
              <Bell className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-black text-sm">
              {permission === 'granted' ? 'Notifications active' :
               permission === 'denied'  ? 'Notifications blocked' :
               'Browser Notifications'}
            </p>
            <p className="text-xs text-muted-foreground">
              {permission === 'granted' ? 'You\'ll receive task reminders and updates' :
               permission === 'denied'  ? 'Update your browser settings to enable' :
               'Get reminded about upcoming tasks and deadlines'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Not supported */}
          {!isSupported && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
              <BellOff className="w-4 h-4 flex-shrink-0" />
              <p>Your browser doesn't support push notifications.</p>
            </div>
          )}

          {/* Granted state */}
          {isSupported && permission === 'granted' && (
            <>
              {/* Test button */}
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full gap-2 h-11 rounded-xl font-bold"
              >
                <AnimatePresence mode="wait">
                  {testSent ? (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 text-green-500"
                    >
                      <Check className="w-4 h-4" /> Notification sent!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Send Test Notification
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              {/* Settings toggles */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Preferences
                </p>
                {NOTIFICATION_SETTINGS.map(setting => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={toggles[setting.id]}
                      onClick={() => toggleSetting(setting.id)}
                      className={cn(
                        "relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors duration-200 flex-shrink-0",
                        toggles[setting.id] ? "bg-primary" : "bg-secondary"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200",
                        toggles[setting.id] ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Denied state */}
          {isSupported && permission === 'denied' && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                How to re-enable
              </p>
              <div className="space-y-2">
                {[
                  'Click the 🔒 lock icon in your browser address bar',
                  'Find "Notifications" in the permissions list',
                  'Change it from "Block" to "Allow"',
                  'Refresh this page',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Default / prompt state */}
          {isSupported && permission === 'default' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleEnableNotifications}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl gap-2"
              >
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Your browser will ask for permission. You can disable anytime.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coming soon card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-5 flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Quick Add Extension</p>
          <p className="text-xs text-muted-foreground">Add tasks from anywhere on the web</p>
        </div>
        <Button variant="outline" disabled className="flex-shrink-0 rounded-xl text-xs font-bold h-9">
          Coming Soon
        </Button>
      </motion.div>
    </motion.div>
  );
}