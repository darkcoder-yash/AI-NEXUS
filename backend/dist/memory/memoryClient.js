import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { MemorySchema } from './memoryTypes.js';
/**
 * MemoryClient provides low-level persistence for long-term and short-term memory.
 */
export class MemoryClient {
    supabase;
    constructor() {
        // UPDATED: Using config.SUPABASE_ANON_KEY as per config.ts schema.
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    }
    /**
     * Saves a new memory and generates a UUID.
     */
    async saveMemory(memory) {
        try {
            const { data, error } = await this.supabase
                .from('memories')
                .insert(memory)
                .select()
                .single();
            if (error)
                throw error;
            return MemorySchema.parse(data);
        }
        catch (err) {
            console.error('[MemoryClient] Save Error:', err.message);
            throw new Error('Memory storage failed');
        }
    }
    /**
     * Performs Semantic Search via PostgreSQL pgvector RPC.
     * FIX: Passing user_id to the database level for strict privacy.
     */
    async searchMemory(queryEmbedding, userId, topK = 5) {
        try {
            // NOTE: This RPC 'match_memories' MUST be updated in SQL to handle 'p_user_id'
            const { data, error } = await this.supabase.rpc('match_memories', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: topK,
                p_user_id: userId, // Pass the user context to the SQL layer
            });
            if (error)
                throw error;
            return data.map((item) => ({
                memory: MemorySchema.parse(item),
                similarity: item.similarity,
            }));
        }
        catch (err) {
            console.error('[MemoryClient] Search Error:', err.message);
            return [];
        }
    }
}
export const memoryClient = new MemoryClient();
