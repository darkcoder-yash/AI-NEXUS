import { EmbeddingService } from './embeddingService.js';
/**
 * MemoryRepository manages the persistent storage and retrieval from PostgreSQL.
 * Note: Assumes a database client (like pg or Prisma) is provided.
 */
export class MemoryRepository {
    embeddingService;
    db; // Generic database client placeholder
    constructor(dbClient) {
        this.db = dbClient;
        this.embeddingService = new EmbeddingService();
    }
    /**
     * Saves a message and its embedding. Ensures atomicity.
     */
    async saveMemory(userId, conversationId, role, content) {
        try {
            const embedding = await this.embeddingService.generateEmbedding(content);
            // In a real implementation: `await this.db.query('INSERT INTO memories ...', [...])`
            const memory = {
                id: 'uuid-mock',
                userId,
                conversationId,
                role,
                content,
                embedding,
                createdAt: new Date(),
            };
            console.log(`[MemoryRepository] Saved memory for user ${userId}.`);
            return memory;
        }
        catch (error) {
            console.error('[MemoryRepository] Error saving memory:', error);
            throw error;
        }
    }
    /**
     * Retrieves top-N relevant memories using cosine similarity.
     */
    async searchSimilarMemories(userId, queryEmbedding, excludeConversationId) {
        // REAL SQL:
        // SELECT id, content, created_at, role, (1 - (embedding <=> $1)) as similarity
        // FROM memories
        // WHERE user_id = $2 
        // AND (conversation_id != $3 OR conversation_id IS NULL)
        // ORDER BY similarity DESC
        // LIMIT $4;
        console.log(`[MemoryRepository] Searching similarity for user ${userId}.`);
        return []; // Mock return for demonstration
    }
}
