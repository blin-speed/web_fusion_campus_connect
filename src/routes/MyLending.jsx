import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import ExchangeCard from '../components/ExchangeCard';
import RequestCard from '../components/RequestCard';

export default function MyLending() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const exs = await request('GET', '/exchanges/mine?role=owner');
      setExchanges(exs);
      const reqs = await request('GET', '/requests/incoming');
      setRequests(reqs.filter(r => r.status === 'pending'));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) load();
  }, [currentUserId]);

  const handleAccept = async (req) => {
    try {
      await request('POST', `/requests/${req.id}/accept`);
      load();
    } catch (_e) {
      alert("Failed to accept");
    }
  };

  const handleReject = async (req) => {
    try {
      await request('POST', `/requests/${req.id}/reject`);
      load();
    } catch (_e) {
      alert("Failed to reject");
    }
  };

  const needsAction = exchanges.filter(ex => ['handover', 'returned'].includes(ex.state));
  const active = exchanges.filter(ex => ['payment_pending', 'borrowed', 'inspected'].includes(ex.state));
  const past = exchanges.filter(ex => ['settled', 'rated', 'cancelled'].includes(ex.state));

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Lending</h1>
        <p className="mt-2 text-slate-500">Manage items you are lending to others.</p>
      </div>

      {requests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending Requests ({requests.length})
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {requests.map(req => (
              <RequestCard 
                key={req.id} 
                request={{
                  ...req,
                  postTitle: req.post?.title,
                  borrowerName: req.borrower?.name
                }} 
                onAccept={handleAccept} 
                onReject={handleReject} 
              />
            ))}
          </div>
        </section>
      )}

      {needsAction.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Needs Action
          </h2>
          <div className="grid gap-4">
            {needsAction.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="owner" />)}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Active Exchanges</h2>
        {active.length === 0 && needsAction.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-xl text-slate-500">
            No active lending exchanges.
          </div>
        ) : (
          <div className="grid gap-4">
            {active.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="owner" />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Past History</h2>
          <div className="grid gap-4 opacity-75">
            {past.map(ex => <ExchangeCard key={ex.id} exchange={ex} role="owner" />)}
          </div>
        </section>
      )}
    </div>
  );
}

