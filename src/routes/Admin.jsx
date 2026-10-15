import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { getAdminToken, setAdminToken } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const TabOverview = ({ stats }) => {
  const gmv = stats?.gmv != null ? stats.gmv : 0;
  const deposits = stats?.deposits != null ? stats.deposits : 0;
  const fees = stats?.platformFeesCollected != null ? stats.platformFeesCollected : 0;

  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Active Members" value={stats?.activeMembers || stats?.totalUsers || 0} />
        <StatBox label="Listed Resources" value={stats?.resourcesListed || stats?.totalPosts || 0} />
        <StatBox label="Active Exchanges" value={stats?.exchanges || stats?.totalExchanges || 0} />
        <StatBox label="Overdue Warnings" value={stats?.overdueCount || 0} highlight="text-orange-600" />
        <StatBox label="Open Disputes" value={stats?.openDisputes || 0} highlight="text-red-600" />
        <StatBox label="Gross Volume (₹)" value={`₹${Number(gmv).toLocaleString('en-IN')}`} />
        <StatBox label="Security Deposits (₹)" value={`₹${Number(deposits).toLocaleString('en-IN')}`} />
        <StatBox label="Platform Fees (₹)" value={`₹${Number(fees).toLocaleString('en-IN')}`} highlight="text-emerald-600" />
      </div>

      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Campus Security & System Status
        </div>
        <p className="text-neutral-700 dark:text-neutral-300 text-xs">
          All transactions and security deposits are held safely. Clock simulation allows advancing real-time schedules for overdue penalty validation.
        </p>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = 'text-neutral-900 dark:text-neutral-100' }) => (
  <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
    <p className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-light tabular-nums ${highlight}`}>{value}</p>
  </div>
);

const TabListings = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await request('GET', '/admin/posts', { as: 'admin' });
      setPosts(Array.isArray(data) ? data : (data?.content || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id, act) => {
    try {
      await request('POST', `/admin/posts/${id}/${act}`, { as: 'admin' });
      load();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Owner</th>
            <th className="p-3">Rate (₹)</th>
            <th className="p-3">Status</th>
            <th className="p-3">Flagged</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <tr>
              <td colSpan="7" className="p-6 text-center text-neutral-400">
                Loading listing registry...
              </td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-6 text-center text-neutral-400">
                No listings found
              </td>
            </tr>
          ) : (
            posts.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                <td className="p-3 font-semibold">{p.id}</td>
                <td className="p-3 max-w-xs truncate font-medium text-neutral-900 dark:text-neutral-100">
                  <Link to={`/post/${p.id}`} className="hover:underline text-orange-600">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">u/{p.owner?.name || 'Member'}</td>
                <td className="p-3 font-semibold tabular-nums">₹{p.rate || p.price || 0}</td>
                <td className="p-3 uppercase text-[11px] font-semibold">{p.approvalStatus || 'APPROVED'}</td>
                <td className="p-3">
                  {p.flagged ? (
                    <span className="text-red-600 font-bold">Flagged</span>
                  ) : (
                    <span className="text-neutral-400">No</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => action(p.id, 'approve')}
                      className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => action(p.id, 'reject')}
                      className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Reject
                    </button>
                    {!p.flagged ? (
                      <button
                        type="button"
                        onClick={() => action(p.id, 'flag')}
                        className="border border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Flag
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => action(p.id, 'unflag')}
                        className="border border-neutral-400 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Unflag
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const TabUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await request('GET', '/admin/users', { as: 'admin' });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id, act) => {
    try {
      await request('POST', `/admin/users/${id}/${act}`, { as: 'admin' });
      load();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Department</th>
            <th className="p-3">Trust</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <tr>
              <td colSpan="6" className="p-6 text-center text-neutral-400">
                Loading campus directory...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-6 text-center text-neutral-400">
                No registered users
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const isSuspended = u.status === 'SUSPENDED';
              return (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                  <td className="p-3 font-semibold">{u.id}</td>
                  <td className="p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                    <Link to={`/u/${u.id}`} className="hover:underline text-orange-600">
                      u/{u.name}
                    </Link>
                  </td>
                  <td className="p-3 uppercase text-[11px]">{u.department || 'Campus'}</td>
                  <td className="p-3 tabular-nums font-semibold">
                    {u.trustScore != null ? Number(u.trustScore).toFixed(1) : '4.9'}/5.0
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider ${
                      isSuspended
                        ? 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30'
                        : 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    }`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => action(u.id, 'verify')}
                        className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Verify
                      </button>
                      {!isSuspended ? (
                        <button
                          type="button"
                          onClick={() => action(u.id, 'suspend')}
                          className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => action(u.id, 'unsuspend')}
                          className="border border-neutral-400 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Unsuspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

const TabExchanges = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('GET', '/admin/exchanges', { as: 'admin' })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Item</th>
            <th className="p-3">Owner</th>
            <th className="p-3">Borrower</th>
            <th className="p-3">State</th>
            <th className="p-3">Deposit (₹)</th>
            <th className="p-3">Room</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <tr>
              <td colSpan="7" className="p-6 text-center text-neutral-400">
                Loading exchanges...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-6 text-center text-neutral-400">
                No active exchanges
              </td>
            </tr>
          ) : (
            items.map((e) => (
              <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                <td className="p-3 font-semibold">{e.id}</td>
                <td className="p-3 font-semibold max-w-xs truncate text-neutral-900 dark:text-neutral-100">
                  {e.post?.title || e.postTitle || `Post #${e.post?.id || ''}`}
                </td>
                <td className="p-3">u/{e.owner?.name || `User #${e.owner?.id}`}</td>
                <td className="p-3">u/{e.borrower?.name || `User #${e.borrower?.id}`}</td>
                <td className="p-3">
                  <span className="font-semibold uppercase tracking-wider text-orange-600">{e.state}</span>
                </td>
                <td className="p-3 font-semibold tabular-nums">₹{e.transactionAmount || 0}</td>
                <td className="p-3">
                  <Link
                    to={`/exchange/${e.id}`}
                    className="border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider hover:border-orange-600 hover:text-orange-600 transition-colors"
                  >
                    Enter
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const TabDisputes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await request('GET', '/admin/disputes', { as: 'admin' });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id, resolution) => {
    try {
      await request('POST', `/admin/disputes/${id}/resolve`, {
        as: 'admin',
        body: { resolution },
      });
      load();
    } catch (err) {
      alert(`Resolution failed: ${err.message}`);
    }
  };

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Exchange</th>
            <th className="p-3">Status</th>
            <th className="p-3">Reason / Notes</th>
            <th className="p-3">Arbitration Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <tr>
              <td colSpan="5" className="p-6 text-center text-neutral-400">
                Loading dispute workbench...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-6 text-center text-neutral-400">
                No open disputes on campus
              </td>
            </tr>
          ) : (
            items.map((d) => (
              <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                <td className="p-3 font-semibold">{d.id}</td>
                <td className="p-3 font-semibold">
                  <Link to={`/exchange/${d.exchange?.id || d.exchangeId}`} className="text-orange-600 hover:underline">
                    Exchange #{d.exchange?.id || d.exchangeId}
                  </Link>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider ${
                    d.status === 'resolved'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30'
                  }`}>
                    {d.status?.toUpperCase() || 'OPEN'}
                  </span>
                </td>
                <td className="p-3 max-w-xs truncate text-neutral-600 dark:text-neutral-400">
                  {d.reason || d.kind || 'No dispute details recorded.'}
                </td>
                <td className="p-3">
                  {d.status !== 'resolved' ? (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => resolve(d.id, 'favor_owner')}
                        className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                      >
                        Favor Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(d.id, 'split')}
                        className="border border-orange-600 text-orange-600 px-2 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                      >
                        Split 50/50
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(d.id, 'favor_borrower')}
                        className="border border-emerald-600 text-emerald-600 px-2 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        Favor Borrower
                      </button>
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs uppercase font-semibold">
                      Resolved ({d.resolution || 'Closed'})
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const TabTransactions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('GET', '/admin/transactions', { as: 'admin' })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Exchange</th>
            <th className="p-3">Type</th>
            <th className="p-3">Amount (₹)</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <tr>
              <td colSpan="5" className="p-6 text-center text-neutral-400">
                Auditing financial transactions...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-6 text-center text-neutral-400">
                No transactions logged
              </td>
            </tr>
          ) : (
            items.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                <td className="p-3 font-semibold">{t.id}</td>
                <td className="p-3">
                  <Link to={`/exchange/${t.exchange?.id || t.exchangeId}`} className="text-orange-600 hover:underline">
                    Exchange #{t.exchange?.id || t.exchangeId}
                  </Link>
                </td>
                <td className="p-3 font-semibold uppercase">{t.type}</td>
                <td className="p-3 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  ₹{t.amount}
                </td>
                <td className="p-3 uppercase text-neutral-500 text-[11px]">{t.status || 'SETTLED'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const TabSettings = () => {
  const [platformFee, setPlatformFee] = useState('5.00');
  const [reqApproval, setReqApproval] = useState('false');
  const [dueSoonHours, setDueSoonHours] = useState('24');
  const [msg, setMsg] = useState('');

  const saveSetting = async (k, v) => {
    try {
      await request('POST', '/admin/settings', { as: 'admin', body: { key: k, value: v } });
      setMsg(`Saved setting: ${k} = ${v}`);
    } catch (err) {
      setMsg(`Save failed: ${err.message}`);
    }
  };

  const handleClock = async () => {
    try {
      await request('POST', '/admin/clock', { body: { offsetDays: 1 }, as: 'admin' });
      setMsg('Time engine advanced +24 hours (+1 day). Schedules synchronized.');
    } catch (err) {
      setMsg(`Time advance failed: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean empty state?')) return;
    try {
      await request('POST', '/admin/reset-demo', { as: 'admin' });
      setMsg('Database reset successfully.');
    } catch (err) {
      setMsg(`Reset failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {msg && (
        <div className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-3 text-neutral-800 dark:text-neutral-200">
          System Notice: {msg}
        </div>
      )}

      {/* PLATFORM PARAMETERS */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Global Platform Financial Parameters
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Platform Commission Fee %
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value)}
              className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 flex-1 text-xs text-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={() => saveSetting('platformFeePercent', platformFee)}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Mandatory Listing Moderation
          </label>
          <div className="flex gap-2 max-w-md">
            <select
              value={reqApproval}
              onChange={(e) => setReqApproval(e.target.value)}
              className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 flex-1 text-xs text-neutral-900 dark:text-neutral-100"
            >
              <option value="false">No (Instant Listing)</option>
              <option value="true">Yes (Requires Admin Approval)</option>
            </select>
            <button
              type="button"
              onClick={() => saveSetting('requireListingApproval', reqApproval)}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Due-Soon Alert Threshold (Hours)
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={dueSoonHours}
              onChange={(e) => setDueSoonHours(e.target.value)}
              className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 flex-1 text-xs text-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={() => saveSetting('dueSoonHours', dueSoonHours)}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* CLOCK SIMULATION & TESTING */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          System Controls & Clock Simulation
        </div>
        <p className="text-xs text-neutral-500">
          Advance the virtual system clock by 24 hours to trigger overdue return penalties or reset database state.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleClock}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 font-semibold uppercase tracking-wider transition-colors"
          >
            +24h Clock Advance
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-5 py-2.5 font-semibold uppercase tracking-wider transition-colors"
          >
            Reset Database State
          </button>
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
    setError('');
    try {
      const res = await request('POST', '/admin/login', { body: { password } });
      setAdminToken(res.token);
      setToken(res.token);
    } catch (err) {
      setError(err?.message || 'Invalid administrator password');
    }
  };

  const loadStats = async () => {
    try {
      const res = await request('GET', '/admin/stats', { as: 'admin' });
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-neutral-900 dark:text-neutral-100">
        <div className="w-full max-w-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-xs shadow-xl">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Campus Connect
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 border border-orange-200 dark:border-orange-900">
              Admin Portal
            </span>
          </div>

          <h2 className="text-xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            Administrator Sign In
          </h2>
          <p className="text-[11px] text-neutral-500 mb-4">
            Authorized access only for campus inventory management, disputes, financial audit, and system settings.
          </p>

          {error && (
            <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 text-red-600 dark:text-red-400 mb-4 font-medium">
              Alert: {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 py-2.5 font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              Sign In to Admin
            </button>
            <div className="text-center pt-2">
              <Link to="/" className="text-[11px] text-neutral-400 hover:underline uppercase tracking-wide">
                ← Return to Campus Feed
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', label: '01. Overview' },
    { id: 'Listings', label: '02. Listings' },
    { id: 'Users', label: '03. Users' },
    { id: 'Exchanges', label: '04. Exchanges' },
    { id: 'Disputes', label: '05. Disputes' },
    { id: 'Transactions', label: '06. Transactions' },
    { id: 'Settings', label: '07. Settings' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col">
      {/* ADMIN HEADER */}
      <header className="sticky top-0 z-40 border-b border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Campus<span className="text-orange-600">Connect</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 border border-neutral-300 dark:border-neutral-800 px-2 py-0.5">
              Admin Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors"
            >
              ← Back to App
            </Link>
            <button
              type="button"
              onClick={() => {
                setAdminToken(null);
                setToken(null);
                navigate('/');
              }}
              className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ADMIN CONTENT */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full flex flex-col md:flex-row gap-6 text-xs">
        {/* SIDEBAR TABS */}
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Control Center
            </div>
            <div className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
              Campus Admin
            </div>
          </div>

          <div className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`block w-full text-left px-3 py-2 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === t.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE */}
        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              System // {activeTab.toUpperCase()}
            </h2>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
              System Operational
            </span>
          </div>

          {activeTab === 'Overview' && <TabOverview stats={stats} />}
          {activeTab === 'Listings' && <TabListings />}
          {activeTab === 'Users' && <TabUsers />}
          {activeTab === 'Exchanges' && <TabExchanges />}
          {activeTab === 'Disputes' && <TabDisputes />}
          {activeTab === 'Transactions' && <TabTransactions />}
          {activeTab === 'Settings' && <TabSettings />}
        </main>
      </div>

      <footer className="border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 text-center text-xs text-neutral-500">
        Campus Connect Administration Console
      </footer>
    </div>
  );
}
