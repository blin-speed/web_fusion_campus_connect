import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';
import AgreementModal from '../components/AgreementModal';

function Gallery({ photos }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-300 dark:border-neutral-800">
        <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
          No Photos Uploaded
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 overflow-hidden flex items-center justify-center">
        <img
          src={photos[activeIdx]?.url}
          alt="Resource view"
          className="w-full h-full object-contain"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`flex-shrink-0 w-16 h-16 border-2 transition-colors overflow-hidden ${
                idx === activeIdx
                  ? 'border-orange-600'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
              }`}
            >
              <img src={p.url} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to format ISO local datetime string (YYYY-MM-DDTHH:mm)
function formatLocalDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId, isGuest } = useCurrentUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pre-fill tomorrow 09:00 and day after tomorrow 17:00
  const [startAt, setStartAt] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return formatLocalDateTime(tomorrow);
  });
  const [endAt, setEndAt] = useState(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(17, 0, 0, 0);
    return formatLocalDateTime(dayAfter);
  });

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const p = await request('GET', `/posts/${id}`);
        setPost(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleGetQuote = async () => {
    if (isGuest) {
      navigate('/login', { state: { from: { pathname: `/post/${id}` } } });
      return;
    }
    if (!startAt || !endAt) {
      setErrorMsg('Please select both pick-up and return dates.');
      return;
    }

    const sDate = new Date(startAt);
    const eDate = new Date(endAt);
    if (eDate <= sDate) {
      setErrorMsg('Return date must be after pick-up date.');
      return;
    }

    setErrorMsg('');
    setQuoteLoading(true);
    try {
      const q = await request('GET', `/posts/${id}/quote`, {
        query: { start: startAt + ':00Z', end: endAt + ':00Z' },
      });
      setQuote(q);
      setModalOpen(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to calculate quote.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await request('POST', `/posts/${id}/requests`, {
        body: { start: startAt + ':00Z', end: endAt + ':00Z', agreementAccepted: true },
      });
      setModalOpen(false);
      navigate('/borrowing');
    } catch (err) {
      setErrorMsg(err.message || 'Request submission failed.');
      setModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Loading resource specifications...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-8 text-center text-xs font-medium text-red-600 dark:text-red-400">
        Resource not found or has been decommissioned.
      </div>
    );
  }

  const isOwner = currentUserId && post.owner?.id && currentUserId === post.owner.id;
  const categoryName = post.category?.name || (typeof post.category === 'string' ? post.category : 'Lab Equipment');
  const accessoriesText = Array.isArray(post.accessories)
    ? post.accessories.join(', ')
    : typeof post.accessories === 'string' && post.accessories.trim()
    ? post.accessories
    : 'None specified';
  const rate = post.rate != null ? post.rate : (post.price || 0);
  const rateUnit = (post.rateUnit || 'day').toLowerCase();
  const deposit = post.securityDeposit != null ? post.securityDeposit : (post.deposit || 0);
  const isAvailable = post.availability === 'available' || post.status === 'available';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-orange-600 uppercase tracking-wide font-medium">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-orange-600 uppercase tracking-wide font-medium">Inventory</Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{post.title}</span>
      </div>

      {errorMsg && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
          Alert: {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: GALLERY & SPECIFICATIONS */}
        <div className="lg:col-span-7 space-y-6">
          <Gallery photos={post.photos} />

          {/* ITEM SPECIFICATIONS */}
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Hardware Specifications
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border ${
                isAvailable
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-neutral-400 text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
              }`}>
                {isAvailable ? 'Available' : 'Reserved'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-400 block text-[11px] font-semibold uppercase tracking-wider">Category</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{categoryName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px] font-semibold uppercase tracking-wider">Condition Verification</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{post.itemCondition || post.condition || 'Good'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-neutral-400 block text-[11px] font-semibold uppercase tracking-wider">Accessories Included</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{accessoriesText}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">Technical Description</span>
                <p className="text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">
                  {post.description || post.conditionSummary || 'No detailed description provided by owner.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & RESERVATION PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sticky top-20">
            <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
              {post.title}
            </h1>

            {/* PRICING TILE */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-orange-600 dark:text-orange-500 tabular-nums">
                  ₹{rate}
                </span>
                <span className="text-xs uppercase text-neutral-500 font-semibold tracking-wide">
                  / {rateUnit}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Refundable Escrow Deposit: <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">₹{deposit}</strong>
              </div>
            </div>

            {/* DATES SELECTION */}
            <div className="space-y-4 mb-6 text-xs">
              <div className="font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-1 text-[11px]">
                Reservation Window
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Pick-up (Start)
                  </label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Return (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            {!isOwner ? (
              <button
                type="button"
                onClick={handleGetQuote}
                disabled={quoteLoading || !isAvailable}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
              >
                {quoteLoading
                  ? 'Calculating Escrow Quote...'
                  : isAvailable
                  ? 'Request to Borrow'
                  : 'Currently Reserved'}
              </button>
            ) : (
              <div className="border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                You are the registered owner
              </div>
            )}

            {/* OWNER METRO TILE */}
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 text-xs">
              <div className="w-9 h-9 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {post.owner?.name?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  u/{post.owner?.name || 'Campus Member'}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {post.owner?.department || 'Academic'} • Trust {post.owner?.trustScore != null ? Number(post.owner.trustScore).toFixed(1) : '4.9'}/5.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AgreementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        quote={quote}
        onAccept={handleAcceptRequest}
      />
    </div>
  );
}
