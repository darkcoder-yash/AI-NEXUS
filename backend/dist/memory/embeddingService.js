import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
export class EmbeddingService {
    async generateEmbedding(text) {
        try {
            console.log(`[EmbeddingService] Generating embedding for text: ${text.substring(0, 50)}...`);
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(text);
            return result.embedding.values;
        }
        catch (err) {
            console.error("[EmbeddingService] Error generating embedding:", err);
            throw new Error("Failed to generate embedding");
        }
    }
    async generateEmbeddings(texts) {
        try {
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
            // Batch embedding is not directly supported in the same way in the new SDK 
            // but we can map it for now or use the batch API if available.
            // Actually, for simplicity and to match the previous logic:
            const results = await Promise.all(texts.map(text => model.embedContent(text)));
            return results.map(r => r.embedding.values);
        }
        catch (err) {
            console.error("[EmbeddingService] Error batch generating embeddings:", err);
            throw new Error("Failed to generate batch embeddings");
        }
    }
}
export const embeddingService = new EmbeddingService();
