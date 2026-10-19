export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface CategoryDef {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  number: string; // e.g. "PRJ-101" or "101"
  name: string;   // e.g. "تطوير المنصة الرقمية"
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM (24-hour)
  priority: Priority;
  category: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  subtasks: Subtask[];
  estimatedMinutes: number;
  actualMinutes?: number;
  reminderOffsetMinutes: number; // 0: on time, 10: 10m before, 30: 30m before, 60: 1h before, -1: none
  createdAt: string;
}

export type FilterView = 'today' | 'upcoming' | 'urgent' | 'completed' | 'all';

export interface SmartAlert {
  id: string;
  taskId: string;
  taskTitle: string;
  dueTime: string;
  dueDate: string;
  type: 'due_now' | 'due_soon' | 'overdue';
  minutesRemaining?: number;
}

export interface DailySummary {
  total: number;
  completed: number;
  remaining: number;
  urgent: number;
  estimatedHours: number;
  streak: number;
}
