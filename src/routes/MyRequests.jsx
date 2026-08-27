import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import StatusStepper from '../components/StatusStepper';
import RatingStars from '../components/RatingStars';
import {
  getRequestsByBorrower,
  getAllPosts,
  getExchangesByBorrower,
  submitRating,
  raiseComplaint,
  confirmDepositPaid,
  confirmFinalPayment,
  computePlatformFee,
  updateDropoffLocation,
} from '../logic/stateMachine';

export default function MyRequests() {
  const { currentUserId, currentUser, isGuest, users, refreshUsers, promptSignIn } = useCurrentUser();

  const [requestsList, setRequestsList] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [complaintModal, setComplaintModal] = useState({ open: false, exchangeId: null, text: '' });
  const [ratingsState, setRatingsState] = useState({}); // exchangeId -> selected rating
  const [editingDropoff, setEditingDropoff] = useState({}); // exchangeId -> string
  const [initialDropoffInput, setInitialDropoffInput] = useState({}); // exchangeId -> string

  const loadData = useCallback(async () => {
    if (!currentUserId) return;
    const [reqs, posts, exchanges] = await Promise.all([
      getRequestsByBorrower(currentUserId),
      getAllPosts(),
      getExchangesByBorrower(currentUserId),
    ]);

    const enriched = reqs.map((req) => {
      const post = posts.find((p) => p.id === req.postId);
      const exchange = exchanges.find((e) => e.requestId === req.id);
      const owner = post ? users.find((u) => u.id === post.ownerId) : null;

      return {
        ...req,
        post,
        postTitle: post ? post.title : 'Item',
        borrowingCost: post?.borrowingCost || 50,
        securityDeposit: post?.securityDeposit || 300,
        ownerName: owner ? owner.name : post?.ownerId || 'Owner',
        ownerId: post?.ownerId,
        exchange: exchange
          ? {
              ...exchange,
              pickupLocation: exchange.pickupLocation || post?.location || 'Campus Main Library',
              dropoffLocation: exchange.dropoffLocation || '',
            }
          : null,
      };
    });

    setRequestsList(enriched);
  }, [currentUserId, users]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayDepositWithDropoff = async (exchangeId, explicitDropoff) => {
    const dropoffToUse = explicitDropoff || initialDropoffInput[exchangeId];
    if (!dropoffToUse || !dropoffToUse.trim()) {
      setFeedback('Please specify where you will return / drop off the item before paying deposit.');
      return;
    }

    try {
      await confirmDepositPaid(exchangeId, dropoffToUse.trim());
      setFeedback('Dropoff location confirmed and security deposit paid! Handover is now unlocked.');
      await loadData();
    } catch (err) {
      console.error('Failed to confirm deposit:', err);
      setFeedback(err.message || 'Failed to process deposit.');
    }
  };

  const handleFinalPayment = async (exchangeId) => {
    try {
      await confirmFinalPayment(exchangeId);
      setFeedback('Borrowing fee and platform fee paid successfully! Exchange is now settled.');
      await loadData();
    } catch (err) {
      console.error('Failed to confirm final payment:', err);
    }
  };

  const handleRate = async (exchangeId, value) => {
    try {
      await submitRating(exchangeId, value);
      await refreshUsers();
      setFeedback(`Rating of ${value} stars submitted! Owner trustScore recomputed.`);
      await loadData();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const handleSaveDropoffLocation = async (exchangeId) => {
    const loc = editingDropoff[exchangeId];
    if (!loc || !loc.trim()) return;

    try {
      await updateDropoffLocation(exchangeId, currentUserId, loc.trim());
      setFeedback('Dropoff preference updated successfully!');
      setEditingDropoff((prev) => {
        const next = { ...prev };
        delete next[exchangeId];
        return next;
      });
      await loadData();
    } catch (err) {
      console.error('Failed to update dropoff location:', err);
    }
  };

  const handleOpenComplaint = (exchangeId) => {
    setComplaintModal({ open: true, exchangeId, text: '' });
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintModal.text.trim()) return;

    try {
      await raiseComplaint(complaintModal.exchangeId, currentUserId, complaintModal.text.trim());
      setComplaintModal({ open: false, exchangeId: null, text: '' });
      setFeedback('Complaint filed successfully. It is now visible in the Admin dashboard.');
    } catch (err) {
      console.error('Failed to file complaint:', err);
    }
  };

  // Guest guard
  if (isGuest) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4 p-6">
        <div className="text-5xl mb-4">📦</div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">Sign In Required</h2>
        <p className="text-sm text-slate-600">
          Sign in using the profile button in the top-right to view your borrow requests.
        </p>
        <Link to="/browse" className="text-sm font-bold text-orange-600 hover:underline">
          ← Browse Available Items
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">My Borrow Requests</h1>
          <p className="text-sm text-slate-600">Track items you have requested or currently borrowed</p>
        </div>
        <Link
          to="/browse"
          className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
        >
          Find More Items
        </Link>
      </div>

      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Complaint Form Modal */}
      {complaintModal.open && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-red-900 font-heading">
              Raise a Dispute / Complaint
            </h3>
            <button
              onClick={() => setComplaintModal({ open: false, exchangeId: null, text: '' })}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-red-700">
            Disputes are reviewed by campus administrators on the Admin dashboard.
          </p>
          <form onSubmit={handleSubmitComplaint} className="space-y-3">
            <textarea
              value={complaintModal.text}
              onChange={(e) =>
                setComplaintModal((prev) => ({ ...prev, text: e.target.value }))
              }
              rows={3}
              placeholder="Describe the issue (e.g. item condition discrepancy, missed handover, late return)..."
              className="w-full rounded-lg border border-red-300 bg-white p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setComplaintModal({ open: false, exchangeId: null, text: '' })}
                className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
              >
                Submit Complaint to Admin
              </button>
            </div>
          </form>
        </div>
      )}

      {requestsList.length > 0 ? (
        <div className="space-y-4">
          {requestsList.map((req) => {
            const exch = req.exchange;
            const exchState = exch?.state;
            const isPaymentPending = exchState === 'payment_pending';
            const isInspected = exchState === 'inspected';
            const isSettled = exchState === 'settled';
            const isRated = exchState === 'rated';

            const borrowingCost = req.borrowingCost;
            const securityDeposit = req.securityDeposit;
            const platformFee = computePlatformFee(borrowingCost);
            const finalPaymentDue = borrowingCost + platformFee;
            const isEditingDropoff = exch && editingDropoff[exch.id] !== undefined;
            const hasDropoff = exch && exch.dropoffLocation && exch.dropoffLocation.trim() !== '';

            return (
              <div
                key={req.id}
                className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-heading">{req.postTitle}</h3>
                    <p className="text-xs text-slate-500">
                      Lender: <strong className="text-slate-800">{req.ownerName}</strong> • Requested on{' '}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-2.5 py-1 text-xs font-bold uppercase ${
                        req.status === 'accepted'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : req.status === 'closed_auto'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {req.status === 'closed_auto' ? 'Auto-closed' : req.status}
                    </span>
                  </div>
                </div>

                {exch ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1 font-heading">
                        Exchange Lifecycle Progress
                      </p>
                      <StatusStepper exchange={exch} />
                    </div>

                    {/* Pickup & Dropoff Location Section */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2 text-xs">
                      <div className="font-bold text-slate-700 flex items-center justify-between font-heading">
                        <span>Exchange Logistics & Locations</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          (Owner manages Pickup • You manage Dropoff)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Owner's Pickup Location (Read-only for Borrower) */}
                        <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                          <span className="font-semibold text-slate-700 block">
                            📍 Pickup Point (Owner's Location):
                          </span>
                          <p className="text-slate-900 font-bold">{exch.pickupLocation}</p>
                          <span className="text-[10px] text-slate-400 block">
                            Read-only (set by lender)
                          </span>
                        </div>

                        {/* Borrower's Dropoff Location (Editable once set) */}
                        <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">🏁 Return Dropoff Location:</span>
                            {hasDropoff && !isEditingDropoff && (
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingDropoff((prev) => ({
                                    ...prev,
                                    [exch.id]: exch.dropoffLocation,
                                  }))
                                }
                                className="text-[11px] text-orange-600 hover:underline font-bold"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {isEditingDropoff ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="text"
                                value={editingDropoff[exch.id]}
                                onChange={(e) =>
                                  setEditingDropoff((prev) => ({
                                    ...prev,
                                    [exch.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 rounded-lg border border-stone-300 px-2 py-1 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveDropoffLocation(exch.id)}
                                className="rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingDropoff((prev) => {
                                    const next = { ...prev };
                                    delete next[exch.id];
                                    return next;
                                  })
                                }
                                className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-slate-900 font-bold">
                              {hasDropoff ? exch.dropoffLocation : (
                                <span className="text-amber-800 italic">Not set yet (required below)</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 1 Checkpoint: Security Deposit Pending */}
                    {isPaymentPending && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-amber-900 font-heading">
                            Checkpoint 1: Dropoff Location & Security Deposit
                          </h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Your request was accepted! Specify your return dropoff location and pay the refundable security deposit of{' '}
                            <strong>₹{securityDeposit}</strong> to unlock handover.
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
                          <label className="block text-xs font-semibold text-slate-700">
                            Where will you return / drop off this item? *
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={
                                initialDropoffInput[exch.id] !== undefined
                                  ? initialDropoffInput[exch.id]
                                  : exch.dropoffLocation || ''
                              }
                              onChange={(e) =>
                                setInitialDropoffInput((prev) => ({
                                  ...prev,
                                  [exch.id]: e.target.value,
                                }))
                              }
                              placeholder="e.g. Hostel Block B Entrance, Library Ground Floor Desk"
                              className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handlePayDepositWithDropoff(
                                  exch.id,
                                  initialDropoffInput[exch.id] || exch.dropoffLocation
                                )
                              }
                              className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 whitespace-nowrap transition-all"
                            >
                              Confirm & Pay Deposit (₹{securityDeposit}) →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2 Checkpoint: Inspection Complete -> Final Payment Required */}
                    {isInspected && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 font-heading">
                              Checkpoint 2: Settlement Payment
                            </h4>
                            <p className="text-xs text-slate-600">
                              The lender inspected and approved the returned item. Pay the borrowing charge & platform fee to complete.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFinalPayment(exch.id)}
                            className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
                          >
                            Pay Final Amount (₹{finalPaymentDue}) →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-orange-200/60 text-xs">
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-slate-500 block">Borrowing Cost</span>
                            <strong className="text-slate-900 font-bold">₹{borrowingCost}</strong>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-slate-500 block">Platform Fee (8%)</span>
                            <strong className="text-orange-600 font-bold">₹{platformFee}</strong>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-slate-500 block">Total Due Now</span>
                            <strong className="text-slate-900 font-bold">₹{finalPaymentDue}</strong>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-slate-500 block">Deposit (Paid)</span>
                            <span className="text-emerald-700 font-bold">₹{securityDeposit} ✓</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deposit Refunded Banner */}
                    {exch.securityDepositRefunded && (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 shadow-2xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>🛡️</span> Security deposit (₹{securityDeposit}) refunded in full
                        </span>
                        <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                          Refunded ✓
                        </span>
                      </div>
                    )}

                    {/* Actions bar for borrower: Rating when settled + Raise Complaint */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 bg-stone-50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        {isSettled && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 font-heading">
                              Rate this exchange:
                            </span>
                            <RatingStars
                              value={ratingsState[exch.id] || 5}
                              interactive={true}
                              onChange={(val) => {
                                setRatingsState((prev) => ({ ...prev, [exch.id]: val }));
                                handleRate(exch.id, val);
                              }}
                            />
                          </div>
                        )}

                        {isRated && (
                          <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                            <span>★ You rated this exchange:</span>
                            <RatingStars value={exch.rating || 5} />
                          </div>
                        )}

                        {!isSettled && !isRated && !isPaymentPending && !isInspected && (
                          <span className="text-xs text-slate-500">
                            Current Stage: <strong className="capitalize text-slate-800 font-bold">{exchState}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenComplaint(exch.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        ⚠ Raise Dispute / Complaint
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    {req.status === 'pending'
                      ? 'Waiting for lender to accept your request...'
                      : req.status === 'closed_auto'
                      ? 'Another request was accepted for this item.'
                      : 'Request closed.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-slate-500 space-y-2">
          <p className="text-3xl">📦</p>
          <p className="font-semibold text-slate-700">You haven't requested any items yet.</p>
          <Link to="/browse" className="inline-block rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700">
            Browse available items
          </Link>
        </div>
      )}
    </div>
  );
}
