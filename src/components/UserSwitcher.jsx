import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function UserSwitcher() {
  const { currentUser, isGuest, logoutToGuest } = useCurrentUser();

  const trustScore = currentUser?.trust?.score != null ? `${currentUser.trust.score}/5.0` : 'NA';

  if (isGuest) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-xs font-semibold tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="border border-neutral-300 dark:border-neutral-700 bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 px-3 py-1.5 text-xs font-semibold tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
        title="View Profile"
      >
        <div className="w-6 h-6 bg-orange-600 text-white font-bold flex items-center justify-center text-[11px]">
          {currentUser.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
            {currentUser.name}
          </span>
          <span className="text-[11px] text-neutral-500">
            {currentUser.department || 'Campus'} • {trustScore}
          </span>
        </div>
        {currentUser?.isVerified && (
          <span className="ml-1 text-[10px] font-semibold tracking-wide px-1.5 py-0.5 border border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            Verified
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={logoutToGuest}
        className="border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-semibold tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
