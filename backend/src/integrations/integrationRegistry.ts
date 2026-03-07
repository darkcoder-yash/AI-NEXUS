import { z } from 'zod';
import { CalendarTool } from './calendarTool.js';
import { GmailTool } from './gmailTool.js';
import { WebSearchTool } from './webSearchTool.js';
import { FileTool } from './fileTool.js';

export interface IntegratedTool {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
  execute: (args: any, userId: string) => Promise<any>;
  requiresConfirmation?: boolean;
}

// Global registry of all integration tools
export const integrationRegistry: Record<string, IntegratedTool> = {
  ...CalendarTool,
  ...GmailTool,
  ...WebSearchTool,
  ...FileTool,
};

// --- Security & Rate Limiting Layer ---

interface RateLimitState {
  count: number;
  lastReset: number;
}

const userToolLimits = new Map<string, RateLimitState>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_CALLS_PER_WINDOW = 10;

export class SecurityManager {
  /**
   * Validates if a user can execute a tool based on permissions and rate limits.
   */
  static async authorize(toolName: string, userId: string): Promise<void> {
    // 1. Permission Check (Mocked for now, integrate with RBAC or DB if needed)
    const tool = integrationRegistry[toolName];
    if (!tool) throw new Error(`Unknown tool: ${toolName}`);

    // Example: Restricted tools for certain users
    if (toolName.startsWith('calendar_') && userId === 'blocked_user') {
      throw new Error('Access Denied: User is blocked from calendar operations.');
    }

    // 2. Rate Limiting Check
    const limitKey = `${userId}:${toolName}`;
    const now = Date.now();
    let state = userToolLimits.get(limitKey);

    if (!state || now - state.lastReset > RATE_LIMIT_WINDOW_MS) {
      state = { count: 1, lastReset: now };
    } else {
      if (state.count >= MAX_CALLS_PER_WINDOW) {
        throw new Error(`Rate limit exceeded for tool ${toolName}. Please wait.`);
      }
      state.count++;
    }

    userToolLimits.set(limitKey, state);

    // 3. Action Logging
    this.logAction(toolName, userId);
  }

  private static logAction(toolName: string, userId: string) {
    console.log(`[Security] ACTION_LOG: User ${userId} is executing ${toolName} at ${new Date().toISOString()}`);
  }
}

/**
 * High-level tool execution wrapper that applies security and normalization.
 */
export async function executeIntegratedTool(toolName: string, args: any, userId: string): Promise<any> {
  const tool = integrationRegistry[toolName];
  if (!tool) throw new Error(`Integration tool ${toolName} not found.`);

  // Apply Security Checks
  await SecurityManager.authorize(toolName, userId);

  // Validate Arguments
  const validatedArgs = tool.schema.parse(args);

  // Execute and Normalize
  try {
    const result = await tool.execute(validatedArgs, userId);
    return {
      status: 'success',
      tool: toolName,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error(`[Integration Error] ${toolName}: ${error.message}`);
    return {
      status: 'error',
      tool: toolName,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
