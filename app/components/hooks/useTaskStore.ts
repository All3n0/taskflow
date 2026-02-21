import { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority } from '../../types/task';

const STORAGE_KEY = 'kazistack-tasks';

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultTasks: Task[] = [
  {
    id: generateId(),
    title: 'Welcome to kazistack',
    description: 'This is your new productivity hub. Create tasks, organize projects, and stay focused.',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['getting-started'],
  },
  {
    id: generateId(),
    title: 'Set up notifications',
    description: 'Enable browser notifications to stay on top of your deadlines.',
    status: 'backlog',
    priority: 'low',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Review project timeline',
    description: 'Check the calendar view for upcoming deadlines.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['planning'],
  },
  {
    id: generateId(),
    title: 'Complete onboarding',
    description: 'Explore all features and customize your workspace.',
    status: 'done',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {
        setTasks(defaultTasks);
      }
    } else {
      setTasks(defaultTasks);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const moveTask = useCallback((id: string, status: Status) => {
    updateTask(id, { status });
  }, [updateTask]);

  const getTasksByStatus = useCallback(
    (status: Status) => tasks.filter((task) => task.status === status),
    [tasks]
  );

  const getTasksForDate = useCallback(
    (date: Date) =>
      tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      }),
    [tasks]
  );

  return {
    tasks,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getTasksForDate,
  };
}
