import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import ExchangeCard from '../components/ExchangeCard';
import RequestCard from '../components/RequestCard';

export default function MyLending() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const load = async () => {
    try {
      const exs = await request('GET', '/exchanges/mine?role=owner');
      setExchanges(Array.isArray(exs) ? exs : []);
      const reqs = await request('GET', '/requests/incoming');
      setRequests(Array.isArray(reqs) ? reqs.filter((r) => r.status === 'pending') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) load();
  }, [currentUserId]);

  const handleAccept = async (req) => {
    setErrorMsg('');
    try {
      await request('POST', `/requests/${req.id}/accept`);
      load();
    } catch (e) {
      setErrorMsg(e.message || 'Failed to accept request');
    }
  };

  const handleReject = async (req) => {
    setErrorMsg('');
    try {
      await request('POST', `/requests/${req.id}/reject`);
      load();
    } catch (e) {
      setErrorMsg(e.message || 'Failed to reject request');
    }
  };

  const needsAction = exchanges.filter((ex) => ['handover', 'returned'].includes(ex.state));
  const active = exchanges.filter((ex) => ['payment_pending', 'borrowed', 'inspected'].includes(ex.state));
  const past = exchanges.filter((ex) => ['settled', 'rated', 'cancelled'].includes(ex.state));

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Querying lending registry & inventory...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Lending Ledger // Hardware Inventory
          </span>
          <Link
            to="/create"
            className="text-xs font-semibold uppercase tracking-wider text-white bg-orange-600 px-3 py-1.5 hover:bg-orange-700 transition-colors"
          >
            + List New Resource
          </Link>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
          My Lending
        </h1>
        <p className="text-xs text-neutral-500">
          Manage hardware resources you are lending out, inspect returned items, and approve incoming reservation requests.
        </p>
      </div>

      {errorMsg && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
          Alert: {errorMsg}
        </div>
      )}

      {/* INCOMING PENDING REQUESTS */}
      {requests.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-orange-600 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Incoming Requests
            </span>
            <span className="text-[11px] text-neutral-400">
              Requires owner approval ({requests.length})
            </span>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={{
                  ...req,
                  postTitle: req.post?.title || 'Hardware Item',
                  borrowerName: req.borrower?.name || 'Student',
                }}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        </section>
      )}

      {/* NEEDS ACTION (HANDOVER / RETURN INSPECTION) */}
      {needsAction.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-red-600 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Action Required
            </span>
            <span className="text-[11px] text-neutral-400">
              Handover verification or return inspection pending ({needsAction.length})
            </span>
          </div>
          <div className="space-y-3">
            {needsAction.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="owner" />
            ))}
          </div>
        </section>
      )}

      {/* ACTIVE EXCHANGES */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-300 dark:border-neutral-800 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Active Lending Sessions
          </span>
          <span className="text-[11px] text-neutral-400">
            Awaiting payment, active loan, or borrower inspection review ({active.length})
          </span>
        </div>
        {active.length === 0 && needsAction.length === 0 ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              No active lending sessions
            </div>
            <p className="text-xs text-neutral-500">
              None of your hardware is currently in an active lending session.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="owner" />
            ))}
          </div>
        )}
      </section>

      {/* SETTLED & HISTORY */}
      {past.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-300 dark:border-neutral-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Settled Archive
            </span>
            <span className="text-[11px] text-neutral-400">
              Past sessions ({past.length})
            </span>
          </div>
          <div className="space-y-3 opacity-80">
            {past.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="owner" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
