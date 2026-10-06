import React, { useState, useEffect } from 'react';
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
        setExchanges(exs);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (currentUserId) load();
  }, [currentUserId]);

  const needsAction = exchanges.filter(ex => ['payment_pending', 'inspected'].includes(ex.state));
  const active = exchanges.filter(ex => ['handover', 'borrowed', 'returned'].includes(ex.state));
  const past = exchanges.filter(ex => ['settled', 'rated', 'cancelled'].includes(ex.state));

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Borrowing</h1>
        <p className="mt-2 text-slate-500">Manage items you are borrowing from others.</p>
      </div>

      {needsAction.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Needs Action
          </h2>
          <div className="grid gap-4">
            {needsAction.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="borrower" />)}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Active Exchanges</h2>
        {active.length === 0 && needsAction.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-xl text-slate-500">
            No active borrowing exchanges.
          </div>
        ) : (
          <div className="grid gap-4">
            {active.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="borrower" />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Past History</h2>
          <div className="grid gap-4 opacity-75">
            {past.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="borrower" />)}
          </div>
        </section>
      )}
    </div>
  );
}
