import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { request } from "../api/client";

export default function Browse() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    q: '',
    categoryId: '',
    condition: '',
    maxDistanceM: '',
    minOwnerRating: '',
    price: '',
    sort: 'recent'
  });

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.q) queryParams.append('q', filters.q);
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.condition) queryParams.append('condition', filters.condition);
        if (filters.maxDistanceM) queryParams.append('maxDistanceM', filters.maxDistanceM);
        if (filters.minOwnerRating) queryParams.append('minOwnerRating', filters.minOwnerRating);
        if (filters.price) queryParams.append('price', filters.price);
        if (filters.sort) queryParams.append('sort', filters.sort);
        
        const data = await request('GET', '/posts', { query: Object.fromEntries(queryParams) });
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const [needQuery, setNeedQuery] = useState('');
  const [needResults, setNeedResults] = useState(null);
  
  const handleNeedSearch = async () => {
    if (!needQuery) return;
    try {
      const res = await request('POST', '/discover/need', { body: { query: needQuery }});
      setNeedResults(res);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-orange-50 dark:bg-slate-800 p-6 rounded-xl border border-orange-200 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-2">AI Need Discovery</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Describe what you are trying to do, and our engine will find what you need.</p>
        <div className="flex gap-2">
           <input value={needQuery} onChange={e=>setNeedQuery(e.target.value)} placeholder="e.g. I want to start a podcast..." className="flex-1 border p-3 rounded dark:bg-slate-700 dark:border-slate-600" />
           <button onClick={handleNeedSearch} className="bg-orange-600 text-white px-6 py-2 rounded font-bold hover:bg-orange-700">Discover</button>
        </div>
        {needResults && (
           <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded border">
             <h3 className="font-bold">Interpreted Needs:</h3>
             <pre className="text-xs text-slate-500 overflow-auto">{JSON.stringify(needResults, null, 2)}</pre>
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm border flex flex-wrap gap-4 items-center">
        <input name="q" placeholder="Search..." value={filters.q} onChange={handleChange} className="border p-2 rounded flex-1 min-w-[200px] dark:bg-slate-700 dark:border-slate-600" />
        <select name="categoryId" value={filters.categoryId} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600">
          <option value="">All Categories</option>
          <option value="1">Filming Equipment</option>
        </select>
        <select name="condition" value={filters.condition} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600">
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
        </select>
        <input type="number" name="maxDistanceM" placeholder="Max Dist (m)" value={filters.maxDistanceM} onChange={handleChange} className="border p-2 rounded w-32 dark:bg-slate-700 dark:border-slate-600" />
        <select name="sort" value={filters.sort} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600">
          <option value="recent">Recent</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="distance">Distance</option>
          <option value="trust">Owner Trust</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading listings...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded shadow-sm border">
          No items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
