import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints, resolveComplaint } from '../logic/stateMachine';
import { initDB } from '../db/schema';
import { seedIfEmpty } from '../db/seed';

const ADMIN_PASSWORD = 'admin123'; // Hardcoded demo password

function AdminDashboardContent() {
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const loadData = useCallback(async () => {
    const db = await initDB();
    const users = await db.getAll('users');
    setAllUsers(users);


    const list = await getAllComplaints();
    list.sort((a, b) => {
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    setComplaints(list);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleResolve = async (complaintId) => {
    try {
      await resolveComplaint(complaintId);
      setFeedback(`Complaint marked as resolved.`);
      await loadData();
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Are you sure? This clears all demo data and restores the original seed data.')) return;
    const db = await initDB();
    const storeNames = ['users', 'posts', 'requests', 'exchanges', 'complaints', 'demandRequests']
      .filter((storeName) => db.objectStoreNames.contains(storeName));
    const transaction = db.transaction(storeNames, 'readwrite');
    await Promise.all(storeNames.map((storeName) => transaction.objectStore(storeName).clear()));
    await transaction.done;
    await seedIfEmpty();
    window.location.reload();
  };

  const getRaiserName = (userId) => {
    const u = allUsers.find((user) => user.id === userId);
    return u ? u.name : userId;
  };

  const openCount = complaints.filter((c) => c.status === 'open').length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Admin-only top bar — deliberately plain to distinguish from main app */}
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight">🛡️ Campus Circular Admin</span>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            Separate Administration Console
          </span>
        </div>
        <Link
          to="/"
          className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-3 py-1.5 font-medium transition-colors"
        >
          ← Return to App
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
          >
            Reset Demo Data
          </button>
        </div>
        {/* Admin Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-gray-500">Total Complaints</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{complaints.length}</p>
          </div>
          <div className={`rounded-lg border p-4 shadow-sm ${openCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <span className="text-xs font-semibold uppercase text-gray-500">Open / Pending</span>
            <p className={`text-2xl font-black mt-1 ${openCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>
              {openCount}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-gray-500">Resolved</span>
            <p className="text-2xl font-black text-green-700 mt-1">
              {complaints.filter((c) => c.status === 'resolved').length}
            </p>
          </div>
        </div>

        {feedback && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback('')} className="text-xs font-semibold text-green-700 hover:text-green-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Complaints Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-bold text-gray-900">Disputes & Complaints Queue</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Resolve open disputes to release withheld security deposits.
            </p>
          </div>

          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Exchange</th>
                    <th className="px-5 py-3">Raised By</th>
                    <th className="px-5 py-3">Issue Description</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => {
                    const isOpen = c.status === 'open';
                    return (
                      <tr key={c.id} className={`hover:bg-gray-50 ${isOpen ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-gray-700">{c.id.slice(-8)}</td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-blue-700">{c.exchangeId.slice(-8)}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{getRaiserName(c.raisedBy)}</td>
                        <td className="px-5 py-3.5 max-w-xs text-gray-800 break-words text-xs">{c.text}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${
                            isOpen
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isOpen ? (
                            <button
                              type="button"
                              onClick={() => handleResolve(c.id)}
                              className="rounded bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-700"
                            >
                              Resolve & Release Deposit
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">✓ Resolved</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-gray-500">
              <p className="text-3xl mb-3">✅</p>
              No complaints currently on record. All clear!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect admin password. (Hint: admin123)');
      setPasswordInput('');
    }
  };

  if (unlocked) {
    return <AdminDashboardContent />;
  }

  // Admin Login Gate — completely separate from main app shell
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-2xl font-black text-white">Campus Circular Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Separate Administration Console</p>
          <p className="text-xs text-gray-600 mt-1">Not accessible from the main navigation.</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-xl border border-gray-700 bg-gray-800 p-6 space-y-4 shadow-xl"
        >
          <div>
            <label htmlFor="admin-pw" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Admin Password
            </label>
            <input
              id="admin-pw"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Sign In to Admin Console
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          This session resets on page reload. No real credentials are stored.
        </p>

        <div className="text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 underline">
            ← Back to Campus Circular
          </Link>
        </div>
      </div>
    </div>
  );
}
