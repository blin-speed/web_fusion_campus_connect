import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';

export default function Home() {
  const { isGuest, currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [actionItems, setActionItems] = useState([]);
  const [telemetry, setTelemetry] = useState({ lendersCount: 0, savingsInr: 0, activeExchanges: 0 });
  const [categories, setCategories] = useState([]);

  // Filters & Sorting
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, max100
  const [sortTab, setSortTab] = useState('hot'); // hot, new, trust, price

  useEffect(() => {
    request('GET', '/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const channels = [
    { id: 'all', label: 'All Inventory', categoryId: null },
    ...categories.map((c) => ({
      id: String(c.id),
      label: c.name,
      categoryId: c.id,
      name: c.name,
    })),
  ];

  // Fetch telemetry & action items
  useEffect(() => {
    request('GET', '/impact')
      .then((data) => {
        if (data) {
          setTelemetry({
            lendersCount: data.activeMembersCount ?? data.activeLenders ?? 0,
            savingsInr: Math.round(Number(data.moneySaved ?? data.totalSavedInr ?? 0)),
            activeExchanges: data.resourcesReusedCount ?? data.successfulExchangesCount ?? 0,
          });
        }
      })
      .catch(() => {});

    if (!isGuest && currentUser?.id) {
      Promise.all([
        request('GET', '/requests/incoming').catch(() => []),
        request('GET', '/exchanges/mine?role=owner').catch(() => []),
        request('GET', '/exchanges/mine?role=borrower').catch(() => []),
      ]).then(([incomingRequests, myOwner, myBorrower]) => {
        const items = [];

        (incomingRequests || []).forEach((req) => {
          if (req.status === 'pending') {
            items.push({
              id: req.id,
              text: 'Incoming Request: ' + (req.borrower?.name || 'Peer') + ' requested "' + (req.post?.title || 'Resource') + '"',
              link: '/lending',
            });
          }
        });

        (myOwner || []).forEach((ex) => {
          if (ex.state === 'handover') {
            items.push({
              id: ex.id,
              text: 'Handover Ready: Confirm physical transfer for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          } else if (ex.state === 'returned') {
            items.push({
              id: ex.id,
              text: 'Inspection Required: Item returned by borrower for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          }
        });

        (myBorrower || []).forEach((ex) => {
          if (ex.state === 'payment_pending') {
            items.push({
              id: ex.id,
              text: 'Payment Required: Request accepted for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          } else if (ex.state === 'borrowed') {
            items.push({
              id: ex.id,
              text: 'Active Loan: Return item before deadline for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          } else if (ex.state === 'inspected') {
            items.push({
              id: ex.id,
              text: 'Damage Claim: Review owner inspection for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          } else if (ex.state === 'settled') {
            items.push({
              id: ex.id,
              text: 'Settled: Submit final rating for "' + (ex.post?.title || 'Item') + '"',
              link: '/exchange/' + ex.id,
            });
          }
        });

        setActionItems(items);
      });
    } else {
      setActionItems([]);
    }
  }, [isGuest, currentUser]);

  // Fetch Posts
  useEffect(() => {
    setLoadingPosts(true);
    let url = '/posts';
    const channelObj = channels.find((c) => c.id === selectedChannel);
    if (channelObj && channelObj.categoryId) {
      url += `?categoryId=${channelObj.categoryId}`;
    }

    request('GET', url)
      .then((res) => {
        const rawList = Array.isArray(res) ? res : (res?.content || []);
        setPosts(rawList);
      })
      .catch((err) => {
        console.error('Failed to load feed:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }, [selectedChannel]);

  // Filter & Sort Posts
  const filteredPosts = posts.filter((p) => {
    if (availabilityFilter === 'available') {
      return p.availability === 'available' || p.status === 'available';
    }
    if (availabilityFilter === 'max100') {
      const rate = p.rate || p.price || 0;
      return rate <= 100;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortTab === 'new') {
      return (b.id || 0) - (a.id || 0);
    }
    if (sortTab === 'price') {
      const rateA = a.rate != null ? a.rate : (a.price || 0);
      const rateB = b.rate != null ? b.rate : (b.price || 0);
      return rateA - rateB;
    }
    if (sortTab === 'trust') {
      const trustA = a.owner?.trustScore || a.owner?.trust?.score || 0;
      const trustB = b.owner?.trustScore || b.owner?.trust?.score || 0;
      return trustB - trustA;
    }
    return (b.id || 0) - (a.id || 0);
  });

  const handleActionClick = (path) => {
    if (isGuest) {
      navigate('/login', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ================= LEFT RAIL (COMMUNITIES & SHORTCUTS) ================= */}
      <aside className="lg:col-span-3 space-y-6">
        {/* COMMUNITIES SELECTOR */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Categories & Channels
          </div>
          <div className="space-y-1">
            {channels.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedChannel(c.id)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  selectedChannel === c.id
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* AVAILABILITY TOGGLES */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Filter Inventory
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setAvailabilityFilter('all')}
              className={`text-left px-3 py-1.5 border transition-colors ${
                availabilityFilter === 'all'
                  ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-600 font-semibold'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              All Inventory
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('available')}
              className={`text-left px-3 py-1.5 border transition-colors ${
                availabilityFilter === 'available'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-semibold'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              Available Now
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('max100')}
              className={`text-left px-3 py-1.5 border transition-colors ${
                availabilityFilter === 'max100'
                  ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-600 font-semibold'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              Max ₹100 / day
            </button>
          </div>
        </div>

        {/* NAVIGATION SHORTCUTS */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Quick Navigation
          </div>
          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => handleActionClick('/borrowing')}
              className="w-full text-left px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              My Borrowing
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('/lending')}
              className="w-full text-left px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Lending (My Inventory)
            </button>
            <Link
              to="/impact"
              className="block px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Campus Impact Metrics
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= CENTER COLUMN (CLEAN REDDIT-STYLE FEED) ================= */}
      <main className="lg:col-span-6 space-y-4">
        {/* ACTION REQUIRED ALERTS */}
        {actionItems.length > 0 && (
          <div className="space-y-2">
            {actionItems.map((item, idx) => (
              <div
                key={idx}
                className="border-2 border-red-600 bg-red-50 dark:bg-red-950/40 p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Action Required
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                    {item.text}
                  </span>
                </div>
                <Link
                  to={item.link}
                  className="bg-red-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 hover:bg-red-700 transition-colors flex-shrink-0"
                >
                  Resolve
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* SORT TABS */}
        <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800 pb-2">
          <div className="flex gap-1.5">
            {[
              { id: 'hot', label: 'Hot' },
              { id: 'new', label: 'New' },
              { id: 'trust', label: 'Top Trust' },
              { id: 'price', label: 'Low Price' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSortTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  sortTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {sortedPosts.length} resources listed
          </span>
        </div>

        {/* POSTS LIST */}
        {loadingPosts ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center text-xs text-neutral-500">
            Loading campus inventory...
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Empty Registry
            </div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No active listings found for the selected filter.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedChannel('all'); setAvailabilityFilter('all'); }}
              className="text-xs font-semibold text-orange-600 hover:underline uppercase tracking-wide"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => {
              const rate = post.rate != null ? post.rate : (post.price || 0);
              const rateUnit = (post.rateUnit || 'day').toLowerCase();
              const deposit = post.securityDeposit != null ? post.securityDeposit : (post.deposit || 0);
              const ownerName = post.owner?.name || 'Campus Member';
              const ownerTrust = post.owner?.trustScore != null ? `${post.owner.trustScore}/5.0` : 'New Member';
              const categoryName = post.category?.name || 'Hardware';
              const locationName = post.location?.name || 'Campus';
              const isAvail = post.availability === 'available' || post.status === 'available';

              return (
                <div
                  key={post.id}
                  className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex transition-colors hover:border-neutral-400 dark:hover:border-neutral-700"
                >
                  {/* LEFT RATE TILE */}
                  <div className="w-24 bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center border-r border-neutral-300 dark:border-neutral-800 p-3 text-center flex-shrink-0">
                    <span className="text-lg font-light text-orange-600 dark:text-orange-500 tabular-nums">
                      ₹{rate}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      /{rateUnit}
                    </span>
                  </div>

                  {/* MAIN CONTENT AREA */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      {/* HEADER ROW */}
                      <div className="flex items-center flex-wrap gap-2 text-xs mb-1.5 text-neutral-500">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {categoryName}
                        </span>
                        <span>•</span>
                        <span>{ownerName}</span>
                        <span className="text-neutral-400">({ownerTrust})</span>
                        <span>•</span>
                        <span className="border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[11px]">
                          {locationName}
                        </span>
                        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 border ${
                          isAvail
                            ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-neutral-400 text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                        }`}>
                          {isAvail ? 'Available' : 'Reserved'}
                        </span>
                      </div>

                      {/* TITLE */}
                      <Link
                        to={`/post/${post.id}`}
                        className="block text-base font-semibold text-neutral-900 dark:text-neutral-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-1"
                      >
                        {post.title}
                      </Link>

                      {/* DESCRIPTION */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2 font-sans">
                        {post.description || post.conditionSummary || 'No detailed specifications provided.'}
                      </p>

                      {/* ACCESSORY BADGES & DEPOSIT */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500">
                        <span className="border border-neutral-300 dark:border-neutral-800 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-950 tabular-nums">
                          Deposit: ₹{deposit}
                        </span>
                        {post.accessories && (
                          <span className="border border-neutral-300 dark:border-neutral-800 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-950 truncate max-w-xs">
                            Includes: {typeof post.accessories === 'string' ? post.accessories : JSON.stringify(post.accessories)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-3 text-xs">
                      <Link
                        to={`/post/${post.id}`}
                        className="font-semibold text-orange-600 hover:underline tracking-wide"
                      >
                        Borrow Resource
                      </Link>
                      <Link
                        to={`/post/${post.id}`}
                        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium"
                      >
                        View Details & Specifications
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ================= RIGHT RAIL (METRO TELEMETRY & ACTIONS) ================= */}
      <aside className="lg:col-span-3 space-y-6">
        {/* METRO TELEMETRY GRID */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Campus Telemetry
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Active Campus Lenders
              </div>
              <div className="text-2xl font-light tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
                {telemetry.lendersCount}
              </div>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Peer Savings Generated
              </div>
              <div className="text-2xl font-light tabular-nums text-emerald-600 dark:text-emerald-500 mt-1">
                ₹{telemetry.savingsInr.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Active Exchanges
              </div>
              <div className="text-2xl font-light tabular-nums text-orange-600 dark:text-orange-500 mt-1">
                {telemetry.activeExchanges}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Quick Actions
          </div>
          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => handleActionClick('/create')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 font-semibold uppercase tracking-wider transition-colors"
            >
              + Post Resource
            </button>
            <Link
              to="/browse"
              className="block w-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 py-2.5 text-center font-semibold uppercase tracking-wider transition-colors"
            >
              Explore Inventory
            </Link>
          </div>
        </div>

        {/* PROTOCOL WIDGET */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3">
            Lending Protocol Rules
          </div>
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-orange-600">01.</span>
              <span>100% Peer accountability with campus ID verification.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-orange-600">02.</span>
              <span>Inspect condition & checklist before handover confirmation.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-orange-600">03.</span>
              <span>Security deposit held in escrow until safe post-return inspection.</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
