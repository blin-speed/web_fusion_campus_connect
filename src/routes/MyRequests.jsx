import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import ExchangeCard from '../components/ExchangeCard';

export default function MyRequests() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const exs = await request('GET', '/exchanges/mine?role=borrower');
        setExchanges(Array.isArray(exs) ? exs : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (currentUserId) load();
  }, [currentUserId]);

  const needsAction = exchanges.filter((ex) => ['payment_pending', 'inspected'].includes(ex.state));
  const active = exchanges.filter((ex) => ['handover', 'borrowed', 'returned'].includes(ex.state));
  const past = exchanges.filter((ex) => ['settled', 'rated', 'cancelled'].includes(ex.state));

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Querying borrowing escrow registry...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Borrowing Ledger // Active Escrows
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-300 dark:border-orange-800">
            {exchanges.length} Exchanges Total
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
          My Borrowing
        </h1>
        <p className="text-xs text-neutral-500">
          Manage hardware resources you have requested or borrowed from other students on campus.
        </p>
      </div>

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
        {active.length === 0 && needsAction.length === 0 ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              No active borrowing sessions
            </div>
            <p className="text-xs text-neutral-500">
              You do not have any active hardware borrowing requests.
            </p>
            <Link
              to="/browse"
              className="inline-block mt-2 text-xs font-semibold uppercase tracking-wide text-orange-600 hover:underline"
            >
              Browse Campus Hardware Inventory →
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
