export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string; // Category ID
  dueDate?: string; // YYYY-MM-DD
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind class name or color hex
  icon: string; // Name of Lucide Icon
}

export interface TaskFilter {
  search: string;
  category: string; // 'all' or category ID
  priority: Priority | 'all';
  status: 'all' | 'active' | 'completed';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

export interface FocusSession {
  taskId: string | null;
  duration: number; // in seconds
  timeLeft: number; // in seconds
  isRunning: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
}
