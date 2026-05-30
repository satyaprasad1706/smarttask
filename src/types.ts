export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  dueDate?: string; // ISO date string YYYY-MM-DD
  category?: string;
}

export interface User {
  name: string;
  email?: string;
}

export type Screen = 'Login' | 'Register' | 'Home' | 'AddEditTask' | 'Profile' | 'ResetPassword';
