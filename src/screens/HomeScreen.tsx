import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority } from '../types';
import { firestoreDb } from '../db';
import { TaskCard } from '../components/TaskCard';
import { TaskSkeleton } from '../components/Skeleton';
import { storage } from '../storage';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Plus, CheckSquare, Search, X, SlidersHorizontal,
  Flame, TrendingUp, AlertCircle, LogOut, User as UserIcon,
  Moon, Sun, Settings
} from 'lucide-react';

interface HomeScreenProps {
  key?: string | number;
  onNavigateAdd: () => void;
  onNavigateEdit: (task: Task) => void;
  onNavigateProfile: () => void;
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function HomeScreen({ onNavigateAdd, onNavigateEdit, onNavigateProfile }: HomeScreenProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(storage.getIsDarkMode());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = firestoreDb.subscribe(user.uid, (t) => { setTasks(t); setLoading(false); });
    return unsub;
  }, [user]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    storage.setDarkMode(newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await signOut(auth);
    showToast('Logged out. See you soon! 👋', 'info');
  };

  const categories = useMemo(() => {
    const cats = tasks.map(t => t.category).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(cats))];
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
        const matchCategory = filterCategory === 'all' || t.category === filterCategory;
        return matchSearch && matchPriority && matchCategory;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pd = PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium'];
        return pd !== 0 ? pd : b.createdAt - a.createdAt;
      });
  }, [tasks, search, filterPriority, filterCategory]);

  const activeTasks = filtered.filter(t => !t.completed);
  const completedTasks = filtered.filter(t => t.completed);
  const total = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const highCount = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const todayStr = new Date().toDateString();
  const streak = tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === todayStr).length;
  const hasActiveFilters = filterPriority !== 'all' || filterCategory !== 'all' || !!search;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const avatarLetter = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await firestoreDb.save(user.uid, updated);
    if (updated.completed) showToast('Task completed! 🎉', 'success');
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    await firestoreDb.delete(user.uid, id);
    showToast('Task deleted', 'info');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen pb-28">

      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-6">

          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-200 text-sm font-medium">{greeting()},</p>
              <h1 className="text-white text-2xl font-bold leading-tight">{user?.displayName || 'User'} 👋</h1>
            </div>

            {/* Avatar + dropdown */}
            <div className="relative" ref={menuRef}>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowMenu(v => !v)}
                className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg hover:bg-white/35 transition-colors border border-white/30 shadow-lg">
                {user?.photoURL
                  ? <img src={user.photoURL} className="w-full h-full rounded-2xl object-cover" alt="avatar" />
                  : avatarLetter}
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Profile */}
                    <button onClick={() => { setShowMenu(false); onNavigateProfile(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Settings size={15} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      Profile & Settings
                    </button>

                    {/* Dark mode toggle */}
                    <button onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-t border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {isDark ? <Sun size={15} className="text-yellow-500" /> : <Moon size={15} className="text-gray-600" />}
                      </div>
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                      <span className={`ml-auto w-8 h-4.5 rounded-full transition-colors relative flex items-center ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`} style={{ height: 18 }}>
                        <motion.span animate={{ x: isDark ? 14 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute" />
                      </span>
                    </button>

                    {/* Logout */}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <LogOut size={15} className="text-red-500" />
                      </div>
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: total, icon: <TrendingUp size={13} />, color: 'text-blue-200' },
              { label: 'Done', value: completedCount, icon: <CheckSquare size={13} />, color: 'text-emerald-300' },
              { label: 'Today', value: streak, icon: <Flame size={13} />, color: 'text-orange-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className={`flex items-center gap-1 ${s.color} mb-1`}>
                  {s.icon}
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-white text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-blue-200 text-xs font-medium">Overall Progress</span>
                <span className="text-white text-xs font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-400' : 'bg-white'}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 space-y-3 max-w-2xl mx-auto w-full">

        {/* High priority alert */}
        <AnimatePresence>
          {highCount > 0 && !loading && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {highCount} high priority task{highCount > 1 ? 's' : ''} need{highCount === 1 ? 's' : ''} attention
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 text-sm shadow-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowFilters(v => !v)}
            className={`px-3.5 rounded-xl border transition-colors shadow-sm flex items-center gap-1.5 text-sm font-medium
              ${showFilters || hasActiveFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
            <SlidersHorizontal size={15} />
            {hasActiveFilters && !showFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </motion.button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Priority</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'high', 'medium', 'low'] as const).map(p => (
                      <button key={p} onClick={() => setFilterPriority(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                          ${filterPriority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {categories.length > 1 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Category</p>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(c => (
                        <button key={c} onClick={() => setFilterCategory(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                            ${filterCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {hasActiveFilters && (
                  <button onClick={() => { setFilterPriority('all'); setFilterCategory('all'); setSearch(''); }}
                    className="text-xs text-red-500 font-semibold hover:text-red-600 transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        {loading ? (
          <div className="pt-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 ml-1" />
            <TaskSkeleton count={4} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckSquare size={34} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {tasks.length === 0 ? 'No tasks yet' : 'No results found'}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto">
              {tasks.length === 0 ? 'Tap + to create your first task!' : 'Try adjusting your search or filters.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5 pt-1">
            {activeTasks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active</h2>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">{activeTasks.length}</span>
                </div>
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {activeTasks.map(task => (
                      <TaskCard key={task.id} task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={onNavigateEdit}
                        onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
            {completedTasks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completed</h2>
                  <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                </div>
                <div className="space-y-2.5 opacity-75">
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={onNavigateEdit}
                        onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-0 left-0 z-20 max-w-2xl mx-auto px-4 flex justify-end pointer-events-none">
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={onNavigateAdd}
          className="pointer-events-auto bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center gap-2 pr-5">
          <Plus size={22} strokeWidth={2.5} />
          <span className="font-semibold text-sm">New Task</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
