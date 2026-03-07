import { personalizationEngine } from '../personalization/personalizationEngine.js';
export async function checkRole(userId, requiredRole) {
    try {
        const profile = await personalizationEngine.getProfile(userId);
        if (requiredRole === 'admin' && profile.role !== 'admin') {
            console.warn(`[Role Middleware] Access denied for user ${userId}: Admin role required`);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error('[Role Middleware] Error checking user role:', err);
        return false;
    }
}
