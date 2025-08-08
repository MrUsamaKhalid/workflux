"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/utils/supabaseClient';

/**
 * Settings page allows users to update their profile details such as
 * display name, location and country. These values are stored in
 * Supabase user metadata. Additional settings (notifications, resume
 * preferences, etc.) could be added later.
 */
export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { user } = session;
      const meta = user.user_metadata || {};
      setDisplayName(meta.display_name || '');
      setLocation(meta.location || '');
      setCountry(meta.country || '');
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { user } = session;
    const updates = {
      data: {
        display_name: displayName,
        location,
        country,
      },
    };
    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Profile updated successfully');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <p>Loading…</p>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
      <div className="max-w-2xl bg-white/10 backdrop-blur p-6 rounded-2xl shadow border border-white/20">
        {message && <p className="text-sm mb-4 text-green-400">{message}</p>}
        <div className="flex flex-col gap-4">
          <label className="text-sm text-purple-200">Display Name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 backdrop-blur text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Your full name"
            />
          </label>
          <label className="text-sm text-purple-200">Location
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 backdrop-blur text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="City, State"
            />
          </label>
          <label className="text-sm text-purple-200">Country
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-white/20 backdrop-blur text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Country"
            />
          </label>
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white font-medium shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AppShell>
  );
}