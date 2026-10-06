import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { request } from '../api/client';
import { Skeleton } from '../components/ui/States';

export default function Home() {
  const { isGuest, user } = useCurrentUser();
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }

    const fetchActions = async () => {
      try {
        const [, myOwnerExchanges, myBorrowerExchanges] = await Promise.all([
          request('GET', '/requests/mine').catch(() => []),
          request('GET', '/exchanges/mine?role=owner').catch(() => []),
          request('GET', '/exchanges/mine?role=borrower').catch(() => []),
        ]);

        const items = [];
        
        // Add pending requests for borrower (maybe they just want to see it, action is on owner though)
        // We'll show exchanges that need action
        (myOwnerExchanges || []).forEach(ex => {
          if (ex.status === 'pending_handover' || ex.status === 'paid') {
            items.push({ id: ex.id, text: `Ready for handover: ${ex.postTitle}`, link: `/exchange/${ex.id}` });
          } else if (ex.status === 'returned' || ex.status === 'pending_inspection') {
            items.push({ id: ex.id, text: `Item returned, needs inspection: ${ex.postTitle}`, link: `/exchange/${ex.id}` });
          }
        });

        (myBorrowerExchanges || []).forEach(ex => {
          if (ex.status === 'accepted' || ex.status === 'pending_payment') {
            items.push({ id: ex.id, text: `Request accepted, payment required: ${ex.postTitle}`, link: `/exchange/${ex.id}` });
          } else if (ex.status === 'handed_over' || ex.status === 'active') {
            items.push({ id: ex.id, text: `Item due for return: ${ex.postTitle}`, link: `/exchange/${ex.id}` });
          }
        });

        setActionItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [isGuest]);

  if (isGuest) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <section className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">Welcome to Campus Circular</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">Your peer-to-peer resource lending marketplace. Borrow what you need, lend what you don't.</p>
          <Link to="/browse">
            <Button className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-orange-700 shadow-md">Browse Items</Button>
          </Link>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-slate-800 mb-3">See Our Impact</h3>
            <p className="text-slate-600 mb-6">Discover how much money students are saving and how we are helping the environment.</p>
            <Link to="/impact" className="text-orange-600 font-bold hover:underline">View Impact Dashboard &rarr;</Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Community Board</h3>
            <p className="text-slate-600 mb-6">Need something specific? Post a request to the campus community.</p>
            <Link to="/board" className="text-orange-600 font-bold hover:underline">View Request Board &rarr;</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <section className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome back, {user?.name || 'Member'}!</h2>
          <p className="text-slate-600 mt-1">Here's what's happening today.</p>
        </div>
        <Link to={`/u/${user?.id || 'me'}`} className="hidden sm:block">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl border border-stone-200">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        </Link>
      </section>
      
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📥</span> Needs your action
          {actionItems.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{actionItems.length}</span>
          )}
        </h3>
        
        {loading ? (
          <div className="grid gap-3 animate-pulse">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : actionItems.length > 0 ? (
          <div className="grid gap-3">
            {actionItems.map((item, idx) => (
              <div key={idx} className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between">
                <p className="text-orange-800 font-medium">{item.text}</p>
                <Link to={item.link}>
                  <Button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">Take Action</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 p-8 rounded-xl text-center">
            <span className="text-4xl block mb-3">🎉</span>
            <p className="text-slate-600 font-medium">You're all caught up! No pending requests or returns at the moment.</p>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Explore Campus</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-800 mb-2">Near you</h4>
            <p className="text-sm text-slate-500 mb-4 h-10">Discover items close to your location.</p>
            <Link to="/browse">
              <button className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Browse Items</button>
            </Link>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-800 mb-2">Community Needs</h4>
            <p className="text-sm text-slate-500 mb-4 h-10">See what your peers are looking for.</p>
            <Link to="/board">
              <button className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">View Board</button>
            </Link>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-800 mb-2">Our Impact</h4>
            <p className="text-sm text-slate-500 mb-4 h-10">Track the sustainability of our network.</p>
            <Link to="/impact">
              <button className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">View Stats</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
