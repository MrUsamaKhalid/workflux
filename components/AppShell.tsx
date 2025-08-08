"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { FaHome, FaFileAlt, FaPenFancy, FaSearch, FaComments, FaCog, FaUserShield } from 'react-icons/fa';

interface AppShellProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * AppShell provides a sidebar and top bar for authenticated pages.
 * If no session exists, redirects to /signin. If requireAdmin is true,
 * checks the user metadata for an 'is_admin' flag; if not admin, redirects to dashboard.
 */
export default function AppShell({ children, requireAdmin = false }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((
      _event: any,
      session: any
    ) => {
      if (!session) {
        router.push('/signin');
      }
    });
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }
      // Determine admin status from user metadata
      const user = session.user;
      const admin = (user?.user_metadata as any)?.is_admin;
      setIsAdmin(admin === true);
      setLoading(false);
      if (requireAdmin && !admin) {
        router.push('/dashboard');
      }
    };
    checkSession();
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, requireAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading…</p>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { href: '/resume', label: 'Resume Builder', icon: <FaFileAlt /> },
    { href: '/cover-letter', label: 'Cover Letter', icon: <FaPenFancy /> },
    { href: '/job-tracker', label: 'Job Tracker', icon: <FaSearch /> },
    { href: '/interview', label: 'Interview Buddy', icon: <FaComments /> },
    { href: '/settings', label: 'Settings', icon: <FaCog /> },
  ];
  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: <FaUserShield /> });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-white/10 backdrop-blur border-r border-white/20 p-4 flex flex-col gap-2">
        <div className="mb-8">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            Workflux
          </Link>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white'
                : 'text-purple-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {/* Sign out button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/signin');
          }}
          className="mt-auto px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          Sign out
        </button>
      </nav>
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto text-white">
        {children}
      </main>
    </div>
  );
}