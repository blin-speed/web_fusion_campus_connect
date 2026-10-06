import React from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Home() {
  const { isGuest, user } = useCurrentUser();

  if (isGuest) {
    return (
      <div className="space-y-6">
        <section className="text-center py-12 bg-white rounded-lg shadow-sm border border-stone-200">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Welcome to Campus Circular</h1>
          <p className="text-lg text-slate-600 mb-6">Your peer-to-peer resource lending marketplace.</p>
          <Link to="/browse">
            <Button className="bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-orange-700">Browse Items</Button>
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome back, {user?.name || 'Member'}!</h2>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Needs your action</h3>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
          <p className="text-orange-700">You have no pending requests or returns at the moment.</p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Near you</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            <p className="text-slate-500 mb-4">Discover items close to your location.</p>
            <Link to="/browse">
              <Button className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300">View All</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
