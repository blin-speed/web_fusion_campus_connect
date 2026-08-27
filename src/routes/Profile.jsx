import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { getUserStats, getAllExchanges } from '../logic/stateMachine';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Film & Media Studies',
  'Electronics & Communication',
  'Chemical Engineering',
  'Business Administration',
  'Architecture',
  'General Studies',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, currentUserId, isGuest, updateProfile, refreshUsers, promptSignIn } = useCurrentUser();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '', year: '' });
  const [stats, setStats] = useState({ successfulExchangesCount: 0 });
  const [saveMsg, setSaveMsg] = useState('');

  // Guest guard
  useEffect(() => {
    if (isGuest) {
      promptSignIn('Sign in to view your profile');
    }
  }, [isGuest, promptSignIn]);

  const loadStats = useCallback(async () => {
    if (currentUserId) {
      const s = await getUserStats(currentUserId);
      setStats(s);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        department: currentUser.department || '',
        year: currentUser.year || '',
      });
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await updateProfile(currentUserId, {
      name: formData.name.trim(),
      department: formData.department,
      year: formData.year,
    });
    await refreshUsers();
    setSaveMsg('Profile updated successfully!');
    setEditing(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">Sign In Required</h2>
        <p className="text-sm text-slate-600">You need to be signed in to view your profile.</p>
        <Link to="/browse" className="text-sm font-bold text-orange-600 hover:underline">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  if (!currentUser) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading profile...</div>;
  }

  const verificationColors = {
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-300',
    unverified: 'bg-stone-100 text-slate-600 border-stone-200',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-2xl font-black text-white shadow font-heading">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-heading">{currentUser.name}</h1>
              <p className="text-sm text-slate-500">
                {currentUser.department || 'Department not set'} • {currentUser.year || 'Year not set'}
              </p>
              <span className={`mt-1.5 inline-block rounded border px-2 py-0.5 text-xs font-bold capitalize ${
                verificationColors[currentUser.verificationStatus] || 'bg-stone-100 text-slate-600 border-stone-200'
              }`}>
                {currentUser.verificationStatus === 'verified' ? '✓ Verified Campus Member' : currentUser.verificationStatus || 'unverified'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition-colors ${
              editing
                ? 'border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
                : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            {editing ? 'Cancel Edit' : '✏️ Edit Profile'}
          </button>
        </div>

        {saveMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-bold">
            {saveMsg}
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} className="border-t border-stone-100 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Display Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Year of Study</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-2.5 text-xs text-slate-500 border border-stone-200">
              <strong>Verification Status</strong> is managed by campus admin. All seed members are verified.
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Read-only Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-center">
          <span className="text-xs font-semibold uppercase text-slate-500 block">Trust Score</span>
          <p className="text-3xl font-black text-amber-600 mt-1 font-heading">★ {currentUser.trustScore == null ? 'N/A' : currentUser.trustScore.toFixed(1)}</p>
          <span className="text-[11px] text-slate-400">{currentUser.ratingsCount ? `Based on ${currentUser.ratingsCount} rating${currentUser.ratingsCount === 1 ? '' : 's'}` : 'No owner ratings yet'}</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-center">
          <span className="text-xs font-semibold uppercase text-slate-500 block">Rated Exchanges</span>
          <p className="text-3xl font-black text-orange-600 mt-1 font-heading">{stats.successfulExchangesCount}</p>
          <span className="text-[11px] text-slate-400">Completed & rated</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-center">
          <span className="text-xs font-semibold uppercase text-slate-500 block">Status</span>
          <p className={`text-lg font-black mt-1 capitalize font-heading ${
            currentUser.verificationStatus === 'verified' ? 'text-emerald-700' : 'text-slate-700'
          }`}>
            {currentUser.verificationStatus === 'verified' ? '✅ Verified' : '⚠ Unverified'}
          </p>
          <span className="text-[11px] text-slate-400">Campus membership</span>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-heading">
          Quick Shortcuts
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/my-requests" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-colors">
            📦 My Borrow Requests
          </Link>
          <Link to="/my-lending" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-colors">
            🤝 My Lending Hub
          </Link>
          <Link to="/impact" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-colors">
            🌱 Campus Impact
          </Link>
          <Link to="/browse" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-colors">
            🌐 Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
}
