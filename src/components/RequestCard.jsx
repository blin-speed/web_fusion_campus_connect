import React from 'react';

export default function RequestCard({ request, onAccept, onReject }) {
  const {
    borrowerName = 'Borrower',
    postTitle = 'Item',
    status = 'pending',
    createdAt = '',
  } = request || {};

  const handleAccept = () => {
    if (onAccept) onAccept(request);
  };

  const handleReject = () => {
    if (onReject) onReject(request);
  };

  const statusColors = {
    pending: 'border-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-950/30',
    accepted: 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    closed_auto: 'border-neutral-400 text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
    rejected: 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30',
  };

  const statusDisplay = {
    pending: 'Pending Approval',
    accepted: 'Accepted',
    closed_auto: 'Auto-Closed',
    rejected: 'Rejected',
  };

  const isPending = status === 'pending';

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] text-neutral-400">
            {createdAt ? new Date(createdAt).toLocaleDateString() : 'Today'}
          </span>
          <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider ${statusColors[status] || 'border-neutral-400 text-neutral-400'}`}>
            {statusDisplay[status] || status?.toUpperCase()}
          </span>
        </div>
        <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          {postTitle}
        </h4>
        <p className="text-[11px] text-neutral-500 mt-1">
          Borrower: <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">u/{borrowerName}</strong>
        </p>
      </div>

      {isPending ? (
        <div className="mt-4 flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-3">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-1.5 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            Accept Request
          </button>
          {onReject && (
            <button
              type="button"
              onClick={handleReject}
              className="border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[11px] text-neutral-400 uppercase font-semibold">
          Protocol Status: {statusDisplay[status] || status}
        </div>
      )}
    </div>
  );
}
