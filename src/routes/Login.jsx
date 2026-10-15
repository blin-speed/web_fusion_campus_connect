import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCurrentUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
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
          Campus Resource Registry
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Member Authentication
          </span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            Sign In
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
              htmlFor="login-username"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
            >
              Username / Handle *
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your registered username"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
            >
              Password *
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Need an account?</span>
            <Link
              to="/signup"
              className="font-semibold text-orange-600 hover:underline"
            >
              Sign Up
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
