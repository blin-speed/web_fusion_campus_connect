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
      setStats(data || {
        activeMembersCount: 0,
        resourcesSharedCount: 0,
        successfulExchangesCount: 0,
        popularCategory: 'None',
        popularCategoryCount: 0,
        moneySaved: 0,
        resourcesReusedCount: 0,
        avgTrustScore: 'N/A',
      });
    } catch (err) {
      console.error('Failed to load campus impact metrics:', err);
      setError('Could not load impact statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500 font-medium">Loading impact statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Members',
      value: stats.activeMembersCount,
      label: 'Verified campus students & faculty',
      icon: '👥',
    },
    {
      title: 'Resources Shared',
      value: stats.resourcesSharedCount,
      label: 'Total gear & books listed for lending',
      icon: '📦',
    },
    {
      title: 'Successful Exchanges',
      value: stats.successfulExchangesCount,
      label: 'Completed and rated lending loops',
      icon: '🤝',
    },
    {
      title: 'Money Saved by Peers',
      value: `₹${stats.moneySaved}`,
      label: 'Direct savings vs buying brand new',
      icon: '💰',
    },
    {
      title: 'Resources Reused',
      value: stats.resourcesReusedCount,
      label: 'Items shared across multiple cycles',
      icon: '🔄',
    },
    {
      title: 'Community Trust Score',
      value: `★ ${stats.avgTrustScore}`,
      label: 'Average verified member rating',
      icon: '⭐',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <span>🌱</span> Live Sustainability & Community Impact
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Campus Impact Dashboard
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          See how our peer lending network reduces waste, saves money for college students, and builds high-trust campus collaboration.
        </p>
      </div>

      {/* Impact Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className="font-black tracking-tight text-emerald-600 mt-1 text-3xl sm:text-4xl">
                {card.value}
              </p>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-stone-100 pt-2.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Most Popular Category</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.popularCategory}</p>
              <p className="text-sm text-slate-500">{stats.popularCategoryCount} active items in category</p>
            </div>
          </div>
        </div>

        {/* Personal Impact Panel */}
        {currentUser ? (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Your Impact</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <span className="text-sm text-slate-600">Your Exchanges</span>
                <span className="font-bold text-slate-800">{currentUser.successfulExchanges || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <span className="text-sm text-slate-600">Trust Score</span>
                <span className="font-bold text-slate-800">★ {currentUser.trustScore || 'N/A'}</span>
              </div>
            </div>
            <Link to="/profile" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
              View full profile &rarr;
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-slate-600 font-medium mb-3">Sign in to see your personal impact!</p>
            <Link to="/create-account" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-slate-700">
              Create an Account
            </Link>
          </div>
        )}
      </div>

      {/* Mission / Sustainability Callout Card */}
      <div className="rounded-xl border border-stone-200 bg-stone-100/60 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Have equipment or textbooks sitting idle?
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Share with verified campus peers and earn while helping someone finish their coursework.
          </p>
        </div>
        <Link
          to="/browse"
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all whitespace-nowrap"
        >
          Explore Campus Items &rarr;
        </Link>
      </div>
    </div>
  );
}
