import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );
}

export function ListingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-stone-200 dark:border-slate-700 shadow-sm flex flex-col h-full animate-pulse">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 flex flex-col flex-grow gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto flex justify-between items-center pt-3 border-t border-stone-100 dark:border-slate-700">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, message, icon = '📦' }) {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-slate-700">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">{title}</h3>
      {message && <p className="text-red-600 dark:text-red-300 mb-4 text-sm">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}
