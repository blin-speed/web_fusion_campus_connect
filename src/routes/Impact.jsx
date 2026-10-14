import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function Impact() {
  const { currentUser } = useCurrentUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await request('GET', '/impact');
      setStats(
        data || {
          activeMembersCount: 0,
          resourcesSharedCount: 0,
          successfulExchangesCount: 0,
          popularCategory: 'None',
          popularCategoryCount: 0,
          moneySaved: 0,
          resourcesReusedCount: 0,
          avgTrustScore: '4.9',
        }
      );
    } catch (err) {
      console.error('Failed to load campus impact metrics:', err);
      setError('Could not load impact telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Calculating campus sustainability & telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto border border-red-600 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-medium text-red-600 dark:text-red-400">
        Alert: {error}
      </div>
    );
  }

  const moneySaved = stats.moneySaved ?? stats.totalSavedInr ?? stats.moneySavedInr ?? 0;

  const statCards = [
    {
      title: 'Active Members',
      value: stats.activeMembersCount ?? stats.totalUsers ?? 0,
      label: 'Verified campus students & lab managers',
    },
    {
      title: 'Resources Shared',
      value: stats.resourcesSharedCount ?? stats.totalPosts ?? 0,
      label: 'Lab hardware & equipment listed in inventory',
    },
    {
      title: 'Successful Exchanges',
      value: stats.successfulExchangesCount ?? stats.settledCount ?? 0,
      label: 'Completed and audited lending protocols',
    },
    {
      title: 'Community Savings',
      value: `₹${Number(moneySaved).toLocaleString('en-IN')}`,
      label: 'Direct savings vs new commercial purchases',
    },
    {
      title: 'Resources Reused',
      value: stats.resourcesReusedCount ?? 0,
      label: 'Hardware circulated through multiple lab cycles',
    },
    {
      title: 'Network Trust Score',
      value: stats.avgTrustScore ? `${stats.avgTrustScore}/5.0` : 'N/A',
      label: 'Average post-exchange partner rating',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HERO BANNER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Sustainability Telemetry // Campus Metrics
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
            Real-Time Impact
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
          Campus Impact Dashboard
        </h1>
        <p className="text-xs text-neutral-500 max-w-3xl leading-relaxed">
          Quantified metrics measuring educational hardware reuse, peer cost reductions, and verifiable academic collaboration across campus.
        </p>
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                {card.title}
              </div>
              <div className="text-3xl font-light tabular-nums text-neutral-900 dark:text-neutral-100">
                {card.value}
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-4">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN LOWER TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* POPULAR CATEGORY */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            Primary Lending Velocity
          </div>
          <div>
            <div className="text-xl font-light text-orange-600 dark:text-orange-500">
              {stats.popularCategory || 'No activity recorded'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Highest request frequency across engineering labs
            </div>
          </div>
        </div>

        {/* PERSONAL IMPACT */}
        {currentUser ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              Your Personal Reputation
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Verified Exchanges</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{currentUser.successfulExchanges || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Trust Score</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {currentUser.trustScore != null ? `${currentUser.trustScore}/5.0` : 'New Member'}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/profile" className="text-orange-600 hover:underline uppercase font-semibold text-xs tracking-wide">
                View Full Identity & Profile →
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Guest Browsing Mode
            </div>
            <p className="text-neutral-500 text-xs">
              Sign in to track your personal campus lending metrics and reputation.
            </p>
            <Link
              to="/signup"
              className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 font-semibold uppercase text-xs tracking-wider transition-colors mt-2"
            >
              Register Identity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
