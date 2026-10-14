import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUploader from '../components/PhotoUploader';
import { request } from '../api/client';

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [photoIds, setPhotoIds] = useState([]);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    itemName: '',
    itemCondition: 'good',
    accessories: '',
    rate: '',
    rateUnit: 'DAY',
    securityDeposit: '',
    pickupLocationId: '',
  });

  useEffect(() => {
    Promise.all([
      request('GET', '/categories').catch(() => []),
      request('GET', '/locations').catch(() => []),
    ]).then(([cats, locs]) => {
      const validCats = Array.isArray(cats) ? cats : [];
      const validLocs = Array.isArray(locs) ? locs : [];
      setCategories(validCats);
      setLocations(validLocs);

      setFormData((prev) => ({
        ...prev,
        categoryId: validCats.length > 0 ? String(validCats[0].id) : '',
        pickupLocationId: validLocs.length > 0 ? String(validLocs[0].id) : '',
      }));

      if (validCats.length === 0) setUseCustomCategory(true);
      if (validLocs.length === 0) setUseCustomLocation(true);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        itemName: formData.itemName.trim(),
        itemCondition: formData.itemCondition,
        accessories: formData.accessories.trim(),
        rate: parseFloat(formData.rate) || 0,
        rateUnit: formData.rateUnit.toUpperCase(),
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        photoIds: photoIds.length > 0 ? photoIds : undefined,
      };

      if (useCustomCategory || !formData.categoryId) {
        if (!customCategory.trim()) {
          setErrorMsg('Please specify a category name.');
          setLoading(false);
          return;
        }
        payload.categoryName = customCategory.trim();
      } else {
        payload.categoryId = parseInt(formData.categoryId, 10);
      }

      if (useCustomLocation || !formData.pickupLocationId) {
        if (!customLocation.trim()) {
          setErrorMsg('Please specify a pickup location.');
          setLoading(false);
          return;
        }
        payload.locationName = customLocation.trim();
      } else {
        payload.pickupLocationId = parseInt(formData.pickupLocationId, 10);
      }

      const newPost = await request('POST', '/posts', { body: payload });
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create listing.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Resource Registration • Peer Hardware
          </span>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-300 dark:border-orange-800">
            INR (₹) Escrow
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
          List Hardware Resource
        </h1>
        <p className="text-xs text-neutral-500 font-sans">
          Register lab hardware, test gear, calculators, or development boards for peer borrowing on campus.
        </p>
      </div>

      {errorMsg && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-600 dark:text-red-400 font-medium">
          Error: {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 text-xs">
        {/* PHOTOS SECTION */}
        <div>
          <div className="font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            01. Hardware Photography
          </div>
          <PhotoUploader onUpload={setPhotoIds} maxPhotos={4} />
        </div>

        {/* BASIC DETAILS */}
        <div className="space-y-4">
          <div className="font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            02. Specifications & Category
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Listing Title *
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Item / Model Name *
              </label>
              <input
                required
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Rigol DS1054Z"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Category Classification *
                </label>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustomCategory(!useCustomCategory)}
                    className="text-xs font-semibold text-orange-600 hover:underline"
                  >
                    {useCustomCategory ? 'Select Existing' : '+ New Category'}
                  </button>
                )}
              </div>
              {useCustomCategory || categories.length === 0 ? (
                <input
                  required
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Electronics, Optics, Tools..."
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
                />
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Physical Condition *
              </label>
              <select
                name="itemCondition"
                value={formData.itemCondition}
                onChange={handleChange}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              >
                <option value="new">New / Mint Condition</option>
                <option value="like_new">Like New (Bench Tested)</option>
                <option value="good">Good (Normal Wear)</option>
                <option value="fair">Fair (Fully Functional)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Included Accessories
              </label>
              <input
                type="text"
                name="accessories"
                value={formData.accessories}
                onChange={handleChange}
                placeholder="e.g. 4x 100MHz probes, power cord, calibration cert"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Pickup & Return Location *
              </label>
              {locations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseCustomLocation(!useCustomLocation)}
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  {useCustomLocation ? 'Select Existing' : '+ New Location'}
                </button>
              )}
            </div>
            {useCustomLocation || locations.length === 0 ? (
              <input
                required
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Central Library 2nd Floor, Electronics Lab..."
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            ) : (
              <select
                name="pickupLocationId"
                value={formData.pickupLocationId}
                onChange={handleChange}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Technical Description & Usage Restrictions
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail specs, probe ratings, calibration notes, and any lab rules for this item."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* PRICING & ESCROW */}
        <div className="space-y-4">
          <div className="font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            03. Pricing & Security Escrow (₹)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Lending Rate (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="e.g. 60"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Billing Unit *
              </label>
              <select
                name="rateUnit"
                value={formData.rateUnit}
                onChange={handleChange}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              >
                <option value="HOUR">Per Hour</option>
                <option value="DAY">Per Day</option>
                <option value="WEEK">Per Week</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Security Deposit (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="pt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold uppercase tracking-wider px-8 py-2.5 text-xs disabled:opacity-50 transition-colors"
          >
            {loading ? 'Registering...' : 'Register & List Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}
