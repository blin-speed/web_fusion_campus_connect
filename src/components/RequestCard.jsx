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
    pending: 'bg-amber-50 text-amber-800 border-amber-300',
    accepted: 'bg-orange-50 text-orange-700 border-orange-200',
    closed_auto: 'bg-stone-100 text-slate-500 border-stone-200',
    rejected: 'bg-stone-100 text-slate-600 border-stone-200',
  };

  const statusDisplay = {
    pending: 'Pending',
    accepted: 'Accepted',
    closed_auto: 'Auto-closed',
    rejected: 'Rejected',
  };

  const isPending = status === 'pending';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-slate-500">
            {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
          </span>
          <span
            className={`rounded border px-2 py-0.5 text-xs font-bold capitalize ${
              statusColors[status] || 'bg-stone-100 text-slate-700 border-stone-200'
            }`}
          >
            {statusDisplay[status] || status}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-800 font-heading">{postTitle}</h4>
        <p className="text-xs text-slate-600 mt-1">
          Requested by: <strong className="text-slate-800">{borrowerName}</strong>
        </p>
      </div>

      {isPending ? (
        <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all focus:outline-none"
          >
            Accept Request
          </button>
          {onReject && (
            <button
              type="button"
              onClick={handleReject}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-stone-50 focus:outline-none"
            >
              Reject
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 border-t border-stone-100 pt-2 text-xs text-slate-500 italic">
          Status: {statusDisplay[status] || status}
        </div>
      )}
    </div>
  );
}
