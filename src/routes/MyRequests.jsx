import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import ExchangeCard from '../components/ExchangeCard';

export default function MyRequests() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [exs, reqs] = await Promise.all([
        request('GET', '/exchanges/mine?role=borrower').catch(() => []),
        request('GET', '/requests/mine').catch(() => []),
      ]);
      setExchanges(Array.isArray(exs) ? exs : []);
      setMyRequests(Array.isArray(reqs) ? reqs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) loadData();
  }, [currentUserId]);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Cancel this borrow request?')) return;
    try {
      await request('POST', `/requests/${requestId}/cancel`);
      setMyRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const needsAction = exchanges.filter((ex) => ['payment_pending', 'inspected'].includes(ex.state));
  const active = exchanges.filter((ex) => ['handover', 'borrowed', 'returned'].includes(ex.state));
  const past = exchanges.filter((ex) => ['settled', 'rated', 'cancelled'].includes(ex.state));

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Loading borrowing requests...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Borrowing Ledger // My Activity
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-300 dark:border-orange-800">
            {pendingRequests.length} Pending • {exchanges.length} Loans Total
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
          My Borrowing
        </h1>
        <p className="text-xs text-neutral-500">
          Manage resources you have requested or borrowed from other students on campus.
        </p>
      </div>

      {/* REQUESTS SENT (AWAITING OWNER APPROVAL) */}
      {pendingRequests.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-amber-500 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Request Sent // Awaiting Owner Approval ({pendingRequests.length})
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const post = req.post || {};
              const photoUrl = post.photos && post.photos.length > 0 ? post.photos[0].url : null;
              return (
                <div
                  key={req.id}
                  className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 transition-colors hover:border-neutral-400 dark:hover:border-neutral-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-semibold uppercase">No Photo</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
                            Awaiting Owner Approval
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            Sent {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <Link
                          to={`/post/${post.id}`}
                          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-orange-600 transition-colors"
                        >
                          {post.title || 'Resource'}
                        </Link>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Owner: <strong>u/{post.owner?.name || 'Campus Member'}</strong> • {req.units || 1} {post.rateUnit?.toLowerCase() || 'day'}(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/post/${post.id}`}
                        className="border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        View Listing
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        className="border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-red-600 hover:border-red-600 transition-colors"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* NEEDS ACTION */}
      {needsAction.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-red-600 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Action Required
            </span>
            <span className="text-[11px] text-neutral-400">
              Payment or damage review pending ({needsAction.length})
            </span>
          </div>
          <div className="space-y-3">
            {needsAction.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="borrower" />
            ))}
          </div>
        </section>
      )}

      {/* ACTIVE EXCHANGES */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-300 dark:border-neutral-800 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Active Protocols
          </span>
          <span className="text-[11px] text-neutral-400">
            Handover, loan period & return ({active.length})
          </span>
        </div>
        {active.length === 0 && needsAction.length === 0 && pendingRequests.length === 0 ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              No active borrowing sessions
            </div>
            <p className="text-xs text-neutral-500">
              You do not have any active borrowing requests or loans.
            </p>
            <Link
              to="/browse"
              className="inline-block mt-2 text-xs font-semibold uppercase tracking-wide text-orange-600 hover:underline"
            >
              Browse Campus Inventory →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="borrower" />
            ))}
          </div>
        )}
      </section>

      {/* SETTLED & HISTORY */}
      {past.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-300 dark:border-neutral-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Settled & Historical Archive
            </span>
            <span className="text-[11px] text-neutral-400">
              Completed or terminated ({past.length})
            </span>
          </div>
          <div className="space-y-3 opacity-80">
            {past.map((ex) => (
              <ExchangeCard key={ex.id} exchange={ex} role="borrower" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
