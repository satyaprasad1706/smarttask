import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent" />
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded-lg w-1/2" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700/60 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
