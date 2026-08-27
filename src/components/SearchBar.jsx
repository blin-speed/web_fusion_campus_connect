import React, { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  // Live search: fire on every keystroke
  useEffect(() => {
    if (onSearch) onSearch(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <span className="absolute left-3 text-gray-400 text-sm select-none">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search items, textbooks, equipment...'}
        className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-base font-bold leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </form>
  );
}
