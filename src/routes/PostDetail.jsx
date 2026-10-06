import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';
import Button from '../components/ui/Button';
import AgreementModal from '../components/AgreementModal';

function Gallery({ photos }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
        <span className="text-slate-400">No Photos Available</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <img src={photos[activeIdx].url} alt="Item" className="w-full h-full object-contain" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((p, idx) => (
            <button key={p.id || idx} onClick={() => setActiveIdx(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === activeIdx ? 'border-orange-500' : 'border-transparent hover:border-slate-300'}`}>
              <img src={p.url} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId, isGuest, promptSignIn } = useCurrentUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);

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
      promptSignIn('Sign in to request this item');
      return;
    }
    if (!startAt || !endAt) return;
    
    // Validate dates
    const sDate = new Date(startAt);
    const eDate = new Date(endAt);
    if (eDate <= sDate) {
      alert("End date must be after start date.");
      return;
    }
    if (sDate < new Date()) {
      alert("Start date cannot be in the past.");
      return;
    }

    setQuoteLoading(true);
    try {
      const q = await request('GET', `/posts/${id}/quote`, { query: { start: startAt + ':00Z', end: endAt + ':00Z' }});
      setQuote(q);
      setModalOpen(true);
    } catch(err) {
      alert("Error getting quote: " + err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await request('POST', `/posts/${id}/requests`, {
        body: { start: startAt + ':00Z', end: endAt + ':00Z', agreementAccepted: true }
      });
      setModalOpen(false);
      navigate('/borrowing');
    } catch(err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading item details...</div>;
  if (!post) return <div className="p-12 text-center text-red-500">Item not found.</div>;

  const isOwner = currentUserId === post.owner?.id;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          <Gallery photos={post.photos} />
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Item Specifications</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Category</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{post.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Condition</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{post.itemCondition}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400">Accessories Included</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{post.accessories || 'None'}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-slate-500 dark:text-slate-400">Description</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{post.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">{post.title}</h1>
            <div className="flex items-baseline gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
              <span className="text-3xl font-black text-orange-600 dark:text-orange-500">₹{post.rate}</span>
              <span className="text-slate-500 font-medium">/ {post.rateUnit}</span>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Select Dates</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pick-up</label>
                  <input type="datetime-local" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" value={startAt} onChange={e=>setStartAt(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Return</label>
                  <input type="datetime-local" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" value={endAt} onChange={e=>setEndAt(e.target.value)} />
                </div>
              </div>
            </div>

            {!isOwner ? (
              <Button onClick={handleGetQuote} disabled={!startAt || !endAt || quoteLoading} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {quoteLoading ? 'Calculating...' : 'Request Item'}
              </Button>
            ) : (
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-medium text-sm">
                You own this listing
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {post.owner?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{post.owner?.name}</p>
                  <p className="text-xs text-slate-500">{post.owner?.department || 'Member'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AgreementModal isOpen={modalOpen} onClose={() => setModalOpen(false)} quote={quote} onAccept={handleAcceptRequest} />
    </div>
  );
}
