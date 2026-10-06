import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { getAdminToken, setAdminToken } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const TabOverview = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatBox label="Users" value={stats?.activeMembers || 0} />
    <StatBox label="Listings" value={stats?.resourcesListed || 0} />
    <StatBox label="Exchanges" value={stats?.exchanges || 0} />
    <StatBox label="Overdue" value={stats?.overdueCount || 0} />
    <StatBox label="Open Disputes" value={stats?.openDisputes || 0} />
    <StatBox label="GMV" value={'$' + (stats?.gmv || 0)} />
    <StatBox label="Deposits" value={'$' + (stats?.deposits || 0)} />
    <StatBox label="Platform Fees" value={'$' + (stats?.platformFeesCollected || 0)} />
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="bg-white p-4 rounded shadow border text-center">
    <p className="text-slate-500 text-sm font-semibold uppercase">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const TabListings = () => {
  const [posts, setPosts] = useState([]);
  const load = async () => setPosts(await request('GET', '/admin/posts', { as: 'admin' }));
  useEffect(() => { load(); }, []);
  
  const action = async (id, act) => {
    await request('POST', `/admin/posts/${id}/${act}`, { as: 'admin' });
    load();
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr><th className="p-3">ID</th><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Flagged</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.id}</td>
              <td className="p-3">{p.title}</td>
              <td className="p-3">{p.approvalStatus}</td>
              <td className="p-3">{p.flagged ? 'Yes' : 'No'}</td>
              <td className="p-3 space-x-2">
                <button className="text-green-600 font-medium text-sm" onClick={() => action(p.id, 'approve')}>Approve</button>
                <button className="text-red-600 font-medium text-sm" onClick={() => action(p.id, 'reject')}>Reject</button>
                <button className="text-orange-600 font-medium text-sm" onClick={() => action(p.id, 'flag')}>Flag</button>
                <button className="text-blue-600 font-medium text-sm" onClick={() => action(p.id, 'unflag')}>Unflag</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabUsers = () => {
  const [users, setUsers] = useState([]);
  const load = async () => setUsers(await request('GET', '/admin/users', { as: 'admin' }));
  useEffect(() => { load(); }, []);

  const action = async (id, act) => {
    await request('POST', `/admin/users/${id}/${act}`, { as: 'admin' });
    load();
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Dept</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.department}</td>
              <td className="p-3">{u.verificationStatus}</td>
              <td className="p-3 space-x-2">
                <button className="text-green-600 font-medium text-sm" onClick={() => action(u.id, 'verify')}>Verify</button>
                <button className="text-red-600 font-medium text-sm" onClick={() => action(u.id, 'suspend')}>Suspend</button>
                <button className="text-blue-600 font-medium text-sm" onClick={() => action(u.id, 'unsuspend')}>Unsuspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabExchanges = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { request('GET', '/admin/exchanges', { as: 'admin' }).then(setItems); }, []);
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr><th className="p-3">ID</th><th className="p-3">Post ID</th><th className="p-3">Owner ID</th><th className="p-3">Borrower ID</th><th className="p-3">State</th></tr>
        </thead>
        <tbody>
          {items.map(e => (
            <tr key={e.id} className="border-t">
              <td className="p-3">{e.id}</td><td className="p-3">{e.post?.id}</td><td className="p-3">{e.owner?.id}</td><td className="p-3">{e.borrower?.id}</td><td className="p-3 font-bold text-slate-700">{e.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabDisputes = () => {
  const [items, setItems] = useState([]);
  const load = async () => setItems(await request('GET', '/admin/disputes', { as: 'admin' }));
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await request('POST', `/admin/disputes/${id}/resolve`, { as: 'admin', body: { resolution: 'Admin closed' } });
    load();
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr><th className="p-3">ID</th><th className="p-3">Exchange</th><th className="p-3">Status</th><th className="p-3">Kind</th><th className="p-3">Action</th></tr>
        </thead>
        <tbody>
          {items.map(d => (
            <tr key={d.id} className="border-t">
              <td className="p-3">{d.id}</td><td className="p-3">{d.exchange?.id}</td><td className="p-3">{d.status}</td><td className="p-3">{d.kind}</td>
              <td className="p-3">
                {d.status !== 'resolved' && <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm" onClick={() => resolve(d.id)}>Resolve</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabTransactions = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { request('GET', '/admin/transactions', { as: 'admin' }).then(setItems); }, []);
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr><th className="p-3">ID</th><th className="p-3">Exchange ID</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id} className="border-t">
              <td className="p-3">{t.id}</td><td className="p-3">{t.exchange?.id}</td><td className="p-3">{t.type}</td><td className="p-3">${t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabSettings = () => {
  const [platformFee, setPlatformFee] = useState('5.00');
  const [reqApproval, setReqApproval] = useState('false');
  const [dueSoonHours, setDueSoonHours] = useState('24');
  
  const saveSetting = async (k, v) => {
    try {
      await request('POST', '/admin/settings', { as: 'admin', body: { key: k, value: v } });
      alert('Saved ' + k);
    } catch(err) {
      alert(err.message);
    }
  };

  const handleClock = async () => {
    try {
      await request('POST', '/admin/clock', { body: { offsetDays: 1 }, as: 'admin' });
      alert('Time advanced +1 day!');
    } catch(err) {
      alert(err.message);
    }
  };
  
  const handleReset = async () => {
    try {
      await request('POST', '/admin/reset-demo', { as: 'admin' });
      alert('Demo Reset triggered!');
    } catch(err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow rounded space-y-4">
        <h2 className="text-xl font-bold">Platform Settings</h2>
        
        <div>
          <label className="block text-sm font-bold mb-1">Platform Fee %</label>
          <div className="flex gap-2">
            <input className="border p-2 rounded flex-1" value={platformFee} onChange={e=>setPlatformFee(e.target.value)} />
            <button className="bg-slate-800 text-white px-4 rounded" onClick={() => saveSetting('platformFeePercent', platformFee)}>Save</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Require Listing Approval</label>
          <div className="flex gap-2">
            <select className="border p-2 rounded flex-1" value={reqApproval} onChange={e=>setReqApproval(e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
            <button className="bg-slate-800 text-white px-4 rounded" onClick={() => saveSetting('requireListingApproval', reqApproval)}>Save</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Due-Soon Hours</label>
          <div className="flex gap-2">
            <input className="border p-2 rounded flex-1" value={dueSoonHours} onChange={e=>setDueSoonHours(e.target.value)} />
            <button className="bg-slate-800 text-white px-4 rounded" onClick={() => saveSetting('dueSoonHours', dueSoonHours)}>Save</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded space-y-4 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold text-orange-600">Demo Controls</h2>
        <div className="flex gap-4">
          <button onClick={handleClock} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Advance Time +1 Day</button>
          <button onClick={handleReset} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reset Demo Data</button>
        </div>
      </div>
    </div>
  );
};


export default function Admin() {
  const [token, setToken] = useState(getAdminToken());
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await request('POST', '/admin/login', { body: { password } });
      setAdminToken(res.token);
      setToken(res.token);
    } catch(err) {
      setError('Invalid admin credentials');
    }
  };

  const loadStats = async () => {
    try {
      const res = await request('GET', '/admin/stats', { as: 'admin' });
      setStats(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col items-center p-12">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl mb-4 font-bold">Admin Login</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin Password" required className="border w-full p-2 rounded mb-4" />
          <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  const tabs = ['Overview', 'Listings', 'Users', 'Exchanges', 'Disputes', 'Transactions', 'Settings'];

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`block w-full text-left px-4 py-2 rounded ${activeTab === t ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}>
            {t}
          </button>
        ))}
        <button onClick={() => { setAdminToken(null); setToken(null); navigate('/'); }} className="block w-full text-left px-4 py-2 rounded text-red-600 hover:bg-red-50 mt-8">
          Logout
        </button>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold mb-6">{activeTab}</h2>
        {activeTab === 'Overview' && <TabOverview stats={stats} />}
        {activeTab === 'Listings' && <TabListings />}
        {activeTab === 'Users' && <TabUsers />}
        {activeTab === 'Exchanges' && <TabExchanges />}
        {activeTab === 'Disputes' && <TabDisputes />}
        {activeTab === 'Transactions' && <TabTransactions />}
        {activeTab === 'Settings' && <TabSettings />}
      </div>
    </div>
  );
}
