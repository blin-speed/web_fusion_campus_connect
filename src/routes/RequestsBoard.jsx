import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { request } from '../api/client';

const CHANNELS = [
  'Microcontrollers',
  'Lab Optics & Sensors',
  'Graphic Calculators',
  'Audio Equipment',
  'Mechanical Tools',
  'General Hardware',
];

export default function RequestsBoard() {
  const navigate = useNavigate();
  const { currentUser, isGuest, promptSignIn } = useCurrentUser();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channel: CHANNELS[0],
  });

  const loadRequests = useCallback(async () => {
    try {
      const allRequests = await request('GET', '/demand-requests');
      setRequests(Array.isArray(allRequests) ? allRequests : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openRequestForm = () => {
    if (isGuest) {
      promptSignIn('Sign in to broadcast a hardware request');
      return;
    }
    setShowForm(true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      await request('POST', '/demand-requests', { body: formData });
      setFormData({ title: '', description: '', channel: CHANNELS[0] });
      setShowForm(false);
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openRequests = requests.filter((req) => req.status !== 'fulfilled');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Campus Demand Board // Broadcasts
            </span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            Requests Board
          </h1>
          <p className="text-xs text-neutral-500">
            Need an item not currently listed in the inventory? Broadcast an open request to campus peers.
          </p>
        </div>
        <button
          type="button"
          onClick={openRequestForm}
          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors"
        >
          + Post Request
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={submitRequest}
          className="border border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 p-6 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-orange-200 dark:border-orange-800/40 pb-2">
            <span className="font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 text-[11px]">
              New Broadcast Specification
            </span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 uppercase font-semibold"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Request Title *
            </label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. TI-84 Plus CE Graphing Calculator for Math 201 exam Friday"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Hardware Classification *
            </label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Detailed Requirements & Time Window
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Include dates needed, specific accessories, or target course code."
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-orange-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold uppercase tracking-wider px-6 py-2.5 text-xs transition-colors"
            >
              {submitting ? 'Broadcasting...' : 'Broadcast to Campus'}
            </button>
          </div>
        </form>
      )}

      {/* FEED */}
      <div className="space-y-4">
        {openRequests.length === 0 ? (
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs space-y-2">
            <div className="text-neutral-400 uppercase tracking-wider font-semibold">No active community requests</div>
            <p className="text-neutral-500">
              There are no outstanding hardware requests broadcast right now.
            </p>
          </div>
        ) : (
          openRequests.map((req) => (
            <div
              key={req.id}
              className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider border border-neutral-200 dark:border-neutral-800 px-2 py-0.5">
                  {req.channel || 'General'}
                </span>
                <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px] border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5">
                  Open
                </span>
              </div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {req.title}
              </h2>
              {req.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {req.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
