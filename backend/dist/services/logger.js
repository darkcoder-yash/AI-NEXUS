import winston from 'winston';
import { config } from '../config.js';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.printf(({ level, message, timestamp, requestId, userId, metadata }) => {
    return JSON.stringify({
        timestamp,
        level,
        requestId,
        userId,
        message,
        metadata,
    });
}));
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: logFormat,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});
/**
 * StructuredLogger provides methods for high-signal events.
 */
export class StructuredLogger {
    static info(message, userId, requestId, metadata = {}) {
        logger.info(message, { userId, requestId, metadata });
    }
    static warn(message, userId, requestId, metadata = {}) {
        logger.warn(message, { userId, requestId, metadata });
    }
    static error(message, userId, requestId, metadata = {}) {
        logger.error(message, { userId, requestId, metadata });
        if (metadata.severity === 'critical') {
            this.persistErrorToDB(message, userId, requestId, metadata);
        }
    }
    static logToolExecution(toolName, userId, requestId, duration, success, metadata = {}) {
        this.info(`Tool Execution: ${toolName}`, userId, requestId, {
            ...metadata,
            toolName,
            duration,
            success,
            type: 'tool_execution'
        });
    }
    static async persistErrorToDB(message, userId, requestId, metadata = {}) {
        try {
            await supabase.from('critical_errors').insert({
                message,
                user_id: userId,
                request_id: requestId,
                metadata,
                severity: metadata.severity || 'high',
                stack: metadata.stack,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            console.error('[StructuredLogger] Failed to persist error to DB:', err.message);
        }
    }
}
/**
 * Backward compatibility class 'Logger' as used in existing files.
 */
export class Logger {
    static async logActivity(userId, action, metadata = {}) {
        StructuredLogger.info(`Activity: ${action}`, userId, undefined, metadata);
        try {
            await supabase.from('activity_logs').insert({
                user_id: userId,
                action: action,
                metadata: metadata
            });
        }
        catch (err) {
            console.error('[Logger] Failed to log activity:', err.message);
        }
    }
    static async logAPIUsage(userId, provider, tokens) {
        StructuredLogger.info(`API Usage: ${provider} - ${tokens} tokens`, userId, undefined, { provider, tokens });
        try {
            await supabase.from('api_usage').insert({
                user_id: userId,
                provider: provider,
                tokens_estimated: tokens
            });
        }
        catch (err) {
            console.error('[Logger] Failed to log API usage:', err.message);
        }
    }
}
