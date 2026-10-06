import React from 'react';
import { Link } from 'react-router-dom';

export default function ExchangeCard({ exchange, role }) {
  const { id, post, state, updatedAt, borrower, owner } = exchange;
  
  const statusDisplay = {
    payment_pending: 'Needs Payment',
    handover: 'Handover Pending',
    borrowed: 'Active',
    returned: 'Inspection Pending',
    inspected: 'Damage Assessment',
    settled: 'Settled',
    rated: 'Rated',
    cancelled: 'Cancelled'
  };

  const statusColors = {
    payment_pending: 'bg-amber-100 text-amber-800',
    handover: 'bg-blue-100 text-blue-800',
    borrowed: 'bg-emerald-100 text-emerald-800',
    returned: 'bg-purple-100 text-purple-800',
    inspected: 'bg-rose-100 text-rose-800',
    settled: 'bg-slate-100 text-slate-800',
    rated: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-stone-100 text-stone-600'
  };

  const roleText = role === 'borrower' 
    ? `From: ${owner?.name || 'Owner'}` 
    : `To: ${borrower?.name || 'Borrower'}`;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex gap-4 items-center">
        <div className="h-16 w-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
          {post?.images && post.images.length > 0 ? (
            <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">No Img</div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{post?.title}</h3>
          <p className="text-sm text-slate-500">{roleText}</p>
          <p className="text-xs text-slate-400 mt-1">Updated: {new Date(updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[state] || 'bg-stone-100 text-slate-600'}`}>
          {statusDisplay[state] || state}
        </span>
        <Link 
          to={`/exchange/${id}`}
          className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          View Exchange
        </Link>
      </div>
    </div>
  );
}
