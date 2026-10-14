import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { request } from '../api/client';
import ListingCard from '../components/ListingCard';
import { ListingSkeleton, EmptyState } from '../components/ui/States';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('GET', '/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filters = {
    q: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    condition: searchParams.get('condition') || '',
    maxDistanceM: searchParams.get('maxDistanceM') || '',
    minOwnerRating: searchParams.get('minOwnerRating') || '',
    price: searchParams.get('price') || '',
    sort: searchParams.get('sort') || 'recent',
  };

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v) queryParams.append(k, v);
        });

        const data = await request('GET', '/posts', { query: Object.fromEntries(queryParams) });
        const list = Array.isArray(data) ? data : (data?.content || []);
        setPosts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* FILTER BAR */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-xs space-y-3">
        {filters.q && (
          <div className="flex items-center justify-between border border-orange-600 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-orange-600 dark:text-orange-400">Search Query:</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold">"{filters.q}"</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="text-orange-600 font-semibold hover:underline text-xs"
            >
              Clear
            </button>
          </div>
        )}
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Inventory Filters
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleChange}
            className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="condition"
            value={filters.condition}
            onChange={handleChange}
            className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
          >
            <option value="">Any Condition</option>
            <option value="new">New / Mint</option>
            <option value="like_new">Like New</option>
            <option value="good">Good Condition</option>
            <option value="fair">Fair / Functional</option>
          </select>
          <input
            type="number"
            name="maxDistanceM"
            placeholder="Max Radius (m)"
            value={filters.maxDistanceM}
            onChange={handleChange}
            className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 w-32 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
          />
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="price_asc">Sort: Price (Low to High)</option>
            <option value="distance">Sort: Nearest Distance</option>
            <option value="trust">Sort: Owner Trust Rating</option>
          </select>
          <button
            type="button"
            onClick={handleReset}
            className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* LISTING GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No Hardware Listings Found"
          message="No items match your active filters. Try broadening your criteria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <ListingCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
