import React from 'react';
import { Link } from 'react-router-dom';

export default function ExchangeCard({ exchange, role }) {
  const { id, post, state, updatedAt, borrower, owner } = exchange || {};

  const statusDisplay = {
    payment_pending: 'Needs Payment',
    handover: 'Handover Pending',
    borrowed: 'Active Loan',
    returned: 'Return Confirmed',
    inspected: 'Damage Review',
    settled: 'Settled',
    rated: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusColors = {
    payment_pending: 'border-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-950/30',
    handover: 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    borrowed: 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    returned: 'border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    inspected: 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30',
    settled: 'border-neutral-500 text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300',
    rated: 'border-neutral-500 text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300',
    cancelled: 'border-neutral-400 text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
  };

  const roleText = role === 'borrower'
    ? `Owner: u/${owner?.name || 'Campus Member'}`
    : `Borrower: u/${borrower?.name || 'Campus Member'}`;

  const postTitle = post?.title || exchange?.postTitle || `Resource #${post?.id || id}`;

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-xs">
      <div className="flex gap-4 items-center flex-1">
        <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400 text-[10px] uppercase font-semibold">
          {post?.photos && post.photos.length > 0 ? (
            <img src={post.photos[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            'No Photo'
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {postTitle}
          </h3>
          <p className="text-[11px] text-neutral-500 font-medium">{roleText}</p>
          <p className="text-[11px] text-neutral-400">
            Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'Today'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
        <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider text-center ${statusColors[state] || 'border-neutral-400 text-neutral-400'}`}>
          {statusDisplay[state] || state?.toUpperCase() || 'Syncing'}
        </span>
        <Link
          to={`/exchange/${id}`}
          className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 px-4 py-2 font-semibold uppercase tracking-wider text-center text-xs transition-colors"
        >
          Enter Exchange Room
        </Link>
      </div>
    </div>
  );
}
