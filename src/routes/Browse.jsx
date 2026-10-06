import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { request } from "../api/client";
import ListingCard from "../components/ListingCard";
import { ListingSkeleton, EmptyState } from "../components/ui/States";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const filters = {
    q: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    condition: searchParams.get('condition') || '',
    maxDistanceM: searchParams.get('maxDistanceM') || '',
    minOwnerRating: searchParams.get('minOwnerRating') || '',
    price: searchParams.get('price') || '',
    sort: searchParams.get('sort') || 'recent'
  };

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const filters = {
          q: searchParams.get('q') || '',
          categoryId: searchParams.get('categoryId') || '',
          condition: searchParams.get('condition') || '',
          maxDistanceM: searchParams.get('maxDistanceM') || '',
          minOwnerRating: searchParams.get('minOwnerRating') || '',
          price: searchParams.get('price') || '',
          sort: searchParams.get('sort') || 'recent'
        };
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v) queryParams.append(k, v);
        });
        
        const data = await request('GET', '/posts', { query: Object.fromEntries(queryParams) });
        setPosts(data);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-center">
        <input name="q" placeholder="Search items..." value={filters.q} onChange={handleChange} className="border p-2 rounded flex-1 min-w-[200px] dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
        <select name="categoryId" value={filters.categoryId} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-orange-500">
          <option value="">All Categories</option>
          <option value="1">Filming Equipment</option>
        </select>
        <select name="condition" value={filters.condition} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-orange-500">
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
        </select>
        <input type="number" name="maxDistanceM" placeholder="Max Dist (m)" value={filters.maxDistanceM} onChange={handleChange} className="border p-2 rounded w-32 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-orange-500" />
        <select name="sort" value={filters.sort} onChange={handleChange} className="border p-2 rounded dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-orange-500">
          <option value="recent">Recent</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="distance">Distance</option>
          <option value="trust">Owner Trust</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ListingSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState title="No items found" message="Try adjusting your filters or search query." icon="🔍" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <ListingCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
