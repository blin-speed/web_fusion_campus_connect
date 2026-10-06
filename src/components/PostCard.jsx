import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  if (!post) return null;

  const {
    id,
    title,
    itemName,
    availability = 'available',
    owner,
    description,
    rate,
    rateUnit,
    securityDeposit,
    location,
  } = post;

  const ownerName = owner?.name || 'Campus Member';
  const locationName = location?.name || 'Campus Library';
  const categoryName = post.category?.name || 'Category';

  const statusColors = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reserved: 'bg-amber-50 text-amber-800 border-amber-300',
    lent: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const badgeColor = statusColors[availability] || 'bg-slate-100 text-slate-700 border-slate-300';

  const handleClick = (e) => {
    e.preventDefault();
    navigate(`/post/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-orange-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-orange-500"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700 border border-stone-200/60 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
            {categoryName}
          </span>
          <span className={`rounded border px-2 py-0.5 text-xs font-semibold capitalize ${badgeColor}`}>
            {availability}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Item: <span className="font-medium text-slate-700 dark:text-slate-300">{itemName}</span></p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
          {locationName}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{description}</p>

        <div className="mt-3 flex items-center gap-3 text-xs bg-stone-50 p-2 rounded-lg border border-stone-200/80 dark:bg-slate-900/50 dark:border-slate-700">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Rate: </span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">â‚¹{rate}/{rateUnit}</strong>
          </div>
          <div className="text-stone-300 dark:text-slate-600">|</div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Deposit: </span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">â‚¹{securityDeposit}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 dark:border-slate-700 pt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Owner: <strong className="text-slate-800 dark:text-slate-200">{ownerName}</strong></span>
        <span className="font-bold text-orange-600 hover:text-orange-700">
          View Details â†’
        </span>
      </div>
    </div>
  );
}

