import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onSearch, placeholder, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  // Live search: fire on every keystroke
  useEffect(() => {
    if (onSearch) onSearch(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().toLowerCase().startsWith('need ')) {
      navigate(`/need?text=${encodeURIComponent(query.trim())}`);
    } else {
      if (onSearch) onSearch(query);
      navigate(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center group">
      <span className="absolute left-3 text-slate-400 group-focus-within:text-orange-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search items or type "need ..."'}
        className="w-full rounded-full border border-slate-300 bg-white/50 backdrop-blur-sm pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}
