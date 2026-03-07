import { EmbeddingService } from './embeddingService.js';
import { MemoryConfig } from './memoryConfig.js';

export interface MemoryRecord {
  id: string;
  userId: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  embedding: number[];
  createdAt: Date;
  similarity?: number; // Distance/Similarity from query
  hybridScore?: number; // Final combined score
}

/**
 * MemoryRepository manages the persistent storage and retrieval from PostgreSQL.
 * Note: Assumes a database client (like pg or Prisma) is provided.
 */
export class MemoryRepository {
  private embeddingService: EmbeddingService;
  private db: any; // Generic database client placeholder

  constructor(dbClient: any) {
    this.db = dbClient;
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Saves a message and its embedding. Ensures atomicity.
   */
  async saveMemory(
    userId: string, 
    conversationId: string, 
    role: 'user' | 'assistant', 
    content: string
  ): Promise<MemoryRecord> {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);

      // In a real implementation: `await this.db.query('INSERT INTO memories ...', [...])`
      const memory: MemoryRecord = {
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
    } catch (error) {
      console.error('[MemoryRepository] Error saving memory:', error);
      throw error;
    }
  }

  /**
   * Retrieves top-N relevant memories using cosine similarity.
   */
  async searchSimilarMemories(
    userId: string,
    queryEmbedding: number[],
    excludeConversationId?: string
  ): Promise<MemoryRecord[]> {
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
