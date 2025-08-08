"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { FaGoogle, FaLinkedin, FaUser } from 'react-icons/fa';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

 const handleEmailSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`, // 👈 Redirect to dashboard
    },
  });

  if (error) {
    setMessage(error.message);
  } else {
    setMessage('Check your email for a login link');
  }

  setLoading(false);
};

const handleOAuthSignIn = async (provider: 'google' | 'linkedin_id' | 'apple' | 'github' | string) => {
  setLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${window.location.origin}/dashboard`, // 👈 Redirect to dashboard
    },
  });

  if (error) {
    setMessage(error.message);
  }

  setLoading(false);
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md bg-white/40 backdrop-blur-lg rounded-3xl shadow-md p-8 border border-white/30">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Sign in to Workflux</h2>
        {message && <p className="text-sm text-center mb-4 text-rose-500">{message}</p>}
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mb-6">
          <label className="flex flex-col text-left text-sm text-gray-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-3 rounded-lg bg-white/70 backdrop-blur placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending magic link…' : 'Send magic link'}
          </button>
        </form>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/70 hover:bg-white/80 text-gray-800 font-medium shadow border border-gray-300"
          >
            <FaGoogle /> Sign in with Google
          </button>
          <button
            onClick={() => handleOAuthSignIn('linkedin_id')}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/70 hover:bg-white/80 text-gray-800 font-medium shadow border border-gray-300"
          >
            <FaLinkedin /> Sign in with LinkedIn
          </button>
          {/* Placeholder for Indeed sign-in; Supabase doesn't support Indeed out of the box. Use your own OAuth flow. */}
          <button
            disabled
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/50 text-gray-500 font-medium shadow border border-gray-300 cursor-not-allowed"
          >
            <FaUser /> Indeed sign-in (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
