import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import channelsData from '../db/channels.json';
import { createPost, fulfillDemandRequest } from '../logic/stateMachine';

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserId, isGuest } = useCurrentUser();

  const channelKeys = Object.keys(channelsData);

  const demandRequest = location.state?.demandRequest;
  const [formData, setFormData] = useState({
    title: demandRequest?.title || '',
    channel: demandRequest?.channel || channelKeys[0] || 'Filming Equipment',
    itemName: demandRequest?.title || '',
    location: '',
    description: demandRequest?.description || '',
    borrowingCost: '',
    securityDeposit: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.itemName.trim() || !formData.location.trim()) return;

    setIsSubmitting(true);
    try {
      const post = await createPost({
        ownerId: currentUserId,
        title: formData.title.trim(),
        channel: formData.channel,
        itemName: formData.itemName.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        borrowingCost: Number(formData.borrowingCost || 0),
        securityDeposit: Number(formData.securityDeposit || 0),
      });
      if (demandRequest?.id) {
        await fulfillDemandRequest(demandRequest.id, post.id, currentUserId);
        navigate('/requests-board');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setIsSubmitting(false);
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4 p-6">
        <div className="text-5xl mb-4">➕</div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">Sign In Required</h2>
        <p className="text-sm text-slate-600">
          You need to be signed in to list an item for lending. Use the avatar button in the top-right.
        </p>
        <Link to="/browse" className="text-sm font-bold text-orange-600 hover:underline">
          ← Browse Available Items
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 font-heading">List an Item for Lending</h1>
        <p className="text-sm text-slate-600 mb-6">
          Share your equipment, calculators, textbooks, or accessories with campus peers.
        </p>
        {demandRequest && (
          <div className="mb-5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
            You&apos;re fulfilling <strong>{demandRequest.title}</strong>. Publishing this listing will mark that request fulfilled.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700">
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sony Alpha DSLR Camera with 18-55mm Lens"
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="channel" className="block text-xs font-semibold text-slate-700">
                Channel / Category *
              </label>
              <select
                id="channel"
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {channelKeys.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="itemName" className="block text-xs font-semibold text-slate-700">
                Item Keyword *
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. camera, calculator, tripod"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-semibold text-slate-700">
              Default Pickup Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Hostel 3 Ground Floor or Central Library Lobby"
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="borrowingCost" className="block text-xs font-semibold text-slate-700">
                Borrowing Cost (₹) *
              </label>
              <input
                type="number"
                id="borrowingCost"
                name="borrowingCost"
                min="0"
                value={formData.borrowingCost}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="securityDeposit" className="block text-xs font-semibold text-slate-700">
                Security Deposit (₹) *
              </label>
              <input
                type="number"
                id="securityDeposit"
                name="securityDeposit"
                min="0"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="e.g. 300"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
            Security deposit is charged separately upon acceptance and refunded after return & inspection. Platform fee (8%) is calculated and added when paying borrowing cost.
          </p>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
              Description & Terms
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe condition, what's included (cables, manuals), and duration rules..."
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => navigate('/browse')}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
