import React, { useState } from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';
import channelsData from '../db/channels.json';
import { createPost } from '../logic/stateMachine';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { currentUserId, isGuest, promptSignIn } = useCurrentUser();
  const channelKeys = Object.keys(channelsData);

  const [formData, setFormData] = useState({
    title: '',
    channel: channelKeys[0] || 'Filming Equipment',
    itemName: '',
    location: '',
    description: '',
    borrowingCost: '',
    securityDeposit: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      promptSignIn('Sign in to list an item');
      return;
    }

    if (!formData.title.trim() || !formData.itemName.trim() || !formData.location.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        ownerId: currentUserId,
        title: formData.title.trim(),
        channel: formData.channel,
        itemName: formData.itemName.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        borrowingCost: Number(formData.borrowingCost || 0),
        securityDeposit: Number(formData.securityDeposit || 0),
      });

      setFormData({
        title: '',
        channel: channelKeys[0] || 'Filming Equipment',
        itemName: '',
        location: '',
        description: '',
        borrowingCost: '',
        securityDeposit: '',
      });

      setIsSubmitting(false);
      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">List an Item for Lending</h2>
            <p className="text-xs text-slate-500">Share your gear or textbooks with verified campus members.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-base"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="modal-title" className="block text-xs font-semibold text-slate-700">
              Post Title *
            </label>
            <input
              type="text"
              id="modal-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sony Alpha A6400 Camera Kit"
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="modal-channel" className="block text-xs font-semibold text-slate-700">
                Channel / Category *
              </label>
              <select
                id="modal-channel"
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {channelKeys.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-itemName" className="block text-xs font-semibold text-slate-700">
                Item Keyword *
              </label>
              <input
                type="text"
                id="modal-itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. camera, calculator, drafter"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-location" className="block text-xs font-semibold text-slate-700">
              Default Pickup Location *
            </label>
            <input
              type="text"
              id="modal-location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Hostel 3 Ground Floor or Central Library Lobby"
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="modal-borrowCost" className="block text-xs font-semibold text-slate-700">
                Borrowing Cost (₹) *
              </label>
              <input
                type="number"
                id="modal-borrowCost"
                name="borrowingCost"
                min="0"
                value={formData.borrowingCost}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-deposit" className="block text-xs font-semibold text-slate-700">
                Security Deposit (₹) *
              </label>
              <input
                type="number"
                id="modal-deposit"
                name="securityDeposit"
                min="0"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="e.g. 300"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
            Security deposit is charged separately upon acceptance. Platform fee (8%) is calculated and added when paying borrowing cost after item return.
          </p>

          <div>
            <label htmlFor="modal-desc" className="block text-xs font-semibold text-slate-700">
              Description & Terms
            </label>
            <textarea
              id="modal-desc"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe condition, accessories, duration..."
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
