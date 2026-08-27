import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function UserSwitcher() {
  const {
    currentUser,
    isGuest,
    users,
    login,
    logoutToGuest,
    authPromptOpen,
    setAuthPromptOpen,
    authPromptMessage,
  } = useCurrentUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userId) => {
    login(userId);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logoutToGuest();
    setDropdownOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button (Google Account Style Avatar) */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-1 pr-3 text-xs font-semibold text-slate-700 shadow-sm hover:border-orange-300 hover:bg-stone-50 focus:outline-none transition-all"
        aria-expanded={dropdownOpen}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 font-bold text-white shadow-sm font-heading">
          {currentUser ? currentUser.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <span className="hidden sm:inline font-medium text-slate-800">
          {currentUser ? currentUser.name : 'Guest'}
        </span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-stone-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          {/* Header Card */}
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200/80 mb-2">
            {currentUser ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 font-heading">{currentUser.name}</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentUser.department} • {currentUser.year}</p>
                <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
                  <span className="text-amber-600 font-semibold">★ {currentUser.trustScore}</span>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="font-bold text-orange-600 hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs font-bold text-slate-800 font-heading">Browsing as Guest</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select an account below to request, list, or rate items.
                </p>
              </div>
            )}
          </div>

          {/* 5 Seed Users List */}
          <div className="space-y-1 my-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block font-heading">
              Select User Account
            </span>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {users.map((user) => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-orange-50 text-orange-800 font-bold border border-orange-200'
                        : 'text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-slate-700 font-heading">
                        {user.name.charAt(0)}
                      </div>
                      <span className="truncate">{user.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      ★ {user.trustScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Return to Guest Option */}
          {!isGuest && (
            <div className="border-t border-stone-100 pt-2 mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-stone-50 text-left"
              >
                <span>🚪</span> Continue as Guest
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Sign-In Prompt Modal when Guest attempts action */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Sign in to Continue</h3>
              <button
                onClick={() => setAuthPromptOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {authPromptMessage}. Please select a user account to proceed:
            </p>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.id)}
                  className="w-full flex items-center justify-between rounded-lg border border-stone-200 p-2.5 text-xs text-left hover:border-orange-400 hover:bg-orange-50/50 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 font-bold text-white font-heading">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block font-heading">{u.name}</span>
                      <span className="text-[11px] text-slate-500">{u.department}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600">★ {u.trustScore}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAuthPromptOpen(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-stone-50"
              >
                Continue Browsing as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
