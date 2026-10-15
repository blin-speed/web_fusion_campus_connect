import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { request } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import StatusStepper from '../components/StatusStepper';
import ConditionChecklist from '../components/ConditionChecklist';
import ConditionCompare from '../components/ConditionCompare';
import PhotoUploader from '../components/PhotoUploader';

export default function ExchangeRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('action');
  const [errorMsg, setErrorMsg] = useState('');
  const [checklist, setChecklist] = useState([]);

  // Form states
  const [conditionNote, setConditionNote] = useState('');
  const [damageAmount, setDamageAmount] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [handoverPhotos, setHandoverPhotos] = useState([]);
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [inspectPhotos, setInspectPhotos] = useState([]);

  const load = async () => {
    try {
      const ex = await request('GET', `/exchanges/${id}`);
      setExchange(ex);
    } catch (e) {
      setErrorMsg(e.message || 'Failed to load exchange data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId && id) load();
  }, [currentUserId, id]);

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Initializing secure exchange session...
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-8 text-center text-xs font-medium text-red-600 dark:text-red-400">
        Exchange session not found or access denied.
      </div>
    );
  }

  const isOwner = currentUserId === exchange.owner?.id;
  const isBorrower = currentUserId === exchange.borrower?.id;
  const otherUser = isOwner ? exchange.borrower : exchange.owner;
  const otherRole = isOwner ? 'Borrower' : 'Owner';

  const handleAction = async (endpoint, payload = {}) => {
    setErrorMsg('');
    try {
      await request('POST', `/exchanges/${id}/${endpoint}`, { body: payload });
      setConditionNote('');
      setDamageAmount('');
      load();
    } catch (e) {
      setErrorMsg(e.message || 'Exchange protocol action failed');
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt('Enter reason for opening administrative dispute:');
    if (!reason || !reason.trim()) return;
    setErrorMsg('');
    try {
      await request('POST', `/exchanges/${id}/dispute`, {
        body: { reason: reason.trim(), filedByUserId: currentUserId },
      });
      load();
    } catch (e) {
      setErrorMsg(e.message || 'Failed to file dispute');
    }
  };

  const renderActionPanel = () => {
    // 1. PAYMENT PENDING (BORROWER)
    if (exchange.state === 'payment_pending' && isBorrower) {
      return (
        <div className="space-y-4 text-xs">
          <div className="border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4">
            <div className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1 text-[11px]">
              Payment Required
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">
              Your borrowing request has been approved by the owner. Please complete the payment and deposit to confirm your reservation.
            </p>
            <div className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Upfront Total: <span className="text-orange-600 tabular-nums">₹{exchange.transactionAmount}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAction('pay', { dropoffLocationId: exchange.pickupLocation?.id })}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            Complete Payment (₹{exchange.transactionAmount})
          </button>
        </div>
      );
    }

    // 2. HANDOVER (OWNER)
    if (exchange.state === 'handover' && isOwner) {
      return (
        <div className="space-y-4 text-xs">
          <div className="border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 text-[11px]">
              Confirm Physical Handover
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">
              Payment is confirmed. Verify the items together with the borrower, note any cosmetic marks, and confirm transfer.
            </p>
          </div>
          <ConditionChecklist value={checklist} onChange={setChecklist} />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Handover Remarks & Accessory Verification
            </label>
            <textarea
              rows={3}
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Clean casing, power supply and USB-C cable included, tested working."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Handover Condition Photos (Optional / Recommended)
            </label>
            <PhotoUploader purpose="CONDITION_BEFORE" onUpload={setHandoverPhotos} maxPhotos={4} />
          </div>
          <button
            type="button"
            onClick={() =>
              handleAction('handover', {
                conditionBefore: JSON.stringify({ notes: conditionNote, checklist, photoIds: handoverPhotos }),
                photoIds: handoverPhotos,
              })
            }
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            Confirm Physical Handover
          </button>
        </div>
      );
    }

    // 3. ACTIVE LOAN / RETURN (BORROWER)
    if (exchange.state === 'borrowed' && isBorrower) {
      return (
        <div className="space-y-4 text-xs">
          <div className="border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 text-[11px]">
              Active Loan in Progress
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">
              Hardware is currently checked out in your custody. When you return the item to the owner, record return remarks below.
            </p>
            <div className="mt-2 text-[11px] text-neutral-500">
              Return Deadline: <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">{exchange.dueAt ? new Date(exchange.dueAt).toLocaleString() : 'Specified end date'}</strong>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Return Notes & Condition Summary
            </label>
            <textarea
              rows={3}
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Returned in identical condition with all accessories to campus lab desk."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Return Photos (Optional)
            </label>
            <PhotoUploader purpose="CONDITION_AFTER" onUpload={setReturnPhotos} maxPhotos={4} />
          </div>
          <button
            type="button"
            onClick={() =>
              handleAction('return', {
                notes: conditionNote,
                photoIds: returnPhotos,
                conditionAfter: JSON.stringify({ notes: conditionNote, photoIds: returnPhotos }),
              })
            }
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            Confirm Item Return to Owner
          </button>
        </div>
      );
    }

    // 4. RETURNED / INSPECT (OWNER)
    if (exchange.state === 'returned' && isOwner) {
      return (
        <div className="space-y-4 text-xs">
          <div className="border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-4">
            <div className="font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1 text-[11px]">
              Return Received // Inspection Pending
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">
              The borrower reported returning the item. Test all functions and inspect for damage before completing the exchange.
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Inspection Remarks
            </label>
            <textarea
              rows={3}
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Bench tested, all functions intact, accessories verified."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Inspection / Condition Photos (Optional)
            </label>
            <PhotoUploader purpose="CONDITION_AFTER" onUpload={setInspectPhotos} maxPhotos={4} />
          </div>
          <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Damage Claim Amount in ₹ (leave empty if no damage)
            </label>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-500">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                placeholder="0"
                className="w-32 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
              <span className="text-[11px] text-neutral-400">
                (Deducted from borrower deposit)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleAction('inspect', {
                  conditionAfter: JSON.stringify({ notes: conditionNote, photoIds: inspectPhotos }),
                  photoIds: inspectPhotos,
                  damage: damageAmount && parseFloat(damageAmount) > 0 ? { amount: parseFloat(damageAmount) } : null,
                })
              }
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              Submit Return Inspection
            </button>
            <button
              type="button"
              onClick={handleDispute}
              className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              Report Dispute
            </button>
          </div>
        </div>
      );
    }

    // 5. INSPECTED / DAMAGE REVIEW (BORROWER)
    if (exchange.state === 'inspected' && isBorrower) {
      return (
        <div className="space-y-4 text-xs">
          <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1 text-[11px]">
              Damage Claim Filed by Owner
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">
              The owner recorded damage during return inspection and requested a deduction from your security deposit.
            </p>
            <div className="mt-2 text-sm font-semibold text-red-600 tabular-nums">
              Claimed Deduction: ₹{exchange.damageDeduction || exchange.damage?.amount || '0'}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleAction('damage/accept')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              Accept Damage Claim
            </button>
            <button
              type="button"
              onClick={() => handleAction('damage/contest')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              Contest Claim / Open Dispute
            </button>
          </div>
        </div>
      );
    }

    // 6. SETTLED (BORROWER OR OWNER)
    if (exchange.state === 'settled') {
      if (isBorrower) {
        return (
          <div className="space-y-4 text-xs">
            <div className="border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <div className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 text-[11px]">
                Exchange Settled // Deposit Refunded
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 text-xs">
                Payment and deposit refund have been processed. Please rate your lending partner to maintain campus trust scores.
              </p>
            </div>
            <div className="space-y-4 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Partner Trust Rating (Select 1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="text-2xl leading-none transition-transform hover:scale-125 focus:outline-none p-0.5"
                        title={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <span
                          className={
                            (hoverRating || rating) >= star
                              ? 'text-amber-500'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 ml-2">
                    {rating === 1 && '1 / 5 — Poor'}
                    {rating === 2 && '2 / 5 — Fair'}
                    {rating === 3 && '3 / 5 — Good'}
                    {rating === 4 && '4 / 5 — Very Good'}
                    {rating === 5 && '5 / 5 — Excellent'}
                    {rating === 0 && (
                      <span className="text-orange-600 dark:text-orange-400 font-normal">
                        * Please choose a rating
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Public Feedback / Review (Optional)
                </label>
                <textarea
                  rows={2}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="e.g. Excellent hardware condition, swift handover."
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={!rating || rating < 1}
                onClick={() => handleAction('rate', { rating, review })}
                className={`w-full py-2.5 font-semibold uppercase tracking-wider text-xs transition-colors ${
                  rating >= 1
                    ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                }`}
              >
                {rating >= 1
                  ? `Submit ${rating}-Star Rating & Complete Exchange`
                  : 'Select Rating to Complete Exchange'}
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center text-xs">
          <div className="font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            Exchange Settled
          </div>
          <p className="text-neutral-500">
            Payout of ₹{exchange.ownerPayout || '0'} has been released to your balance. Awaiting borrower review.
          </p>
        </div>
      );
    }

    // 7. RATED / COMPLETED
    if (exchange.state === 'rated') {
      return (
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center text-xs">
          <div className="font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Protocol Archived // Fully Completed
          </div>
          <p className="text-neutral-500">
            This lending exchange is closed and verified. Trust metrics updated.
          </p>
        </div>
      );
    }

    // WAITING FOR COUNTERPARTY
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center text-xs space-y-2">
        <div className="font-semibold uppercase tracking-wider text-neutral-400">
          Awaiting {otherRole} Action
        </div>
        <p className="text-neutral-500">
          Current protocol state: <strong className="text-neutral-900 dark:text-neutral-100 uppercase font-semibold">{exchange.state}</strong>.
          Waiting for u/{otherUser?.name || 'partner'} to execute next step.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            ← Back
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <h1 className="text-sm sm:text-base font-semibold uppercase tracking-tight text-neutral-900 dark:text-neutral-100">
            Exchange #{exchange.id} // {exchange.post?.title || 'Item'}
          </h1>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
          Role: {isOwner ? 'Owner' : 'Borrower'}
        </span>
      </div>

      {errorMsg && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
          Alert: {errorMsg}
        </div>
      )}

      {/* STATUS STEPPER TILE */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <StatusStepper state={exchange.state} />
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT WORKSPACE (TABS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {/* TABS */}
            <div className="flex border-b border-neutral-300 dark:border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('action')}
                className={`flex-1 py-3 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'action'
                    ? 'border-b-2 border-orange-600 text-orange-600 bg-neutral-50 dark:bg-neutral-950'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Actions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-orange-600 text-orange-600 bg-neutral-50 dark:bg-neutral-950'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('condition')}
                className={`flex-1 py-3 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'condition'
                    ? 'border-b-2 border-orange-600 text-orange-600 bg-neutral-50 dark:bg-neutral-950'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Condition Log
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'action' && renderActionPanel()}

              {activeTab === 'details' && (
                <div className="text-xs space-y-3">
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-400 font-medium">Hardware Title</span>
                    <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">{exchange.post?.title}</strong>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-400 font-medium">{otherRole} Handle</span>
                    <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">u/{otherUser?.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-400 font-medium">Start Date</span>
                    <span>{exchange.startAt ? new Date(exchange.startAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-400 font-medium">Return Deadline</span>
                    <span>{exchange.dueAt ? new Date(exchange.dueAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-400 font-medium">Transaction Total</span>
                    <strong className="text-orange-600 font-semibold tabular-nums">₹{exchange.transactionAmount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-medium">Refundable Deposit</span>
                    <strong className="text-neutral-900 dark:text-neutral-100 font-semibold tabular-nums">₹{exchange.securityDeposit}</strong>
                  </div>
                </div>
              )}

              {activeTab === 'condition' && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Audit of Physical Condition
                  </div>
                  <ConditionCompare
                    conditionBefore={exchange.conditionBefore}
                    conditionAfter={exchange.conditionAfter}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE (FINANCIAL LEDGER) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-xs space-y-3">
            <div className="font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-[11px]">
              Financial Settlement Ledger
            </div>

            {exchange.state === 'settled' || exchange.state === 'rated' ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit Refunded</span>
                  <span className="font-semibold text-emerald-600 tabular-nums">₹{exchange.depositRefund}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Owner Payout</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{exchange.ownerPayout}</span>
                </div>
                {exchange.lateFee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Deduction</span>
                    <span className="tabular-nums">-₹{exchange.lateFee}</span>
                  </div>
                )}
                {exchange.damageDeduction > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Damage Deduction</span>
                    <span className="tabular-nums">-₹{exchange.damageDeduction}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[10px] text-neutral-400 uppercase font-semibold">
                  Exchange Closed & Settled
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Paid & Held</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{exchange.transactionAmount || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Base Charge</span>
                  <span className="tabular-nums">₹{exchange.borrowingCharge || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Security Deposit</span>
                  <span className="tabular-nums">₹{exchange.securityDeposit || '0'}</span>
                </div>
                <div className="text-[11px] text-neutral-400 italic pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  Settlement deductions (if any) and deposit refunds are executed automatically after return inspection.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
