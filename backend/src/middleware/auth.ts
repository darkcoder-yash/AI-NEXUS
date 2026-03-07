import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// UPDATED: Using config.SUPABASE_ANON_KEY as per config.ts schema.
const supabase: SupabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export async function verifyJWT(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.warn('[Auth Middleware] Invalid token or user not found');
      return null;
    }

    // --- EMAIL VERIFICATION CHECK ---
    if (!user.email_confirmed_at) {
      console.warn(`[Auth Middleware] User ${user.id} has not verified their email`);
      return null;
    }
    // --------------------------------

    return user;
  } catch (err: any) {
    console.error('[Auth Middleware] Unexpected error verifying JWT:', err.message);
    return null;
  }
}
