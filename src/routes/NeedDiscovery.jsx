import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { request } from '../api/client';
import ListingCard from '../components/ListingCard';

export default function NeedDiscovery() {
  const [searchParams] = useSearchParams();
  const textQuery = searchParams.get('text') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [newQuery, setNewQuery] = useState(textQuery);

  useEffect(() => {
    async function fetchNeed() {
      if (!textQuery) return;
      setLoading(true);
      try {
        const res = await request('POST', '/discover/need', { body: { query: textQuery } });
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNeed();
  }, [textQuery]);

  const handleRefine = (e) => {
    e.preventDefault();
    if (newQuery.trim()) {
      navigate(`/need?text=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER & SEARCH QUERY */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Natural Language Need Discovery // Engine
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-300 dark:border-orange-800">
            Semantic Matching
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
          Need Discovery
        </h1>
        <form onSubmit={handleRefine} className="flex gap-2 mt-4">
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder='Type what you need (e.g. "need a multimeter for lab today")...'
            className="flex-1 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Analyze Need
          </button>
        </form>
      </div>

      {!textQuery ? (
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
          Enter a need in the search bar above to discover matching hardware
        </div>
      ) : loading ? (
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
          Analyzing semantic need & scanning campus inventory...
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* INTERPRETED ATTRIBUTES */}
          <section className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-xs">
            <div className="font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3 text-[11px]">
              Interpreted Intent & Hardware Parameters
            </div>
            <div className="flex flex-wrap gap-2">
              {results.interpretedNeeds?.map((need, idx) => (
                <span
                  key={idx}
                  className="border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 px-3 py-1 font-semibold uppercase text-[10px]"
                >
                  {need}
                </span>
              )) || (
                <span className="text-neutral-500 text-xs">
                  Hardware parameters extracted from prompt.
                </span>
              )}
            </div>
          </section>

          {/* RECOMMENDED ITEMS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800 pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Recommended Matches ({results.recommendedPosts?.length || 0})
              </h2>
              <Link
                to="/browse"
                className="text-xs text-orange-600 hover:underline uppercase font-semibold tracking-wide"
              >
                View Full Inventory →
              </Link>
            </div>

            {results.recommendedPosts?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.recommendedPosts.map((post) => (
                  <ListingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs space-y-3">
                <div className="text-neutral-400 uppercase tracking-wider font-semibold">No direct inventory matches found</div>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  No peer is currently listing this exact equipment. Browse available listings or check back soon.
                </p>
                <div>
                  <Link
                    to="/browse"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold uppercase tracking-wider px-5 py-2 transition-colors text-xs"
                  >
                    Browse Available Inventory
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
          Could not query discovery engine
        </div>
      )}
    </div>
  );
}
