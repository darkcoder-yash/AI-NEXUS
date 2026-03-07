import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export class OAuthManager {
  private static readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

  /**
   * Retrieves valid access token for a user. Refreshes if expired.
   */
  static async getValidAccessToken(userId: string): Promise<string> {
    const { data: profile, error } = await supabase
      .from('user_oauth_tokens')
      .select('access_token, refresh_token, expiry_date')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      throw new Error(`User ${userId} has not linked their Google account.`);
    }

    const { access_token, refresh_token, expiry_date } = profile;

    // Check if token is expired or expiring in 5 mins
    if (Date.now() < expiry_date - 300000) {
      return access_token;
    }

    // Refresh token
    return this.refreshAccessToken(userId, refresh_token);
  }

  private static async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
    console.log(`[OAuthManager] Refreshing token for user ${userId}`);
    
    const response = await fetch(this.GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh Google token: ${data.error_description || data.error}`);
    }

    const newExpiryDate = Date.now() + data.expires_in * 1000;

    await supabase
      .from('user_oauth_tokens')
      .update({
        access_token: data.access_token,
        expiry_date: newExpiryDate,
      })
      .eq('user_id', userId);

    return data.access_token;
  }

  /**
   * Save initial tokens after OAuth flow.
   */
  static async saveTokens(userId: string, tokens: OAuthTokens) {
    await supabase.from('user_oauth_tokens').upsert({
      user_id: userId,
      ...tokens,
      updated_at: new Date().toISOString(),
    });
  }
}
