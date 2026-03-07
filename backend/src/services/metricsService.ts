import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { StructuredLogger } from './logger.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

export class MetricsService {
  /**
   * Logs token usage per request and aggregates per-user.
   */
  static async trackTokenUsage(userId: string, requestId: string, promptTokens: number, completionTokens: number, model: string) {
    const totalTokens = promptTokens + completionTokens;
    
    try {
      await supabase.from('token_usage').insert({
        user_id: userId,
        request_id: requestId,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        model: model,
        timestamp: new Date().toISOString()
      });

      StructuredLogger.info(`Token Usage: ${totalTokens} tokens used by user ${userId}`, userId, requestId, {
        promptTokens,
        completionTokens,
        model,
        type: 'token_usage'
      });
    } catch (err) {
      StructuredLogger.error('Failed to track token usage', userId, requestId, { error: err });
    }
  }

  /**
   * Tracks response time for a generation request.
   */
  static async trackResponseTime(userId: string, requestId: string, durationMs: number, type: 'text' | 'stream' | 'tool_execution') {
    try {
      await supabase.from('response_metrics').insert({
        user_id: userId,
        request_id: requestId,
        duration_ms: durationMs,
        metric_type: type,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      StructuredLogger.error('Failed to track response time', userId, requestId, { error: err });
    }
  }

  /**
   * Aggregates metrics for the admin dashboard.
   */
  static async getUserMetricsAggregation(userId: string) {
    const { data, error } = await supabase.rpc('get_user_token_aggregation', { u_id: userId });
    if (error) throw error;
    return data;
  }
}
