import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { firestoreDb } from '../db';
import { getSuggestions } from '../suggestions';
import { Sparkles, Flag, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';

interface TaskScreenProps {
  key?: string | number;
  task?: Task | null;
  onBack: () => void;
  onSave: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high',   label: 'High',   color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  { value: 'low',    label: 'Low',    color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
];

export function TaskScreen({ task, onBack, onSave }: TaskScreenProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [category, setCategory] = useState(task?.category || '');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) setSuggestions(getSuggestions(title));
  }, [title, task]);

  // Strip undefined/empty fields so Firestore never receives undefined values
  const clean = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));

  const handleSave = async () => {
    if (!title.trim()) { setError('Task title is required'); return; }
    if (!user) return;
    setSaving(true);
    const newTask = clean({
      id: task?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: task?.completed || false,
      createdAt: task?.createdAt || Date.now(),
      priority,
      dueDate: dueDate || undefined,
      category: category.trim() || undefined,
    }) as Task;
    try {
      await firestoreDb.save(user.uid, newTask);
      showToast(task ? 'Task updated!' : 'Task created!', 'success');
      onSave();
    } catch (e: any) {
      console.error('Firestore save error:', e?.code, e?.message);
      const msg = e?.code === 'permission-denied'
        ? 'Permission denied — check Firestore rules'
        : e?.message || 'Failed to save task';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <Header title={task ? 'Edit Task' : 'New Task'} onBack={onBack} />

      <main className="flex-1 px-4 pt-6 pb-10 max-w-2xl mx-auto w-full space-y-4">

        {/* Title */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Task Title</label>
            {!task && (
              <button type="button" onClick={() => setShowSuggestions(v => !v)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                <Sparkles size={13} /> Suggestions
              </button>
            )}
          </div>
          <AnimatePresence>
            {showSuggestions && !task && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} type="button" onClick={() => { setTitle(s); setShowSuggestions(false); setError(''); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <input type="text" value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
            placeholder="What needs to be done?"
            className={`${inputClass} ${error ? 'border-red-500 focus:ring-red-500' : ''}`} />
          {error && <p className="text-red-500 text-sm ml-1">{error}</p>}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">Description (Optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Add details..." rows={3}
            className={`${inputClass} resize-none`} />
        </div>

        {/* Priority */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
            <Flag size={15} /> Priority
          </label>
          <div className="flex gap-2">
            {priorities.map(p => (
              <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${priority === p.value ? p.color + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date & Category */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <Calendar size={15} /> Due Date (Optional)
            </label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <Tag size={15} /> Category (Optional)
            </label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal, Health"
              className={inputClass} />
          </div>
        </div>

        <Button title={saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'} onPress={handleSave} />
      </main>
    </motion.div>
  );
}
