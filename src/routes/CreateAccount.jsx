import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function CreateAccount() {
  const navigate = useNavigate();
  const { addNewUser } = useCurrentUser();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    department: '',
    year: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.username.trim() || !formData.department.trim() || !formData.year.trim()) {
      setError('ALL REQUIRED FIELDS MUST BE COMPLETED.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addNewUser(formData);
      navigate('/profile');
    } catch (err) {
      setError(err?.message || 'REGISTRATION FAILED. TRY ANOTHER USERNAME.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg my-8">
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
            IDENTITY REGISTRATION // SYSTEM
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-300 dark:border-orange-800">
            CAMPUS MEMBER
          </span>
        </div>

        <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
          CREATE CAMPUS ACCOUNT
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          Register your campus identity to borrow, lend, and verify hardware and lab equipment in INR (₹).
        </p>

        {error && (
          <div className="mb-6 border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-mono text-red-600 dark:text-red-400">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-username" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              USERNAME / FULL NAME *
            </label>
            <input
              id="reg-username"
              required
              autoFocus
              value={formData.username}
              onChange={(e) => setFormData((cur) => ({ ...cur, username: e.target.value }))}
              placeholder="e.g. Priya Sharma"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              PASSWORD *
            </label>
            <input
              id="reg-password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((cur) => ({ ...cur, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-department" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                DEPARTMENT *
              </label>
              <input
                id="reg-department"
                required
                value={formData.department}
                onChange={(e) => setFormData((cur) => ({ ...cur, department: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:border-orange-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="reg-year" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                ACADEMIC YEAR *
              </label>
              <select
                id="reg-year"
                required
                value={formData.year || '1'}
                onChange={(e) => setFormData((cur) => ({ ...cur, year: e.target.value }))}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:border-orange-600 focus:outline-none"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reg-bio" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              BIO / LAB AFFILIATION
            </label>
            <textarea
              id="reg-bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((cur) => ({ ...cur, bio: e.target.value }))}
              placeholder="e.g. Embedded systems student, working on IoT robotics."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:border-orange-600 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-6">
            <Link
              to="/browse"
              className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              [CANCEL]
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors"
            >
              {submitting ? 'CREATING...' : '[CREATE ACCOUNT]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
