import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onSearch, placeholder, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  // Live search: fire on every keystroke if handler provided
  useEffect(() => {
    if (onSearch) onSearch(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <span className="absolute left-3 text-neutral-400 text-xs font-semibold pointer-events-none">
        &gt;
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search inventory by keyword or model...'}
        className="w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 pl-8 pr-16 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-orange-600 focus:outline-none transition-colors"
      />
      {query ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 px-2 py-0.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          aria-label="Clear search"
        >
          Clear
        </button>
      ) : (
        <span className="absolute right-3 text-[11px] text-neutral-400 pointer-events-none hidden sm:inline">
          Enter ↵
        </span>
      )}
    </form>
  );
}
