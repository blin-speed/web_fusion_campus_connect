import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';

const CHANNELS = ['Books', 'Electronics', 'Sports', 'Misc'];

export default function RequestsBoard() {
  const navigate = useNavigate();
  const { currentUser, isGuest, promptSignIn } = useCurrentUser();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channel: CHANNELS[0],
  });

  const loadRequests = useCallback(async () => {
    try {
      const allRequests = await request('GET', '/demand-requests');
      setRequests(allRequests || []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openRequestForm = () => {
    if (isGuest) {
      promptSignIn('Sign in to post a community request');
      return;
    }
    setShowForm(true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      await request('POST', '/demand-requests', formData);
      setFormData({ title: '', description: '', channel: CHANNELS[0] });
      setShowForm(false);
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openRequests = requests.filter((req) => req.status !== 'fulfilled');
  const myFulfilledRequests = requests.filter(
    (req) => req.requesterId === currentUser?.id && req.status === 'fulfilled'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Community Board</h1>
          <p className="mt-2 text-sm text-slate-600">Need something that isn't listed? Ask the campus community.</p>
        </div>
        <button
          type="button"
          onClick={openRequestForm}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 active:scale-95"
        >
          ＋ Post a Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest} className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/40 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">What are you looking for?</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Request title *</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Graphing calculator for Friday's exam"
              className="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Category *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              >
                {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add relevant details such as dates, model, or intended use."
              className="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
            />
          </div>
          <div className="pt-2">
            <button disabled={submitting} className="w-full sm:w-auto rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Posting...' : 'Post to Board'}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Open requests</h2>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{openRequests.length} open</span>
        </div>
        
        {openRequests.length > 0 ? openRequests.map((req) => {
          const isMine = req.requesterId === currentUser?.id;
          return (
            <article key={req.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded bg-stone-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 border border-stone-200">
                  {req.channel || 'General'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{req.title}</h3>
              {req.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{req.description}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {req.requesterName ? req.requesterName.charAt(0) : '?'}
                  </div>
                  <span className="text-xs font-medium text-slate-500">Requested by <strong className="text-slate-700">{req.requesterName || 'Campus Member'}</strong></span>
                </div>
                {!isMine && (
                  <button
                    type="button"
                    onClick={() => isGuest ? promptSignIn('Sign in to fulfill a community request') : navigate('/create', { state: { demandRequest: req } })}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    I have this &rarr;
                  </button>
                )}
              </div>
            </article>
          );
        }) : (
          <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-10 text-center flex flex-col items-center">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm font-medium text-slate-500">No open requests yet. Be the first to ask the community!</p>
          </div>
        )}
      </section>

      {myFulfilledRequests.length > 0 && (
        <section className="space-y-4 border-t border-stone-200 pt-8 mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">My fulfilled requests</h2>
          <div className="grid gap-3">
            {myFulfilledRequests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="text-sm text-slate-800">{req.title}</strong>
                    <span className="ml-3 rounded border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Fulfilled</span>
                  </div>
                </div>
                {req.fulfilledByPostId && (
                  <Link to={`/post/${req.fulfilledByPostId}`} className="text-xs font-bold text-orange-700 hover:text-orange-800 hover:underline">
                    View listing &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
