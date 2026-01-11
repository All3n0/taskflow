'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export function DashboardView() {
  const stats = [
    { label: 'Total Tasks', value: 24, icon: CheckCircle, color: 'text-primary' },
    { label: 'In Progress', value: 8, icon: Clock, color: 'text-warning' },
    { label: 'Overdue', value: 3, icon: AlertCircle, color: 'text-destructive' },
    { label: 'Completion Rate', value: '68%', icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass p-6 rounded-2xl"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { text: 'You completed "Design System Update"', time: '2 hours ago' },
            { text: 'Sarah assigned you a new task', time: '4 hours ago' },
            { text: '"Marketing Campaign" due date updated', time: '1 day ago' },
            { text: 'Team meeting scheduled for Friday', time: '2 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <p className="text-sm">{activity.text}</p>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass p-6 rounded-2xl"
      >
        <h2 className="text-lg font-semibold mb-4">Productivity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Weekly Progress</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Focus Time</p>
            <p className="text-2xl font-semibold">18h 42m</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-semibold">7 days</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}