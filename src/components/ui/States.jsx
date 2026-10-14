import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}

export function ListingSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex flex-col h-full animate-pulse">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 flex flex-col flex-grow gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'No items found', message = 'Try adjusting your filters or search query.' }) {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800">
      <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">Empty Inventory Registry</div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

export function ErrorState({ title = 'Execution Failure', message, onRetry }) {
  return (
    <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-950/40 border border-red-600 text-xs">
      <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">System Error</div>
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">{title}</h3>
      {message && <p className="text-red-600 dark:text-red-400 mb-4 text-xs">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 font-semibold uppercase tracking-wider text-xs hover:bg-red-700 transition-colors"
        >
          Retry Query
        </button>
      )}
    </div>
  );
}
