"use client";

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/utils/supabaseClient';

interface Application {
  id: number;
  job_title: string;
  company: string;
  status: string;
}

/**
 * Job Tracker allows users to search for new positions (stub) and view
 * applications they have already submitted through the platform.
 */
export default function JobTracker() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setApplications(data as unknown as Application[]);
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const handleSearch = async () => {
    // TODO: Integrate job search via LinkedIn and Indeed APIs
    alert(`Searching for "${keyword}" jobs in "${location}" (feature coming soon)`);
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Job Tracker</h1>
      <div className="bg-white/40 backdrop-blur p-6 rounded-2xl shadow border border-white/30 mb-8 max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Search Jobs</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keyword or Job Title"
              className="flex-1 p-3 rounded-lg bg-white/70 backdrop-blur text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="flex-1 p-3 rounded-lg bg-white/70 backdrop-blur text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow"
            >
              Search
            </button>
          </div>
      </div>
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">My Applications</h2>
        {loading ? (
          <p>Loading…</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-700">No applications yet. Once you apply for jobs, they will appear here.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between p-4 bg-white/40 backdrop-blur rounded-xl border border-white/30 shadow"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{app.job_title}</h3>
                  <p className="text-sm text-gray-700">{app.company}</p>
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-600 text-white">
                  {app.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}