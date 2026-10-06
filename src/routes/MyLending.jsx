import React, { useState, useEffect } from 'react';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function MyLending() {
  const { currentUserId } = useCurrentUser();
  const [exchanges, setExchanges] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const exs = await request('GET', '/exchanges/mine?role=owner');
        setExchanges(exs);
      } catch(e) {}
    }
    if (currentUserId) load();
  }, [currentUserId]);

  const handleHandover = async (id) => {
    await request('POST', `/exchanges/${id}/handover`, { body: { conditionBefore: "Good" } });
    window.location.reload();
  };

  const handleInspect = async (id) => {
    await request('POST', `/exchanges/${id}/inspect`, { body: { conditionAfter: "Good" } });
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Lending</h1>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Exchanges</h2>
        {exchanges.length === 0 ? <p>No exchanges.</p> : exchanges.map(ex => (
          <div key={ex.id} className="bg-white p-4 rounded shadow border">
            <p><strong>Item:</strong> {ex.post?.title}</p>
            <p><strong>Status:</strong> {ex.state}</p>
            <div className="mt-2 flex gap-2">
              {ex.state === 'handover' && <button onClick={()=>handleHandover(ex.id)} className="bg-orange-600 text-white px-3 py-1 rounded">Confirm Handover</button>}
              {ex.state === 'returned' && <button onClick={()=>handleInspect(ex.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Inspect & Settle</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
