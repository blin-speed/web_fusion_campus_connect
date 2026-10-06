import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await request('POST', '/admin/login', { body: { password } });
      sessionStorage.setItem('admin_token', res.token);
      setToken(res.token);
    } catch(e) {
      setError('Invalid password');
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats for demo if backend isn't returning yet
      setStats({
        activeMembers: 24,
        resourcesListed: 50,
        exchanges: 12
      });
    } catch(e) {}
  };

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  const handleClock = async () => {
    try {
      await request('POST', '/admin/clock', { headers: { 'Authorization': `Bearer ${token}` }});
      alert('Time advanced +1 day!');
    } catch(e) {
      alert(e.message);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center p-12">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl mb-4 font-bold">Admin Login</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required className="border w-full p-2 rounded mb-4" />
          <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex gap-4">
        <button onClick={handleClock} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Advance Time +1 Day</button>
        <button onClick={()=>{sessionStorage.removeItem('admin_token'); setToken(null)}} className="border px-4 py-2 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-slate-500">Active Members</p>
          <p className="text-3xl font-bold">{stats?.activeMembers || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-slate-500">Listings</p>
          <p className="text-3xl font-bold">{stats?.resourcesListed || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-slate-500">Exchanges</p>
          <p className="text-3xl font-bold">{stats?.exchanges || 0}</p>
        </div>
      </div>
    </div>
  );
}
