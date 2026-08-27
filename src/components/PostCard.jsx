import React from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function PostCard({ post, onSelectPost }) {
  const { users } = useCurrentUser();

  const {
    id = 'sample-1',
    title = 'Untitled Item',
    channel = 'Stationery',
    itemName = 'Item',
    status = 'available',
    ownerId,
    description = '',
    borrowingCost = 50,
    securityDeposit = 300,
    location = 'Campus Main Library',
  } = post || {};

  const owner = users?.find((u) => u.id === ownerId);
  const ownerName = post?.ownerName || owner?.name || ownerId || 'Campus Member';

  // Status badge colors according to Phase 3 Patch 3 spec:
  // available -> Green; pending -> Mustard yellow; lent/closed -> Dark neutral slate
  const statusColors = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-300',
    lent: 'bg-slate-100 text-slate-700 border-slate-300',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const badgeColor = statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-300';

  const handleClick = (e) => {
    if (onSelectPost) {
      e.preventDefault();
      onSelectPost(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-all ${
        onSelectPost ? 'cursor-pointer hover:border-orange-300' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700 border border-stone-200/60 font-heading">
            #{channel}
          </span>
          <span className={`rounded border px-2 py-0.5 text-xs font-semibold capitalize ${badgeColor}`}>
            {status}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1 hover:text-orange-600 transition-colors font-heading">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mb-1">Item: <span className="font-medium text-slate-700">{itemName}</span></p>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1 truncate">
          <span>📍</span> {location}
        </p>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{description}</p>

        {/* Pricing tag */}
        <div className="mt-3 flex items-center gap-3 text-xs bg-stone-50 p-2 rounded-lg border border-stone-200/80">
          <div>
            <span className="text-slate-500">Borrow Cost: </span>
            <strong className="text-slate-900 font-bold">₹{borrowingCost}</strong>
          </div>
          <div className="text-stone-300">|</div>
          <div>
            <span className="text-slate-500">Deposit: </span>
            <strong className="text-slate-900 font-bold">₹{securityDeposit}</strong>
            <span className="text-[10px] text-emerald-700 ml-1">(refundable)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-slate-500">
        <span>Owner: <strong className="text-slate-800">{ownerName}</strong> (★ {owner?.trustScore == null ? 'N/A' : owner.trustScore.toFixed(1)})</span>
        <span className="font-bold text-orange-600 hover:text-orange-700">
          View Details →
        </span>
      </div>
    </div>
  );
}
