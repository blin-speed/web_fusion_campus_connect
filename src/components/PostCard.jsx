import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    rateUnit = 'day',
    securityDeposit,
    location,
  } = post;

  const ownerName = owner?.name || 'Campus Member';
  const locationName = location?.name || 'Campus Library';
  const categoryName = post.category?.name || (typeof post.category === 'string' ? post.category : 'Hardware');
  const isAvail = availability === 'available' || post.status === 'available';

  const handleClick = (e) => {
    e.preventDefault();
    navigate(`/post/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-xs cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-semibold text-[10px] uppercase tracking-wider text-neutral-500 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5">
            {categoryName}
          </span>
          <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider ${
            isAvail
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-neutral-400 text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
          }`}>
            {isAvail ? 'Available' : 'Reserved'}
          </span>
        </div>

        <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 hover:text-orange-600 transition-colors mb-1">
          {title}
        </h3>
        {itemName && (
          <p className="text-[11px] text-neutral-400 mb-1">Model: {itemName}</p>
        )}
        <p className="text-[11px] text-neutral-400 mb-2 truncate">Location: {locationName}</p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
          {description || 'No detailed specifications provided.'}
        </p>

        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-950 p-2.5 border border-neutral-200 dark:border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-400 uppercase text-[9px] font-semibold tracking-wider block">Rate</span>
            <strong className="text-orange-600 font-semibold tabular-nums">₹{rate}/{rateUnit}</strong>
          </div>
          <div className="text-neutral-300 dark:text-neutral-700">|</div>
          <div>
            <span className="text-neutral-400 uppercase text-[9px] font-semibold tracking-wider block">Security Deposit</span>
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold tabular-nums">₹{securityDeposit || 0}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[11px] text-neutral-400">
        <span>u/{ownerName}</span>
        <span className="font-semibold uppercase tracking-wide text-orange-600 hover:underline">
          View Details →
        </span>
      </div>
    </div>
  );
}
