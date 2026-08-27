import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function CreateAccount() {
  const navigate = useNavigate();
  const { addNewUser } = useCurrentUser();
  const [formData, setFormData] = useState({ name: '', department: '', year: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.department.trim() || !formData.year.trim()) return;
    setSubmitting(true);
    try {
      await addNewUser(formData);
      navigate('/profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Create your campus account</h1>
        <p className="mt-1 text-sm text-slate-600">Set up a local demo account to lend, borrow, and rate resources.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="account-name" className="block text-xs font-semibold text-slate-700">Name *</label>
            <input id="account-name" required autoFocus value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="account-department" className="block text-xs font-semibold text-slate-700">Department *</label>
            <input id="account-department" required value={formData.department} onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value }))} placeholder="e.g. Computer Science" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="account-year" className="block text-xs font-semibold text-slate-700">Year *</label>
            <input id="account-year" required value={formData.year} onChange={(event) => setFormData((current) => ({ ...current, year: event.target.value }))} placeholder="e.g. 2nd Year" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
            <Link to="/browse" className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50">Cancel</Link>
            <button disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50">{submitting ? 'Creating...' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
