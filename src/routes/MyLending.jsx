import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import PostCard from '../components/PostCard';
import RequestCard from '../components/RequestCard';
import StatusStepper from '../components/StatusStepper';
import {
  getPostsByOwner,
  getAllRequests,
  getExchangesByOwner,
  acceptRequest,
  markHandover,
  markReturned,
  markInspected,
  updatePickupLocation,
} from '../logic/stateMachine';

export default function MyLending() {
  const { currentUserId, currentUser, isGuest, users } = useCurrentUser();

  const [myPosts, setMyPosts] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeExchanges, setActiveExchanges] = useState([]);
  const [actionFeedback, setActionFeedback] = useState('');
  const [editingPickup, setEditingPickup] = useState({}); // exchangeId -> string

  const loadData = useCallback(async () => {
    if (!currentUserId) return;
    // 1. My posts (scoped to ownerId === currentUserId)
    const posts = await getPostsByOwner(currentUserId);
    setMyPosts(posts);

    const postIds = new Set(posts.map((p) => p.id));

    // 2. Incoming requests for my posts
    const allRequests = await getAllRequests();
    const relevantRequests = allRequests.filter((r) => postIds.has(r.postId));

    const enrichedRequests = relevantRequests.map((req) => {
      const post = posts.find((p) => p.id === req.postId);
      const borrower = users.find((u) => u.id === req.borrowerId);
      return {
        ...req,
        postTitle: post ? post.title : 'Item',
        borrowerName: borrower ? borrower.name : req.borrowerId,
      };
    });
    setIncomingRequests(enrichedRequests);

    // 3. Active exchanges scoped to current user as owner
    const myExchanges = await getExchangesByOwner(currentUserId);

    const enrichedExchanges = myExchanges.map((ex) => {
      const post = posts.find((p) => p.id === ex.postId);
      const borrower = users.find((u) => u.id === ex.borrowerId);
      return {
        ...ex,
        postTitle: post ? post.title : 'Exchange Item',
        borrowingCost: post?.borrowingCost || 50,
        securityDeposit: post?.securityDeposit || 300,
        borrowerName: borrower ? borrower.name : ex.borrowerId,
        pickupLocation: ex.pickupLocation || post?.location || 'Campus Main Library',
        dropoffLocation: ex.dropoffLocation || post?.location || 'Campus Main Library',
      };
    });
    setActiveExchanges(enrichedExchanges);
  }, [currentUserId, users]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (request) => {
    try {
      await acceptRequest(request.id);
      setActionFeedback(`Request for "${request.postTitle}" accepted! Sibling requests auto-closed. Waiting for borrower deposit.`);
      await loadData();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleAdvanceState = async (exchange, nextAction) => {
    try {
      if (nextAction === 'returned') await markReturned(exchange.id);
      else if (nextAction === 'inspected') await markInspected(exchange.id);

      setActionFeedback(`Exchange state updated to: ${nextAction}`);
      await loadData();
    } catch (err) {
      console.error('Failed to advance state:', err);
    }
  };

  const handleSavePickupLocation = async (exchangeId) => {
    const loc = editingPickup[exchangeId];
    if (!loc || !loc.trim()) return;

    try {
      await updatePickupLocation(exchangeId, currentUserId, loc.trim());
      setActionFeedback('Pickup location updated successfully!');
      setEditingPickup((prev) => {
        const next = { ...prev };
        delete next[exchangeId];
        return next;
      });
      await loadData();
    } catch (err) {
      console.error('Failed to update pickup location:', err);
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4 p-6">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">Sign In Required</h2>
        <p className="text-sm text-slate-600">
          Sign in using the profile button in the top-right to view your listed items and lending hub.
        </p>
        <Link to="/browse" className="text-sm font-bold text-orange-600 hover:underline">
          ← Browse Available Items
        </Link>
      </div>
    );
  }

  const pendingRequests = incomingRequests.filter((r) => r.status === 'pending');
  const pastRequests = incomingRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">My Lending Hub</h1>
          <p className="text-sm text-slate-600">
            Manage your listed items, review incoming borrow requests, and track handovers & returns
          </p>
        </div>
        <Link
          to="/create"
          className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
        >
          + List New Item
        </Link>
      </div>

      {actionFeedback && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800 flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback('')} className="text-xs font-bold text-orange-700 hover:text-orange-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Active Exchanges Section */}
      {activeExchanges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Active Exchanges in Progress ({activeExchanges.length})
          </h2>
          <div className="space-y-4">
            {activeExchanges.map((exchange) => {
              const state = exchange.state;
              const isEditingLoc = editingPickup[exchange.id] !== undefined;

              return (
                <div
                  key={exchange.id}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">{exchange.postTitle}</h3>
                      <p className="text-xs text-slate-500">
                        Borrower: <strong className="text-slate-800">{exchange.borrowerName}</strong> • Deposit: ₹{exchange.securityDeposit} • Borrow Cost: ₹{exchange.borrowingCost}
                      </p>
                    </div>
                    <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold uppercase text-orange-700 border border-orange-200">
                      State: {state}
                    </span>
                  </div>

                  <StatusStepper exchange={exchange} />

                  {/* Pickup & Dropoff Location Section */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2 text-xs">
                    <div className="font-bold text-slate-700 flex items-center justify-between font-heading">
                      <span>Exchange Logistics & Locations</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        (You manage Pickup • Borrower manages Dropoff)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Owner's Pickup Location (Editable) */}
                      <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">📍 Pickup Point (Your Location):</span>
                          {!isEditingLoc && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPickup((prev) => ({
                                  ...prev,
                                  [exchange.id]: exchange.pickupLocation,
                                }))
                              }
                              className="text-[11px] text-orange-600 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        {isEditingLoc ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              value={editingPickup[exchange.id]}
                              onChange={(e) =>
                                setEditingPickup((prev) => ({
                                  ...prev,
                                  [exchange.id]: e.target.value,
                                }))
                              }
                              className="flex-1 rounded-lg border border-stone-300 px-2 py-1 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePickupLocation(exchange.id)}
                              className="rounded-lg bg-orange-600 px-2 py-1 text-xs font-bold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPickup((prev) => {
                                  const next = { ...prev };
                                  delete next[exchange.id];
                                  return next;
                                })
                              }
                              className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-900 font-bold">{exchange.pickupLocation}</p>
                        )}
                      </div>

                      {/* Borrower's Dropoff Location (Read-only for Owner) */}
                      <div className="rounded-lg bg-white p-2.5 border border-stone-200 space-y-1">
                        <span className="font-semibold text-slate-700 block">
                          🏁 Dropoff Point (Borrower's Preference):
                        </span>
                        <p className="text-slate-900 font-bold">
                          {exchange.dropoffLocation || 'Not specified by borrower yet'}
                        </p>
                        <span className="text-[10px] text-slate-400 block">
                          Read-only (set by borrower)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lender Status / Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 bg-stone-50 p-3 rounded-xl">
                    <span className="text-xs text-slate-600 font-semibold font-heading">
                      Lender Action / Status:
                    </span>
                    <div className="flex items-center gap-2">
                      {state === 'payment_pending' && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300">
                          ⏳ Waiting for Borrower to pay Security Deposit (₹{exchange.securityDeposit}). Handover locked.
                        </span>
                      )}

                      {state === 'handover' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-700 font-bold mr-1">
                            ✓ Deposit Paid (₹{exchange.securityDeposit})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdvanceState(exchange, 'returned')}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
                          >
                            Item Returned by Borrower →
                          </button>
                        </div>
                      )}

                      {state === 'returned' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceState(exchange, 'inspected')}
                          className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
                        >
                          Confirm Inspected OK (Refund Deposit) →
                        </button>
                      )}

                      {state === 'inspected' && (
                        <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                          ⏳ Inspection Approved & Deposit Refunded! Waiting for Borrower payment.
                        </span>
                      )}

                      {state === 'settled' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          ✓ Settled & Paid — Awaiting Borrower Rating
                        </span>
                      )}

                      {state === 'rated' && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
                          ★ Rated: {exchange.rating || 5}/5 by Borrower
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Incoming Requests Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 font-heading">
          Incoming Borrow Requests ({pendingRequests.length} pending)
        </h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-slate-500">
            No pending borrow requests for your listed items right now.
          </div>
        )}

        {pastRequests.length > 0 && (
          <div className="pt-2">
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-bold text-slate-700 hover:text-orange-600 font-heading">
                View closed / accepted past requests ({pastRequests.length})
              </summary>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                {pastRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </details>
          </div>
        )}
      </section>

      {/* Owned Posts Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 font-heading">
          My Listed Resources ({myPosts.length})
        </h2>
        {myPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-slate-500">
            You haven't listed any items yet. Click "+ List New Item" above to share gear!
          </div>
        )}
      </section>
    </div>
  );
}
