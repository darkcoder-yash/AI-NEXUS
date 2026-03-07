import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { verifyJWT } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
const router = Router();
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
/**
 * Fetch dashboard metrics - Admin Only
 */
router.get('/metrics', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await verifyJWT(authHeader.replace('Bearer ', ''));
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        const isAdmin = await checkRole(user.id, 'admin');
        if (!isAdmin)
            return res.status(403).json({ error: 'Forbidden' });
        // 1. Fetch Active User Count (from user_profiles)
        const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        // 2. Fetch API Usage Data (last 24 hours)
        const { data: apiUsage } = await supabase
            .from('api_usage')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        // 3. Fetch Activity Logs
        const { data: recentLogs } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        // 4. Memory Statistics
        const { count: memoryCount } = await supabase.from('memories').select('*', { count: 'exact', head: true });
        res.json({
            metrics: {
                activeUsers: userCount,
                memoryItems: memoryCount,
                apiUsage: apiUsage,
                recentLogs: recentLogs
            }
        });
    }
    catch (err) {
        console.error('[Admin API] Error fetching metrics:', err);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});
export const adminRouter = router;
