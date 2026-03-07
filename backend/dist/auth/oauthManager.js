import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { JWTManager } from './jwtManager.js';
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
export class OAuthManager {
    /**
     * Completes Google OAuth login flow.
     * Creates user profile if not exists.
     */
    static async googleLogin(idToken) {
        // 1. Verify Google ID Token (Mocked fetch for simplicity)
        // Real implementation would use: const ticket = await client.verifyIdToken(...)
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const googleUser = await response.json();
        if (!response.ok)
            throw new Error('Invalid Google Token.');
        // 2. Find or create user in our DB
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', googleUser.email)
            .single();
        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                email: googleUser.email,
                role: 'user',
                is_verified: true, // OAuth emails are pre-verified
                auth_provider: 'google'
            })
                .select()
                .single();
            if (createError)
                throw new Error('OAuth login failed.');
            user = newUser;
        }
        // 3. Issue JWTs
        const accessToken = JWTManager.generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = JWTManager.generateRefreshToken({ userId: user.id, role: user.role });
        await supabase.from('sessions').insert({
            user_id: user.id,
            refresh_token: refreshToken,
            expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
        });
        return { accessToken, refreshToken, user };
    }
}
