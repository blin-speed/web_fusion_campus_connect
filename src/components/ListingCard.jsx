import React from 'react';
import { Link } from 'react-router-dom';

export default function ListingCard({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="group block bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
        {post.photos && post.photos.length > 0 ? (
          <img src={post.photos[0].url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-orange-600 font-bold mt-1">₹{post.price} / day</p>
        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
            {post.condition || 'Unknown Condition'}
          </span>
          {post.owner && (
            <span className="flex items-center gap-1 ml-auto">
              {post.owner.trustScore ? `★ ${post.owner.trustScore}` : 'New'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
