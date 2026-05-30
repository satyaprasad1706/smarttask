import React, { useRef, useState } from 'react';
import { Task, Priority } from '../types';
import { CheckCircle2, Circle, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityStripe: Record<Priority, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-emerald-500',
};

const priorityBadge: Record<Priority, string> = {
  high:   'bg-red-50 dark:bg-red-900/25 text-red-600 dark:text-red-400',
  medium: 'bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400',
  low:    'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400',
};

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(dueDate: string) {
  const d = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-80, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-90, 0], [0.85, 1]);
  const [swiping, setSwiping] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -65) {
      onDelete(task.id);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 350, damping: 32 });
    }
    setSwiping(false);
  };

  const priority = task.priority ?? 'medium';
  const overdue = isOverdue(task.dueDate) && !task.completed;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe-to-delete background */}
      <motion.div style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-5">
        <div className="flex flex-col items-center gap-1">
          <Trash2 size={20} className="text-white" />
          <span className="text-white text-xs font-semibold">Delete</span>
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.08}
        style={{ x, opacity: cardOpacity }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        layout
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden cursor-grab active:cursor-grabbing select-none
          ${task.completed
            ? 'border-gray-100 dark:border-gray-700/50'
            : overdue
              ? 'border-red-200 dark:border-red-900/50 shadow-red-100/50 dark:shadow-none'
              : 'border-gray-100 dark:border-gray-700'}`}
      >
        {/* Left priority stripe */}
        {!task.completed && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityStripe[priority]}`} />
        )}

        <div className="flex items-start gap-3 p-4 pl-5">
          {/* Checkbox */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => !swiping && onToggleComplete(task.id)}
            className="mt-0.5 flex-shrink-0 transition-colors"
          >
            {task.completed
              ? <CheckCircle2 size={22} className="text-emerald-500" />
              : <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors" />}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-[15px] leading-snug ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-0.5 line-clamp-2 leading-relaxed ${task.completed ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {task.description}
              </p>
            )}

            {/* Badges */}
            {!task.completed && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityBadge[priority]}`}>
                  {priority}
                </span>
                {task.category && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                    <Tag size={9} strokeWidth={2.5} />
                    {task.category}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                    ${overdue
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'}`}>
                    <Calendar size={9} strokeWidth={2.5} />
                    {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-0.5 -mt-1 -mr-1 flex-shrink-0">
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => !swiping && onEdit(task)}
              className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <Edit size={15} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => !swiping && onDelete(task.id)}
              className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
              <Trash2 size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
