import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCampusImpactStats } from '../logic/stateMachine';

export default function Impact() {
  const [stats, setStats] = useState({
    activeMembersCount: 5,
    resourcesSharedCount: 12,
    successfulExchangesCount: 0,
    popularCategory: 'Filming Equipment',
    popularCategoryCount: 3,
    moneySaved: 0,
    resourcesReusedCount: 0,
    avgTrustScore: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await getCampusImpactStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load campus impact metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
      title: 'Most Popular Category',
      value: stats.popularCategory,
      label: `${stats.popularCategoryCount} active items in category`,
      icon: '🔥',
      isText: true,
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
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <span className="text-lg">{card.icon}</span>
              </div>
              <p
                className={`font-black tracking-tight text-orange-600 mt-1 ${
                  card.isText ? 'text-xl sm:text-2xl leading-tight' : 'text-3xl sm:text-4xl'
                }`}
              >
                {loading ? '...' : card.value}
              </p>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-stone-100 pt-2.5">
              {card.label}
            </p>
          </div>
        ))}
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
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all whitespace-nowrap"
        >
          Explore Campus Items →
        </Link>
      </div>
    </div>
  );
}
