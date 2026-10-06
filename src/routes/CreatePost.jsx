import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUploaderV2 from '../components/domain/PhotoUploaderV2';
import { request } from '../api/client';
import Button from '../components/ui/Button';

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '1',
    itemName: '',
    itemCondition: 'new',
    accessories: '',
    rate: '',
    rateUnit: 'day',
    securityDeposit: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        rate: parseFloat(formData.rate) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0
      };
      
      const newPost = await request('POST', '/posts', { body: payload });
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      alert("Failed to create listing: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Create New Listing</h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">
        
        {/* Photo Upload Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Photos</h2>
          <PhotoUploaderV2 />
        </section>

        {/* Basic Details Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-2">Basic Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Sony A7III Camera Body" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
              <input required type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500">
                <option value="1">Filming Equipment</option>
                <option value="2">Textbooks</option>
                <option value="3">Electronics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
              <select name="itemCondition" value={formData.itemCondition} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500">
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accessories (Optional)</label>
              <input type="text" name="accessories" value={formData.accessories} onChange={handleChange} placeholder="e.g. Charger, case, strap" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500"></textarea>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-2">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate (₹)</label>
              <input required type="number" min="0" step="0.01" name="rate" value={formData.rate} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate Unit</label>
              <select name="rateUnit" value={formData.rateUnit} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500">
                <option value="hour">per Hour</option>
                <option value="day">per Day</option>
                <option value="week">per Week</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Security Deposit (₹)</label>
              <input required type="number" min="0" step="0.01" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end gap-4">
          <Button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</Button>
          <Button type="submit" disabled={loading} className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
