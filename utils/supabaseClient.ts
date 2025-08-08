import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client on the client side. The URL and anon key
// should be configured via environment variables. Create a `.env.local`
// file at the project root and define NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY with your project details.
// During static generation or if env vars are missing, create a mock client
// to avoid build errors. At runtime with proper env values, initialise
// the real Supabase client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Mock supabase client for build time or missing config
  supabase = {
    auth: {
      signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
      signInWithOtp: async () => ({ error: { message: 'Supabase not configured' } }),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => {},
      updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
    },
    from: () => ({
      select: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      order: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
  };
}

export { supabase };