import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import channelsData from '../db/channels.json';
import { useCurrentUser } from '../context/CurrentUserContext';
import { createDemandRequest, getAllDemandRequests } from '../logic/stateMachine';

export default function RequestsBoard() {
  const navigate = useNavigate();
  const { currentUserId, isGuest, users, promptSignIn } = useCurrentUser();
  const channelKeys = Object.keys(channelsData);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channel: channelKeys[0] || '',
  });

  const loadRequests = useCallback(async () => {
    const allRequests = await getAllDemandRequests();
    setRequests(allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
      await createDemandRequest({ ...formData, requesterId: currentUserId });
      setFormData({ title: '', description: '', channel: channelKeys[0] || '' });
      setShowForm(false);
      await loadRequests();
    } finally {
      setSubmitting(false);
    }
  };

  const openRequests = requests.filter((request) => request.status === 'open');
  const myFulfilledRequests = requests.filter(
    (request) => request.requesterId === currentUserId && request.status === 'fulfilled'
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Community Request Board</h1>
          <p className="mt-1 text-sm text-slate-600">Need something that isn&apos;t listed? Ask the campus community.</p>
        </div>
        <button
          type="button"
          onClick={openRequestForm}
          className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          ＋ Post a Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest} className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 font-heading">What are you looking for?</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">Cancel</button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Request title *</label>
            <input
              required
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Graphing calculator for Friday's exam"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Channel *</label>
              <select
                value={formData.channel}
                onChange={(event) => setFormData((current) => ({ ...current, channel: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {channelKeys.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button disabled={submitting} className="w-full rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50">
                {submitting ? 'Posting...' : 'Post to Board'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              placeholder="Add relevant details such as dates, model, or intended use."
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </form>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-heading">Open requests</h2>
          <span className="text-xs text-slate-400">{openRequests.length} open</span>
        </div>
        {openRequests.length ? openRequests.map((request) => {
          const requester = users.find((user) => user.id === request.requesterId);
          const isMine = request.requesterId === currentUserId;
          return (
            <article key={request.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700">#{request.channel}</span>
                <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">Open</span>
              </div>
              <h3 className="font-heading text-base font-bold text-slate-800">{request.title}</h3>
              {request.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{request.description}</p>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs text-slate-500">
                <span>Requested by <strong className="text-slate-800">{requester?.name || 'Campus Member'}</strong></span>
                {!isMine && (
                  <button
                    type="button"
                    onClick={() => isGuest ? promptSignIn('Sign in to fulfil a community request') : navigate('/create', { state: { demandRequest: request } })}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 font-bold text-orange-700 hover:bg-orange-100"
                  >
                    I have this →
                  </button>
                )}
              </div>
            </article>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-slate-500">
            No open requests yet. Be the first to ask the community.
          </div>
        )}
      </section>

      {myFulfilledRequests.length > 0 && (
        <section className="space-y-3 border-t border-stone-200 pt-5">
          <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-slate-500 font-heading">My fulfilled requests</h2>
          {myFulfilledRequests.map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm">
              <div><strong className="text-slate-800">{request.title}</strong><span className="ml-2 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-emerald-800">Fulfilled</span></div>
              {request.fulfilledByPostId && <Link to={`/post/${request.fulfilledByPostId}`} className="text-xs font-bold text-orange-700 hover:underline">View listing →</Link>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
