import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import StatusStepper from '../components/StatusStepper';
import ConditionChecklist from '../components/ConditionChecklist';
import ConditionCompare from '../components/ConditionCompare';

export default function ExchangeRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('action');
  
  // Forms states
  const [conditionNote, setConditionNote] = useState('');
  const [damageAmount, setDamageAmount] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const load = async () => {
    try {
      const ex = await request('GET', `/exchanges/${id}`);
      setExchange(ex);
    } catch (_e) {
      console.error(_e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) load();
  }, [currentUserId, id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!exchange) return <div className="p-8 text-center text-red-500">Exchange not found</div>;

  const isOwner = currentUserId === exchange.owner?.id;
  const isBorrower = currentUserId === exchange.borrower?.id;
  const roleText = isOwner ? 'Owner' : 'Borrower';
  const otherUser = isOwner ? exchange.borrower : exchange.owner;

  // Actions
  const handleAction = async (endpoint, payload = {}) => {
    try {
      await request('POST', `/exchanges/${id}/${endpoint}`, { body: payload });
      setConditionNote('');
      setDamageAmount('');
      load();
    } catch(_e) {
      alert("Failed action");
    }
  };

  const renderActionPanel = () => {
    if (exchange.state === 'payment_pending' && isBorrower) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Payment Due</h3>
          <p className="text-sm">Please complete payment of ${exchange.transactionAmount} to proceed.</p>
          <button onClick={() => handleAction('pay', { dropoffLocationId: exchange.pickupLocation?.id })} className="bg-orange-600 text-white px-4 py-2 rounded font-bold w-full">Pay Now</button>
        </div>
      );
    }
    if (exchange.state === 'handover' && isOwner) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Handover Item</h3>
          <textarea className="w-full border rounded p-2 text-sm" rows="3" placeholder="Condition notes..." value={conditionNote} onChange={e=>setConditionNote(e.target.value)}></textarea>
          <ConditionChecklist value={[]} onChange={() => {}} />
          <button onClick={() => handleAction('handover', { conditionBefore: JSON.stringify({notes: conditionNote}) })} className="bg-orange-600 text-white px-4 py-2 rounded font-bold w-full">Confirm Handover</button>
        </div>
      );
    }
    if (exchange.state === 'borrowed' && isBorrower) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Return Item</h3>
          <textarea className="w-full border rounded p-2 text-sm" rows="3" placeholder="Return notes..." value={conditionNote} onChange={e=>setConditionNote(e.target.value)}></textarea>
          <button onClick={() => handleAction('return', { notes: conditionNote })} className="bg-orange-600 text-white px-4 py-2 rounded font-bold w-full">Confirm Return</button>
        </div>
      );
    }
    if (exchange.state === 'returned' && isOwner) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Inspect Item</h3>
          <textarea className="w-full border rounded p-2 text-sm" rows="3" placeholder="Condition after return..." value={conditionNote} onChange={e=>setConditionNote(e.target.value)}></textarea>
          <div className="flex gap-2 items-center">
            <span className="text-sm">Damage Claim ($):</span>
            <input type="number" className="border rounded p-1 w-24" value={damageAmount} onChange={e=>setDamageAmount(e.target.value)} />
          </div>
          <button onClick={() => handleAction('inspect', { conditionAfter: JSON.stringify({notes: conditionNote}), damage: damageAmount ? { amount: damageAmount } : null })} className="bg-orange-600 text-white px-4 py-2 rounded font-bold w-full">Submit Inspection</button>
        </div>
      );
    }
    if (exchange.state === 'inspected' && isBorrower) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Damage Assessment</h3>
          <p className="text-sm">Owner has filed a damage claim. Please review.</p>
          <div className="flex gap-2">
            <button onClick={() => handleAction('damage/accept')} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold flex-1">Accept</button>
            <button onClick={() => handleAction('damage/contest')} className="bg-rose-600 text-white px-4 py-2 rounded font-bold flex-1">Contest</button>
          </div>
        </div>
      );
    }
    if (exchange.state === 'settled' && isBorrower) {
      return (
        <div className="space-y-4">
          <h3 className="font-bold">Rate Exchange</h3>
          <input type="number" min="1" max="5" className="border rounded p-2 w-full mb-2" value={rating} onChange={e=>setRating(e.target.value)} />
          <textarea className="w-full border rounded p-2 text-sm" rows="3" placeholder="Review..." value={review} onChange={e=>setReview(e.target.value)}></textarea>
          <button onClick={() => handleAction('rate', { rating: parseInt(rating), review })} className="bg-orange-600 text-white px-4 py-2 rounded font-bold w-full">Submit Rating</button>
        </div>
      );
    }
    return <div className="text-center p-4 text-slate-500 italic">Waiting for the other party.</div>;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800">&larr; Back</button>
        <h1 className="text-2xl font-bold">Exchange Room</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <StatusStepper state={exchange.state} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="border-b flex text-sm">
              <button onClick={()=>setActiveTab('action')} className={`flex-1 py-3 font-semibold ${activeTab==='action'?'bg-stone-50 border-b-2 border-orange-600 text-orange-700':'text-slate-500'}`}>Action</button>
              <button onClick={()=>setActiveTab('details')} className={`flex-1 py-3 font-semibold ${activeTab==='details'?'bg-stone-50 border-b-2 border-orange-600 text-orange-700':'text-slate-500'}`}>Details</button>
              <button onClick={()=>setActiveTab('condition')} className={`flex-1 py-3 font-semibold ${activeTab==='condition'?'bg-stone-50 border-b-2 border-orange-600 text-orange-700':'text-slate-500'}`}>Condition</button>
            </div>
            <div className="p-4">
              {activeTab === 'action' && renderActionPanel()}
              {activeTab === 'details' && (
                <div className="text-sm space-y-2">
                  <p><strong>Item:</strong> {exchange.post?.title}</p>
                  <p><strong>{roleText === 'Owner' ? 'Borrower' : 'Owner'}:</strong> {otherUser?.name}</p>
                  <p><strong>Start:</strong> {exchange.startAt ? new Date(exchange.startAt).toLocaleString() : 'N/A'}</p>
                  <p><strong>Due:</strong> {exchange.dueAt ? new Date(exchange.dueAt).toLocaleString() : 'N/A'}</p>
                  <hr />
                  <p><strong>Total Amount:</strong> ${exchange.transactionAmount}</p>
                  <p><strong>Security Deposit:</strong> ${exchange.securityDeposit}</p>
                </div>
              )}
              {activeTab === 'condition' && (
                <div>
                  <h3 className="font-bold mb-2">Condition Log</h3>
                  <ConditionCompare conditionBefore={exchange.conditionBefore} conditionAfter={exchange.conditionAfter} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 text-sm space-y-3">
            <h3 className="font-bold border-b pb-2">Settlement Summary</h3>
            {exchange.state === 'settled' || exchange.state === 'rated' ? (
              <>
                <div className="flex justify-between"><span>Deposit Refund</span><span>${exchange.depositRefund}</span></div>
                <div className="flex justify-between"><span>Owner Payout</span><span>${exchange.ownerPayout}</span></div>
                {exchange.lateFee > 0 && <div className="flex justify-between text-rose-600"><span>Late Fee</span><span>${exchange.lateFee}</span></div>}
                {exchange.damageDeduction > 0 && <div className="flex justify-between text-rose-600"><span>Damage Deduction</span><span>${exchange.damageDeduction}</span></div>}
              </>
            ) : (
              <p className="text-slate-500 italic">Settlement will be calculated after inspection.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



