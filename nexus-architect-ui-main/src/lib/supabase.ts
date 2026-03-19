import { createClient } from '@supabase/supabase-js';

// Diagnostic log (Safe for production - only checks existence)
console.log("Supabase Connection Check:", {
  urlFound: !!import.meta.env.VITE_SUPABASE_URL,
  keyFound: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  envMode: import.meta.env.MODE
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("CRITICAL: Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Netlify Environment Variables and a new build is triggered.");
}

// Only initialize if we have both, otherwise we export a mock client to prevent a fatal crash
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : ({
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Supabase not configured. Please check Netlify Environment Variables.") }),
        signUp: async () => ({ data: {}, error: new Error("Supabase not configured. Please check Netlify Environment Variables.") }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any); 

