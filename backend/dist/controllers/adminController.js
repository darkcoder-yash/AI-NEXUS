import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { z } from 'zod';
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
export class AdminController {
    /**
     * Retrieves list of active user sessions and token usage stats.
     */
    static async getUsageStats(req, res) {
        const { page = 1, limit = 10 } = z.object({
            page: z.string().optional().transform(Number),
            limit: z.string().optional().transform(Number)
        }).parse(req.query);
        const offset = (page - 1) * limit;
        const { data: usage, error, count } = await supabase
            .from('token_usage')
            .select('*, users(email)', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(200).json({
            data: usage,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    }
    /**
     * View tool execution logs with filters.
     */
    static async getToolLogs(req, res) {
        const { success, toolName } = req.query;
        let query = supabase.from('tool_execution_logs').select('*');
        if (success !== undefined)
            query = query.eq('success', success === 'true');
        if (toolName)
            query = query.ilike('tool_name', `%${toolName}%`);
        const { data, error } = await query.order('timestamp', { ascending: false }).limit(50);
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(200).json(data);
    }
    /**
     * View critical system errors.
     */
    static async getErrorLogs(req, res) {
        const { data, error } = await supabase
            .from('critical_errors')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(200).json(data);
    }
}
