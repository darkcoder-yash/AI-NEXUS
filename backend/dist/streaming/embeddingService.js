import { GoogleGenAI } from '@google/genai';
import { MemoryConfig } from './memoryConfig.js';
import { config } from '../config.js';
/**
 * EmbeddingService handles the interaction with Gemini's text-embedding-004 model.
 */
export class EmbeddingService {
    client;
    constructor() {
        if (!config.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing');
        }
        this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    }
    /**
     * Generates a 768-dimensional embedding for the given text.
     */
    async generateEmbedding(text) {
        try {
            const response = await this.client.models.embedContent({
                model: MemoryConfig.EMBEDDING_MODEL,
                contents: text,
                config: { taskType: 'RETRIEVAL_QUERY' }
            });
            const embedding = response.embeddings?.[0]?.values;
            if (!embedding) {
                throw new Error('Failed to generate embedding: no embedding returned');
            }
            if (embedding.length !== MemoryConfig.EMBEDDING_DIMENSION) {
                throw new Error(`Embedding dimension mismatch: expected ${MemoryConfig.EMBEDDING_DIMENSION}, got ${embedding.length}`);
            }
            return embedding;
        }
        catch (error) {
            console.error('[EmbeddingService] Error generating embedding:', error.message);
            throw error;
        }
    }
    /**
     * Helper to truncate long text if needed before embedding.
     */
    truncateText(text, maxChars = 8000) {
        return text.length > maxChars ? text.substring(0, maxChars) : text;
    }
}
