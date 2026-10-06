import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import RatingStars from '../components/RatingStars';
import { request } from '../api/client';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId, isGuest, promptSignIn } = useCurrentUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quote logic
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  
  // UI logic
  const [successMsg, setSuccessMsg] = useState('');

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
    if (!startAt || !endAt) return;
    setQuoteLoading(true);
    try {
      const q = await request('GET', `/posts/${id}/quote`, { query: { start: startAt + ':00Z', end: endAt + ':00Z' }});
      setQuote(q);
      setAgreementAccepted(false);
    } catch(err) {
      alert("Error getting quote: " + err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (isGuest) {
      promptSignIn('Sign in to request this item');
      return;
    }
    if (!agreementAccepted) {
      alert("Please accept the agreement.");
      return;
    }
    
    try {
      await request('POST', `/posts/${id}/requests`, {
        body: { start: startAt + ':00Z', end: endAt + ':00Z', agreementAccepted: true }
      });
      setSuccessMsg('Request submitted successfully!');
      setTimeout(() => navigate('/my-requests'), 2000);
    } catch(err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!post) return <div className="p-4 text-red-500">Post not found.</div>;

  const isOwner = currentUserId === post.owner?.id;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {successMsg && <div className="bg-green-100 text-green-800 p-3 rounded">{successMsg}</div>}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="bg-slate-200 aspect-video rounded-xl overflow-hidden flex items-center justify-center">
             <span className="text-slate-400">No Photo</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-orange-600 font-semibold text-xl">₹{post.rate} / {post.rateUnit}</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="font-semibold mb-2">Details</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Item:</strong> {post.itemName}</li>
              <li><strong>Condition:</strong> {post.itemCondition}</li>
              <li><strong>Accessories:</strong> {post.accessories}</li>
              <li><strong>Deposit:</strong> ₹{post.securityDeposit}</li>
            </ul>
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="font-semibold mb-2">Request this item</h3>
            {!isOwner ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Start Date & Time</label>
                  <input type="datetime-local" className="border p-2 rounded" value={startAt} onChange={e=>setStartAt(e.target.value)} />
                  <label className="text-sm font-medium">End Date & Time</label>
                  <input type="datetime-local" className="border p-2 rounded" value={endAt} onChange={e=>setEndAt(e.target.value)} />
                  <button onClick={handleGetQuote} disabled={!startAt || !endAt || quoteLoading} className="bg-slate-800 text-white p-2 rounded mt-2 hover:bg-slate-700 disabled:opacity-50">
                    Get Quote
                  </button>
                </div>

                {quote && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold mb-2">Quote Summary</h4>
                    <div className="flex justify-between text-sm"><span>Borrowing Charge</span><span>₹{quote.borrowingCharge}</span></div>
                    <div className="flex justify-between text-sm"><span>Platform Fee</span><span>₹{quote.platformFee}</span></div>
                    <div className="flex justify-between text-sm"><span>Refundable Deposit</span><span>₹{quote.securityDeposit}</span></div>
                    <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total to Pay</span><span>₹{quote.transactionAmount}</span></div>
                    
                    <div className="mt-4 p-3 bg-stone-100 rounded text-xs space-y-2">
                      <p className="font-semibold">Agreement</p>
                      <p>I agree to return <b>{quote.agreement?.resource}</b> on time. I accept responsibility for late fees and damages.</p>
                      <label className="flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={agreementAccepted} onChange={e=>setAgreementAccepted(e.target.checked)} />
                        <span>I accept the agreement terms</span>
                      </label>
                    </div>

                    <button onClick={handleSubmitRequest} disabled={!agreementAccepted} className="w-full bg-orange-600 text-white p-2 rounded mt-4 hover:bg-orange-700 disabled:opacity-50">
                      Submit Request
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You own this item. Check your requests dashboard for inquiries.</p>
            )}
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm border">
             <h3 className="font-semibold mb-2">Owner</h3>
             {post.owner && (
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                   {post.owner.name.charAt(0)}
                 </div>
                 <div>
                   <p className="font-medium">{post.owner.name}</p>
                   <p className="text-xs text-slate-500">{post.owner.department}</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
