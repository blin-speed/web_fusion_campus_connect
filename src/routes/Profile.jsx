import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
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
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [targetId]);

  if (!targetId) {
    if (isGuest) return <Navigate to="/create-account" />;
    return <div>Loading...</div>;
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (error || !profileUser) return <div className="p-8 text-center text-red-500">{error || 'User not found'}</div>;

  const { name, department, year, bio, status, trustScore = 0, successfulExchanges = 0, lateReturns = 0, disputes = 0, ratingsCount = 0 } = profileUser;
  const isSuspended = status === 'SUSPENDED';

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (trustScore / 5) * circumference;
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {isSuspended && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 font-bold">This user is currently suspended.</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow-sm border border-stone-200">
        <h1 className="text-3xl font-bold text-slate-800">{name}</h1>
        <p className="text-slate-600 font-medium mt-1">{department} &bull; Year {year}</p>
        <div className="mt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Bio</h3>
          <p className="text-slate-700">{bio || 'No bio provided.'}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm border border-stone-200">
        <h2 className="text-xl font-extrabold text-slate-800 mb-6">Trust & Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center border-r border-stone-100 pr-0 sm:pr-8">
            <div className="relative flex items-center justify-center mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100" />
                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`${trustScore >= 4 ? 'text-green-500' : trustScore >= 3 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000`} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{Number(trustScore).toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Score</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {trustScore >= 4.5 && <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">Top Lender</span>}
              {successfulExchanges > 10 && <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">Active Member</span>}
              {trustScore > 0 && trustScore < 4.5 && successfulExchanges <= 10 && <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">Verified</span>}
            </div>
          </div>
          
          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Ratings</span>
              <span className="font-bold text-slate-800">{ratingsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Successful Exchanges</span>
              <span className="font-bold text-green-600">{successfulExchanges}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Late Returns</span>
              <span className="font-bold text-yellow-600">{lateReturns}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Disputes</span>
              <span className="font-bold text-red-600">{disputes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
