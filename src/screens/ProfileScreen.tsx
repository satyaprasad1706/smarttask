import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { storage } from '../storage';
import { LogOut, Moon, Sun, Mail, Flame, CheckCircle2, ListTodo, Trophy, Target } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { firestoreDb } from '../db';
import { useToast } from '../Toast';
import { Task } from '../types';

interface ProfileScreenProps {
  key?: string | number;
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isDark, setIsDark] = useState(storage.getIsDarkMode());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = firestoreDb.subscribe(user.uid, setTasks);
    return unsub;
  }, [user]);

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const todayStr = new Date().toDateString();
  const streak = tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === todayStr).length;
  const highPending = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const avatarLetter = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    storage.setDarkMode(newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleLogout = async () => {
    await signOut(auth);
    showToast('Logged out. See you soon! 👋', 'info');
    onLogout();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Gradient header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>
            <h1 className="text-white text-xl font-bold">Profile</h1>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-white/25 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden flex-shrink-0"
              style={{ width: 72, height: 72 }}>
              {user?.photoURL
                ? <img src={user.photoURL} className="w-full h-full object-cover" alt="avatar" />
                : avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold truncate">{user?.displayName || 'User'}</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-blue-200 text-sm">
                <Mail size={13} />
                <span className="truncate">{user?.email}</span>
              </div>
              {progress === 100 && total > 0 && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30">
                  <Trophy size={10} /> All tasks done!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 -mt-4 max-w-2xl mx-auto w-full space-y-4 pb-10">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <ListTodo size={18} className="text-blue-500" />, value: total, label: 'Total Tasks', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/40' },
            { icon: <CheckCircle2 size={18} className="text-emerald-500" />, value: completed, label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/40' },
            { icon: <Target size={18} className="text-violet-500" />, value: active, label: 'Active', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-900/40' },
            { icon: <Flame size={18} className="text-orange-500" />, value: streak, label: 'Done Today', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/40' },
          ].map(s => (
            <div key={s.label} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border ${s.border} shadow-sm flex items-center gap-3`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress card */}
        {total > 0 && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className={`text-sm font-bold ${progress === 100 ? 'text-emerald-500' : 'text-blue-600 dark:text-blue-400'}`}>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>{completed} of {total} tasks completed</span>
              {highPending > 0 && (
                <span className="text-red-500 font-semibold">⚠ {highPending} high priority pending</span>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 pt-4 pb-2">Preferences</p>

          {/* Dark mode */}
          <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {isDark ? <Moon size={17} className="text-blue-400" /> : <Sun size={17} className="text-yellow-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-400">{isDark ? 'On' : 'Off'}</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className={`rounded-full transition-colors relative flex items-center focus:outline-none flex-shrink-0 ${isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              style={{ width: 48, height: 26, padding: 3 }}>
              <motion.div animate={{ x: isDark ? 22 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm">
          <LogOut size={18} />
          Log Out
        </motion.button>

      </main>
    </motion.div>
  );
}
