import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';
import { createPost } from '../logic/stateMachine';
import PhotoUploader from './PhotoUploader';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { isGuest, promptSignIn } = useCurrentUser();
  const [channels, setChannels] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    itemName: '',
    locationId: '',
    description: '',
    itemCondition: 'good',
    accessories: '',
    borrowingConditions: '',
    rateUnit: 'DAY',
    rate: '',
    minCharge: '0',
    securityDeposit: '',
    lateFeePerUnit: '',
    photoIds: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real app we'd fetch categories and locations from backend here
    // For demo speed, hardcode basic ones if needed or fetch
  }, []);

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

    setIsSubmitting(true);
    try {
      await createPost({
        title: formData.title.trim(),
        categoryId: 1, // hardcoded for demo bypass
        itemName: formData.itemName.trim(),
        locationId: 1, // hardcoded for demo bypass
        description: formData.description.trim(),
        itemCondition: formData.itemCondition,
        accessories: JSON.stringify(formData.accessories.split(',').map(s=>s.trim())),
        borrowingConditions: formData.borrowingConditions.trim(),
        rateUnit: formData.rateUnit,
        rate: Number(formData.rate || 0),
        minCharge: Number(formData.minCharge || 0),
        securityDeposit: Number(formData.securityDeposit || 0),
        lateFeePerUnit: Number(formData.lateFeePerUnit || formData.rate || 0),
        photoIds: formData.photoIds
      });

      setFormData({ title: '', categoryId: '', itemName: '', locationId: '', description: '', itemCondition: 'good', accessories: '', borrowingConditions: '', rateUnit: 'DAY', rate: '', minCharge: '0', securityDeposit: '', lateFeePerUnit: '', photoIds: [] });
      onPostCreated();
      onClose();
    } catch (err) {
      alert('Error creating post: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Create New Listing</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">~U</button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <form id="createPostForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input type="text" name="itemName" required value={formData.itemName} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photos</label>
              <PhotoUploader purpose="LISTING" onUpload={(ids) => setFormData(p => ({...p, photoIds: ids}))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select name="itemCondition" value={formData.itemCondition} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600">
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Accessories (comma separated)</label>
              <input type="text" name="accessories" value={formData.accessories} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Rate (~B1)</label>
                <input type="number" name="rate" required min="0" value={formData.rate} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Rate Unit</label>
                <select name="rateUnit" value={formData.rateUnit} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600">
                  <option value="DAY">Per Day</option>
                  <option value="HOUR">Per Hour</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Security Deposit (~B1)</label>
                <input type="number" name="securityDeposit" required min="0" value={formData.securityDeposit} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Late Fee / Unit (~B1)</label>
                <input type="number" name="lateFeePerUnit" value={formData.lateFeePerUnit} onChange={handleChange} placeholder="Default = Rate" className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full border rounded p-2 dark:bg-slate-700 dark:border-slate-600"></textarea>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border rounded hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
          <button type="submit" form="createPostForm" disabled={isSubmitting} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
            {isSubmitting ? 'Posting...' : 'Post Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
