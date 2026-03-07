import { z } from 'zod';
import { AuthService } from './authService.js';
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
export class AuthController {
    /**
     * Register user and send verification email (mocked).
     */
    static async register(req, res) {
        try {
            const { email, password } = registerSchema.parse(req.body);
            const user = await AuthService.register(email, password);
            console.log(`[Auth] Verification email sent to: ${email}. Token: ${user.verification_token}`);
            res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                userId: user.id
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * Login user and set secure HTTP-only cookies.
     */
    static async login(req, res) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const { accessToken, refreshToken } = await AuthService.login(email, password);
            // Secure Refresh Token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(200).json({ accessToken });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    /**
     * Refresh access token via refresh token cookie.
     */
    static async refresh(req, res) {
        try {
            const token = req.cookies.refreshToken;
            if (!token)
                throw new Error('Refresh token missing.');
            const { accessToken, refreshToken } = await AuthService.refresh(token);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(200).json({ accessToken });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    /**
     * Logout user and clear cookies/sessions.
     */
    static async logout(req, res) {
        try {
            const token = req.cookies.refreshToken;
            if (token) {
                await AuthService.logout(token);
            }
            res.clearCookie('refreshToken');
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
