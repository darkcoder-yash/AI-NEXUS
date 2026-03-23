import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config.js';
import { StructuredLogger } from './logger.js';

class AuthService {
  private supabaseAdmin: SupabaseClient;

  constructor() {
    this.supabaseAdmin = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async validateToken(token: string) {
    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        StructuredLogger.warn('Invalid token attempt', 'auth', { error: error?.message });
        return null;
      }

      const profile = await this.getUserProfile(user.id);
      
      return {
        ...user,
        role: profile?.role || 'user',
        mfa_enabled: profile?.mfa_enabled || false
      };
    } catch (err: any) {
      StructuredLogger.error('Token validation failed', 'auth', { error: err.message });
      return null;
    }
  }

  private async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .select('role, mfa_enabled')
      .eq('id', userId)
      .single();

    if (error) {
      StructuredLogger.error('Profile fetch failed', 'db', { userId, error: error.message });
      return null;
    }

    return data;
  }

  async setMFAStatus(userId: string, enabled: boolean) {
    const { error } = await this.supabaseAdmin
      .from('profiles')
      .update({ mfa_enabled: enabled })
      .eq('id', userId);

    if (error) {
      StructuredLogger.error('MFA status update failed', 'db', { userId, error: error.message });
      return false;
    }

    return true;
  }
}

export const authService = new AuthService();
