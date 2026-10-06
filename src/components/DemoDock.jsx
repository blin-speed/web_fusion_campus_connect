import React, { useState } from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';

export default function DemoDock() {
  const [collapsed, setCollapsed] = useState(true);
  const { users, currentUser, login } = useCurrentUser();

  if (import.meta.env.VITE_DEMO !== 'true') {
    return null;
  }

  const handleTimeTravel = async () => {
    try {
      await request('POST', '/admin/clock', { body: { offsetDays: 1 }, as: 'admin' });
      alert('Time advanced +1 day!');
    } catch(err) {
      alert('Time travel failed: ' + err.message);
    }
  };

  if (collapsed) {
    return (
      <button 
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-50 bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700 transition-colors"
        aria-label="Open Demo Dock"
      >
        Demo
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white p-4 rounded-xl shadow-xl border border-stone-200 w-72 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Demo Dock</h3>
        <button 
          onClick={() => setCollapsed(true)}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close Demo Dock"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Switch User</h4>
        <div className="space-y-1">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => login(u.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${currentUser?.id === u.id ? 'bg-orange-100 text-orange-800 font-bold' : 'hover:bg-stone-100 text-slate-700'}`}
            >
              {u.name} ({u.department})
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Time Travel</h4>
        <button
          onClick={handleTimeTravel}
          className="w-full bg-slate-800 text-white px-3 py-2 rounded text-sm font-bold hover:bg-slate-700"
        >
          Advance +1 Day
        </button>
      </div>
    </div>
  );
}
