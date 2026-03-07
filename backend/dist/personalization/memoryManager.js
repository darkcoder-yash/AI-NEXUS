import { MemoryClassifier } from './memoryClassifier.js';
import { EmbeddingService } from '../streaming/embeddingService.js';
/**
 * MemoryManager handles the saving, deduplication, and lifecycle of structured memories.
 */
export class MemoryManager {
    classifier;
    embeddingService;
    db; // Database client placeholder
    constructor(dbClient) {
        this.db = dbClient;
        this.classifier = new MemoryClassifier();
        this.embeddingService = new EmbeddingService();
    }
    /**
     * Main entry point to process a message for long-term memory.
     */
    async processMessage(userId, text) {
        const extractedMemories = await this.classifier.classify(text);
        if (!extractedMemories)
            return;
        for (const mem of extractedMemories) {
            await this.saveStructuredMemory(userId, mem.type, mem.content, mem.score);
        }
    }
    /**
     * Saves a structured memory.
     * Includes semantic deduplication: if a similar memory exists, update it.
     */
    async saveStructuredMemory(userId, type, content, score) {
        const embedding = await this.embeddingService.generateEmbedding(content);
        // 1. Semantic Deduplication
        // Check for similar memory in the same user + type
        const similarMemories = await this.db.query(`SELECT id, content, (1 - (embedding <=> $1)) as similarity 
       FROM structured_memories 
       WHERE user_id = $2 AND type = $3 
       HAVING similarity > 0.85 
       LIMIT 1`, [embedding, userId, type]);
        if (similarMemories.length > 0) {
            const existing = similarMemories[0];
            console.log(`[MemoryManager] Deduplicated: Updating memory ${existing.id} instead of inserting.`);
            await this.db.query(`UPDATE structured_memories 
         SET content = $1, embedding = $2, importance_score = $3, updated_at = NOW() 
         WHERE id = $4`, [content, embedding, score, existing.id]);
        }
        else {
            // 2. Insert new structured memory
            await this.db.query(`INSERT INTO structured_memories (user_id, type, content, importance_score, embedding)
         VALUES ($1, $2, $3, $4, $5)`, [userId, type, content, score, embedding]);
        }
    }
    /**
     * Editable Memory API - Delete memory.
     */
    async deleteMemory(userId, memoryId) {
        await this.db.query(`DELETE FROM structured_memories WHERE id = $1 AND user_id = $2`, [memoryId, userId]);
    }
}
