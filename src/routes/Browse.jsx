import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, NavLink } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { PostDetailView } from './PostDetail';
import { getAvailablePosts } from '../logic/stateMachine';
import { searchPosts } from '../logic/search';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useSearchContext } from '../App';
import channelsData from '../db/channels.json';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, isGuest } = useCurrentUser();
  const { query: topbarQuery } = useSearchContext();

  const [allPosts, setAllPosts] = useState([]);
  const [activeChannel, setActiveChannel] = useState('all');
  const [localQuery, setLocalQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  // Selected post id from URL search query (?post=post-id)
  const selectedPostId = searchParams.get('post');

  const channelKeys = Object.keys(channelsData);

  // Use topbar search query if set, otherwise local
  const effectiveQuery = topbarQuery.trim() || localQuery.trim();

  useEffect(() => {
    async function load() {
      const posts = await getAvailablePosts();
      setAllPosts(posts);
    }
    load();
  }, [refreshTick]);

  // Listen for new posts being created via FAB modal
  useEffect(() => {
    const handler = () => setRefreshTick((t) => t + 1);
    window.addEventListener('postCreated', handler);
    return () => window.removeEventListener('postCreated', handler);
  }, []);

  // When topbar search changes, go back to feed (deselect post)
  useEffect(() => {
    if (topbarQuery.trim() && selectedPostId) {
      handleBackToFeed();
    }
  }, [topbarQuery]);

  // Filter posts: Permanently filter to post.status === "available" only
  const filteredPosts = useMemo(() => {
    // The database query already restricts the public feed to available listings.
    let list = allPosts;

    // 2. Filter by channel
    if (activeChannel !== 'all') {
      list = list.filter((p) => p.channel === activeChannel);
    }

    // 3. Filter by search query
    if (effectiveQuery) {
      list = searchPosts(effectiveQuery, list);
    }

    return list;
  }, [allPosts, activeChannel, effectiveQuery]);

  const handleSelectPost = (postId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('post', postId);
      return next;
    });
  };

  const handleBackToFeed = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('post');
      return next;
    });
  };

  const handleChannelClick = (channel) => {
    setActiveChannel(channel);
    if (selectedPostId) handleBackToFeed();
  };

  const handleClearFilter = () => {
    setActiveChannel('all');
    setLocalQuery('');
  };

  const navLinks = [
    { to: '/', label: 'Feed', icon: '🏠' },
    { to: '/impact', label: 'Impact Dashboard', icon: '🌱', ungated: true },
    { to: '/requests-board', label: 'Request Board', icon: '📣', ungated: true },
    { to: '/my-requests', label: 'My Requests', icon: '📦', gated: true },
    { to: '/my-lending', label: 'My Lending', icon: '🤝', gated: true },
    { to: '/profile', label: 'My Profile', icon: '👤', gated: true },
  ];

  const availableTotal = allPosts.filter((p) => p.status === 'available').length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-full lg:min-h-0 lg:grid-cols-12">
      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR: Channels & Quick Navigation            */}
      {/* ---------------------------------------------------- */}
      <aside className="lg:col-span-3 lg:min-h-0 lg:overflow-visible space-y-5">
        {/* Channel / Category Directory */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Campus Channels
            </h3>
            {(activeChannel !== 'all' || effectiveQuery) && (
              <button
                onClick={handleClearFilter}
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <ul className="space-y-1 text-xs">
            <li>
              <button
                type="button"
                onClick={() => handleChannelClick('all')}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                  activeChannel === 'all'
                    ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>🌐 All Channels</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {availableTotal}
                </span>
              </button>
            </li>

            {channelKeys.map((channel) => {
              const isSelected = activeChannel === channel;
              const count = allPosts.filter((p) => p.channel === channel && p.status === 'available').length;

              return (
                <li key={channel}>
                  <button
                    type="button"
                    onClick={() => handleChannelClick(channel)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                      isSelected
                        ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                        : 'text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">#{channel}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Navigation Links */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-heading">
            Navigation
          </h3>
          <ul className="space-y-0.5 text-sm">
            {navLinks.map((item) => {
              if (item.gated && isGuest) {
                return (
                  <li key={item.to}>
                    <span className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 cursor-not-allowed select-none text-xs">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-[10px] bg-stone-100 rounded px-1.5 py-0.5 text-slate-400">Sign in</span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive && !selectedPostId
                          ? 'bg-orange-50 text-orange-700 font-bold'
                          : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* CENTER COLUMN: Swappable Feed / Detail Content       */}
      {/* ---------------------------------------------------- */}
      <section className="lg:col-span-6 lg:min-h-0 lg:overflow-y-auto lg:pr-2 space-y-4">
        {selectedPostId ? (
          <PostDetailView postId={selectedPostId} onBack={handleBackToFeed} />
        ) : (
          <div className="space-y-4">
            {/* Feed Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-800 font-heading">
                  {activeChannel === 'all' ? 'All Campus Resources' : `#${activeChannel}`}
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredPosts.length} resource{filteredPosts.length !== 1 ? 's' : ''} available to borrow right now
                  {effectiveQuery && (
                    <> matching <strong>"{effectiveQuery}"</strong></>
                  )}
                </p>
              </div>

              {effectiveQuery && (
                <button
                  onClick={handleClearFilter}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold border border-stone-200 rounded-lg px-2.5 py-1 hover:bg-stone-50"
                >
                  ✕ Clear search
                </button>
              )}
            </div>

            {/* Post Feed */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onSelectPost={handleSelectPost} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-slate-500 space-y-2">
                <p className="text-3xl">🌿</p>
                <p className="font-semibold text-slate-700">Everything in this channel is currently in use!</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When peer borrowers return items and owners inspect them, they’ll pop right back up here automatically.
                </p>
                <button
                  onClick={handleClearFilter}
                  className="mt-2 inline-block rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                >
                  View All Available Items
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* RIGHT SIDEBAR: Persistent Info & Community Stats     */}
      {/* ---------------------------------------------------- */}
      <aside className="lg:col-span-3 lg:min-h-0 lg:overflow-visible space-y-5">
        {/* Active User Status Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
            Current Session
          </h3>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-black text-white shadow-sm flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate font-heading">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.department}</p>
                <p className="text-xs text-amber-600 font-semibold">★ {currentUser.trustScore == null ? 'N/A' : currentUser.trustScore.toFixed(1)} Trust Score</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-1">
              <span className="font-semibold text-slate-700">Guest</span> — browsing available listings.
              Click the avatar in the top-right to sign in or switch account.
            </div>
          )}
        </div>

        {/* Platform Guarantee */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-2 text-xs text-slate-600">
          <h4 className="font-bold text-slate-800 font-heading">Campus Circular Guarantee</h4>
          <p className="leading-relaxed">
            Borrow and lend safely. All exchanges feature refundable security deposits, mutual inspection, and verified member ratings.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-[11px] text-slate-500">
            <div className="bg-stone-50 rounded-lg p-1.5 text-center border border-stone-200/60">
              <span className="font-bold text-slate-800 block font-heading">5</span>
              Channels
            </div>
            <div className="bg-stone-50 rounded-lg p-1.5 text-center border border-stone-200/60">
              <span className="font-bold text-slate-800 block font-heading">8%</span>
              Platform Fee
            </div>
          </div>
        </div>

        {/* Impact Teaser Card */}
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 text-orange-700 font-bold font-heading">
            <span>🌱</span> Community Impact
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            See how our campus network is saving money and reusing resources together.
          </p>
          <Link
            to="/impact"
            className="block text-center rounded-lg bg-white border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700 shadow-sm hover:bg-orange-50 transition-colors"
          >
            View Impact Dashboard →
          </Link>
        </div>
      </aside>
    </div>
  );
}
