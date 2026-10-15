import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function Signup() {
  const navigate = useNavigate();
  const { addNewUser } = useCurrentUser();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    department: '',
    year: '1',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.username.trim() || !formData.password.trim() || !formData.department.trim() || !formData.year.trim()) {
      setError('All required fields must be completed.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addNewUser(formData);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try another username.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center items-center p-4 text-xs">
      {/* BRAND HEADER */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-block group">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Campus<span className="text-orange-600">Connect</span>
          </span>
        </Link>
        <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
          Campus Resource Exchange
        </p>
      </div>

      {/* SIGNUP CARD */}
      <div className="w-full max-w-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            New Member Enrollment
          </span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            Create Account
          </h1>
        </div>

        {error && (
          <div className="mb-4 border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="signup-username"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
            >
              Full Name / Username *
            </label>
            <input
              id="signup-username"
              type="text"
              required
              autoFocus
              value={formData.username}
              onChange={(e) => setFormData((cur) => ({ ...cur, username: e.target.value }))}
              placeholder="Enter your name / handle"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
            >
              Password *
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((cur) => ({ ...cur, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="signup-department"
                className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
              >
                Department *
              </label>
              <input
                id="signup-department"
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData((cur) => ({ ...cur, department: e.target.value }))}
                placeholder="e.g. CSE or Physics"
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="signup-year"
                className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
              >
                Academic Year *
              </label>
              <select
                id="signup-year"
                required
                value={formData.year || '1'}
                onChange={(e) => setFormData((cur) => ({ ...cur, year: e.target.value }))}
                className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
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
            <label
              htmlFor="signup-bio"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
            >
              Bio / Lab Affiliation
            </label>
            <textarea
              id="signup-bio"
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData((cur) => ({ ...cur, bio: e.target.value }))}
              placeholder="e.g. Robotics lab researcher, circuit prototyping."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Already have an account?</span>
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
          <div className="text-center">
            <Link
              to="/"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              ← Return to Browse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
