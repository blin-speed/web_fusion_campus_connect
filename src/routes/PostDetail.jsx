import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import RatingStars from '../components/RatingStars';
import {
  getPostById,
  getUserById,
  submitRequest,
  getRequestsByPost,
  computePlatformFee,
} from '../logic/stateMachine';

export function PostDetailView({ postId, onBack }) {
  const navigate = useNavigate();
  const { currentUserId, currentUser, isGuest, promptSignIn } = useCurrentUser();

  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!postId) return;
      const p = await getPostById(postId);
      if (p) {
        setPost(p);
        const u = await getUserById(p.ownerId);
        setOwner(u);

        if (currentUserId) {
          const requests = await getRequestsByPost(postId);
          const userReq = requests.find(
            (r) =>
              r.borrowerId === currentUserId &&
              (r.status === 'pending' || r.status === 'accepted')
          );
          setHasExistingRequest(!!userReq);
        } else {
          setHasExistingRequest(false);
        }
      }
    }
    load();
  }, [postId, currentUserId]);

  const handleRequestClick = () => {
    if (isGuest) {
      promptSignIn('Sign in to submit a borrow request');
      return;
    }
    setAgreementModalOpen(true);
  };

  const handleConfirmAgreement = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await submitRequest(post.id, currentUserId);
      setHasExistingRequest(true);
      setAgreementModalOpen(false);
      setSuccessMsg('Borrow request submitted successfully! Check "My Requests" for updates.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit borrow request.');
      setAgreementModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading listing details or item not found...
      </div>
    );
  }

  const isOwner = currentUserId && post.ownerId === currentUserId;
  const isAvailable = post.status === 'available';
  const borrowingCost = post.borrowingCost || 50;
  const securityDeposit = post.securityDeposit || 300;
  const platformFee = computePlatformFee(borrowingCost);
  const location = post.location || 'Campus Main Library';

  const statusColors = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-300',
    lent: 'bg-slate-100 text-slate-700 border-slate-300',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const badgeColor = statusColors[post.status] || 'bg-slate-100 text-slate-700 border-slate-300';
  const canRequest = !isOwner && !hasExistingRequest && isAvailable;

  return (
    <div className="space-y-4">
      {/* Back button affordance */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors"
        >
          ← Back to Feed
        </button>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <span>{successMsg}</span>
          <button
            onClick={() => navigate('/my-requests')}
            className="text-xs font-bold underline ml-3 text-emerald-900"
          >
            Go to My Requests →
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700 border border-stone-200/60 font-heading">
                #{post.channel}
              </span>
              <span className="text-xs text-slate-500">• Item: {post.itemName}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">{post.title}</h1>
          </div>
          <span
            className={`rounded border px-3 py-1 text-xs font-bold capitalize ${badgeColor}`}
          >
            {post.status}
          </span>
        </div>

        {/* Image Placeholder */}
        <div className="flex h-48 w-full items-center justify-center rounded-xl bg-stone-100 border border-stone-200 text-slate-400">
          <div className="text-center">
            <span className="text-4xl block mb-1">📦</span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 font-heading">
              {post.itemName} • #{post.channel}
            </span>
          </div>
        </div>

        {/* Pricing / Transaction Model Breakdown */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
            Pricing Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-slate-500 block">1. Security Deposit</span>
              <strong className="text-base font-bold text-slate-900">₹{securityDeposit}</strong>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                Refunded upon return & inspection
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-slate-500 block">2. Borrowing Cost</span>
              <strong className="text-base font-bold text-slate-900">₹{borrowingCost}</strong>
              <span className="text-[11px] text-slate-500 block mt-0.5">Paid at settlement</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-slate-500 block">3. Est. Platform Fee (8%)</span>
              <strong className="text-base font-bold text-orange-600">₹{platformFee}</strong>
              <span className="text-[11px] text-slate-500 block mt-0.5">Paid at settlement</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-stone-100 pt-4">
          <h2 className="text-sm font-bold text-slate-800 mb-2 font-heading">About this Item</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {post.description || 'No additional description provided by owner.'}
          </p>
        </div>

        {/* Location & Owner Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-xs">
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <span className="text-slate-500 block mb-1 font-medium">Default Pickup Location:</span>
            <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
              <span>📍</span> {location}
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <span className="text-slate-500 block mb-1 font-medium">Owner & Trust Score:</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800 block font-heading">
                  {owner?.name || post.ownerId}
                </span>
                <span className="text-[11px] text-slate-500">
                  {owner?.department || 'Verified Member'}
                </span>
              </div>
              <RatingStars value={owner?.trustScore || 4.0} />
            </div>
          </div>
        </div>

        {/* Request to Borrow Button */}
        {canRequest && (
          <div className="border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={handleRequestClick}
              className="w-full rounded-lg bg-orange-600 py-3 px-4 text-center text-sm font-bold text-white shadow hover:bg-orange-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              Request to Borrow This Item
            </button>
          </div>
        )}
      </div>

      {/* Borrowing Agreement Confirmation Modal */}
      {agreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Borrowing Agreement & Request Summary
                </h3>
                <p className="text-xs text-slate-500">Review terms before confirming your request</p>
              </div>
              <button
                type="button"
                onClick={() => setAgreementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Summary Details */}
              <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Resource:</span>
                  <strong className="text-slate-900 font-heading">{post.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lender / Owner:</span>
                  <strong className="text-slate-900">{owner?.name || post.ownerId} (★ {owner?.trustScore})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Borrower:</span>
                  <strong className="text-orange-700">{currentUser?.name} ({currentUser?.department})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Spot:</span>
                  <span className="text-slate-900 font-medium">📍 {location}</span>
                </div>
              </div>

              {/* Financial Responsibilities */}
              <div className="grid grid-cols-3 gap-2 bg-orange-50/50 p-3 rounded-lg border border-orange-200 text-center">
                <div>
                  <span className="text-slate-500 block">Security Deposit</span>
                  <strong className="text-sm text-slate-900 font-bold">₹{securityDeposit}</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Refundable</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Borrowing Charge</span>
                  <strong className="text-sm text-slate-900 font-bold">₹{borrowingCost}</strong>
                  <span className="text-[10px] text-slate-500 block">At settlement</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Platform Fee (8%)</span>
                  <strong className="text-sm text-orange-600 font-bold">₹{platformFee}</strong>
                  <span className="text-[10px] text-slate-500 block">At settlement</span>
                </div>
              </div>

              {/* Community Pledge */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                <strong>Borrower Pledge:</strong> I agree to treat this item with care, return it in good condition to the agreed dropoff location, and adhere to campus sharing standards.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAgreementModalOpen(false)}
                className="rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAgreement}
                className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl">
      <PostDetailView postId={id} onBack={() => navigate('/browse')} />
    </div>
  );
}
