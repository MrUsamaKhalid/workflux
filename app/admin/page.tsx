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
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Panel</h1>
      {loading ? (
        <p className="text-purple-200">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">User ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((u) => (
                <tr key={u.id} className="bg-white/10 backdrop-blur">
                  <td className="px-4 py-2 text-sm text-purple-200">{u.id}</td>
                  <td className="px-4 py-2 text-sm text-purple-200">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-purple-200">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}