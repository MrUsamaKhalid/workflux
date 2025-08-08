"use client";

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/utils/supabaseClient';

interface UserRow {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Admin panel for managing users and resumes. Only accessible to users
 * flagged as administrators via the is_admin metadata. The AppShell
 * component will redirect non-admins to /dashboard.
 */
export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // The Supabase admin API requires service role key. For demonstration,
      // we query the `profiles` table instead of auth.users. In your Supabase
      // project, create a `profiles` table with user_id and email columns
      // and set RLS accordingly.
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        setUsers(data as unknown as UserRow[]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <AppShell requireAdmin>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Panel</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="bg-white/40 backdrop-blur">
                  <td className="px-4 py-2 text-sm text-gray-800">{u.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}