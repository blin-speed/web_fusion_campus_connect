import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';

export default function Profile() {
  const { id } = useParams();
  const { currentUser, isGuest } = useCurrentUser();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetId = id || (currentUser ? currentUser.id : null);

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    request('GET', `/users/${targetId}`)
      .then((data) => {
        setProfileUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load user profile.');
        setLoading(false);
      });
  }, [targetId]);

  if (!targetId) {
    if (isGuest) return <Navigate to="/create-account" replace />;
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center text-xs font-medium text-neutral-500">
        Initializing identity context...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Fetching campus member identity & reputation...
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto border border-red-600 bg-red-50 dark:bg-red-950/40 p-6 text-center text-xs font-medium text-red-600 dark:text-red-400">
        {error || 'Member identity record not found.'}
      </div>
    );
  }

  const {
    name,
    department,
    year,
    bio,
    status = 'ACTIVE',
    trustScore = 4.8,
    successfulExchanges = 0,
    lateReturns = 0,
    disputes = 0,
    ratingsCount = 0,
  } = profileUser;

  const isSuspended = status === 'SUSPENDED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isSuspended && (
        <div className="border-2 border-red-600 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
          Restriction Alert: This account is currently suspended by campus administration.
        </div>
      )}

      {/* MEMBER IDENTITY TILE */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Member Record // ID #{profileUser.id}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border ${
            isSuspended
              ? 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30'
              : 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
          }`}>
            {status || 'Active'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold flex items-center justify-center text-2xl flex-shrink-0">
            {name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
              u/{name}
            </h1>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
              {department || 'Campus Department'} • Year {year || 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1 font-semibold">
            Bio & Lab Affiliation
          </span>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {bio || 'No public biographical notes provided.'}
          </p>
        </div>
      </div>

      {/* TRUST & REPUTATION AUDIT */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-xs space-y-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Trust Telemetry & Reputation Ledger
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* PRIMARY SCORE TILE */}
          <div className="border border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Weighted Trust Metric
            </span>
            <div className="text-4xl font-light tabular-nums text-neutral-900 dark:text-neutral-100 my-2">
              {Number(trustScore).toFixed(1)} <span className="text-base text-neutral-400 font-normal">/ 5.0</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {trustScore >= 4.5 && (
                <span className="px-2 py-0.5 border border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-semibold uppercase tracking-wider">
                  Top Tier Lender
                </span>
              )}
              <span className="px-2 py-0.5 border border-neutral-400 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold uppercase tracking-wider">
                Verified Identity
              </span>
            </div>
          </div>

          {/* METRIC BREAKDOWN */}
          <div className="space-y-3 justify-center flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="text-neutral-500 uppercase text-[11px] font-semibold tracking-wider">Ratings Submitted</span>
              <strong className="text-neutral-900 dark:text-neutral-100 tabular-nums">{ratingsCount}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="text-neutral-500 uppercase text-[11px] font-semibold tracking-wider">Successful Loans</span>
              <strong className="text-emerald-600 tabular-nums">{successfulExchanges}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="text-neutral-500 uppercase text-[11px] font-semibold tracking-wider">Late Return Incidents</span>
              <strong className="text-orange-600 tabular-nums">{lateReturns}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 uppercase text-[11px] font-semibold tracking-wider">Disputes Recorded</span>
              <strong className={disputes > 0 ? 'text-red-600 tabular-nums' : 'text-neutral-400 tabular-nums'}>
                {disputes}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
