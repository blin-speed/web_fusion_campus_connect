import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function MyRequests() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const exs = await request('GET', '/exchanges/mine?role=borrower');
        setExchanges(exs);
        const reqs = await request('GET', '/requests/mine');
        setRequests(reqs);
      } catch(e) {}
    }
    if (currentUserId) load();
  }, [currentUserId]);

  const handlePay = async (id) => {
    await request('POST', `/exchanges/${id}/pay`, { body: {} });
    window.location.reload();
  };

  const handleReturn = async (id) => {
    await request('POST', `/exchanges/${id}/return`, { body: { notes: "Returned fine" } });
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Borrowing</h1>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Exchanges</h2>
        {exchanges.length === 0 ? <p>No exchanges.</p> : exchanges.map(ex => (
          <div key={ex.id} className="bg-white p-4 rounded shadow border">
            <p><strong>Item:</strong> {ex.post?.title}</p>
            <p><strong>Status:</strong> {ex.state}</p>
            <div className="mt-2 flex gap-2">
              {ex.state === 'payment_pending' && <button onClick={()=>handlePay(ex.id)} className="bg-orange-600 text-white px-3 py-1 rounded">Pay Now</button>}
              {ex.state === 'borrowed' && <button onClick={()=>handleReturn(ex.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Return Item</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
