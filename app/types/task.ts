export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;      // ISO string
  endTime?: string;       // ISO string - undefined means timer is running
  duration?: number;      // in seconds - computed when endTime is set
  note?: string;          // optional note for the time entry
  createdAt: string;
}

export interface TimeTracking {
  totalTime: number;          // total seconds logged across all entries
  estimatedTime?: number;     // estimated seconds to complete
  isRunning: boolean;         // is a timer currently active
  activeEntryId?: string;     // id of the currently running TimeEntry
  entries: TimeEntry[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  startDate?: string;         // when work should begin
  createdAt: string;
  updatedAt: string;
  completedAt?: string;       // when task was marked done
  tags?: string[];
  project?: string;
  assignee?: string;
  timeTracking?: TimeTracking; // optional - not all tasks need time tracking
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  estimatedTime?: number;     // total estimated seconds for project
}

// Helper types for UI and computed values
export type TimerAction = 'start' | 'pause' | 'stop' | 'reset';

export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;          // e.g. "02:30:15"
}

// Utility to convert seconds to TimeDisplay
export const secondsToTimeDisplay = (totalSeconds: number): TimeDisplay => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':'),
  };
};

// Utility to compute duration between two ISO strings in seconds
export const computeDuration = (startTime: string, endTime?: string): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return Math.floor((end - start) / 1000);
};

// Utility to get total logged time for a task
export const getTotalLoggedTime = (timeTracking?: TimeTracking): number => {
  if (!timeTracking) return 0;
  return timeTracking.entries.reduce((total, entry) => {
    return total + (entry.duration ?? computeDuration(entry.startTime, entry.endTime));
  }, 0);
};

// Utility to check if a task is overdue
export const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < new Date();
};

// Utility to get progress percentage based on time
export const getTimeProgress = (timeTracking?: TimeTracking): number => {
  if (!timeTracking?.estimatedTime || timeTracking.estimatedTime === 0) return 0;
  const logged = getTotalLoggedTime(timeTracking);
  return Math.min(Math.round((logged / timeTracking.estimatedTime) * 100), 100);
};