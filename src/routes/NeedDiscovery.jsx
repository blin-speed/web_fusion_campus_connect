import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { request } from '../api/client';
import ListingCard from '../components/ListingCard';
import Button from '../components/ui/Button';

export default function NeedDiscovery() {
  const [searchParams] = useSearchParams();
  const textQuery = searchParams.get('text') || '';
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function fetchNeed() {
      if (!textQuery) return;
      setLoading(true);
      try {
        const res = await request('POST', '/discover/need', { body: { query: textQuery }});
        // Fake parsing for demo if the backend returns raw json or something different
        // We'll assume it returns { interpretedNeeds: [...], recommendedPosts: [...] }
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNeed();
  }, [textQuery]);

  if (!textQuery) {
    return <div className="p-12 text-center text-slate-500">No need specified.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="bg-orange-50 dark:bg-slate-800 p-8 rounded-2xl border border-orange-200 dark:border-slate-700">
        <h1 className="text-3xl font-extrabold text-orange-900 dark:text-orange-100 mb-2">Need Discovery</h1>
        <p className="text-orange-800 dark:text-orange-200 text-lg">"{textQuery}"</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">AI is analyzing your need...</div>
      ) : results ? (
        <div className="space-y-8">
          
          <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Interpreted Needs</h2>
            <div className="flex flex-wrap gap-2">
              {results.interpretedNeeds?.map((need, idx) => (
                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700">
                  {need}
                </span>
              )) || <span className="text-slate-500 text-sm">Analyzed intent and parameters based on your query.</span>}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recommended Items</h2>
              <Button className="text-sm px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Compare Selected
              </Button>
            </div>
            
            {results.recommendedPosts?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.recommendedPosts.map(post => (
                  <ListingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-slate-500">No matching items found for this need in your area.</p>
                <Link to="/create">
                  <Button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg">Create a Request Board Post</Button>
                </Link>
              </div>
            )}
          </section>
          
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">Could not parse results.</div>
      )}
    </div>
  );
}
