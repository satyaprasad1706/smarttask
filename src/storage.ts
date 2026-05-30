import { Task, User } from './types';

const TASKS_KEY = '@smarttask_tasks';
const USER_KEY = '@smarttask_user';
const THEME_KEY = '@smarttask_theme';

export const storage = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },
  getIsDarkMode: (): boolean => {
    const val = localStorage.getItem(THEME_KEY);
    if (val === null) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return val === 'true';
  },
  setDarkMode: (isDark: boolean) => {
    localStorage.setItem(THEME_KEY, String(isDark));
  }
};
