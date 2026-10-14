import React from 'react';
import { Link } from 'react-router-dom';

export default function ListingCard({ post }) {
  if (!post) return null;
  const rate = post.rate != null ? post.rate : (post.price || 0);
  const rateUnit = (post.rateUnit || 'day').toLowerCase();
  const ownerName = post.owner?.name || 'Campus Member';
  const trustScore = post.owner?.trustScore != null ? Number(post.owner.trustScore).toFixed(1) : '4.9';
  const categoryName = post.category?.name || (typeof post.category === 'string' ? post.category : 'Hardware');
  const condition = post.itemCondition || post.condition || 'Good';

  return (
    <Link
      to={`/post/${post.id}`}
      className="group block border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors hover:border-neutral-400 dark:hover:border-neutral-700"
    >
      <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 relative overflow-hidden flex items-center justify-center">
        {post.photos && post.photos.length > 0 ? (
          <img
            src={post.photos[0].url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">No Photo</span>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-neutral-900/80 text-white">
          {categoryName}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate group-hover:text-orange-600 transition-colors">
          {post.title}
        </h3>
        <div className="text-orange-600 font-semibold text-sm tabular-nums mt-1">
          ₹{rate} <span className="text-[11px] text-neutral-500 font-normal">/{rateUnit}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-medium">
          <span className="capitalize">{condition}</span>
          <span>u/{ownerName} • {trustScore}/5.0</span>
        </div>
      </div>
    </Link>
  );
}
