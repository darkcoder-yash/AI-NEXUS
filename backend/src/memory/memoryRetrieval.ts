import { embeddingService } from "./embeddingService.js";
import { memoryClient } from "./memoryClient.js";
import { SearchResult } from "./memoryTypes.js";

/**
 * MemoryRetrieval orchestrates semantic search and contextual ranking.
 */
export class MemoryRetrieval {
  /**
   * Retrieves and ranks relevant memories based on semantic similarity and recency.
   * FIXED: Corrected signature call to memoryClient.searchMemory (passing userId).
   */
  static async getRelevantContext(
    query: string,
    userId: string,
    topK: number = 5
  ): Promise<string> {
    try {
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // 1. Fetch results filtered by userId at the database level
      // FIXED: Added userId as second argument
      const results = await memoryClient.searchMemory(
        queryEmbedding,
        userId,
        topK * 2
      );

      // 2. Rank results using Hybrid Scoring (Similarity + Recency)
      const rankedResults = this.rankMemories(results);
      const topMemories = rankedResults.slice(0, topK);

      if (topMemories.length === 0) return "";

      return this.formatContext(topMemories);
    } catch (err) {
      console.error("[MemoryRetrieval] Context Error:", err);
      return "";
    }
  }

  /**
   * Re-ranks memories using a Recency-Weighted Scoring Formula.
   * Score = (Similarity * 0.7) + (RecencyScore * 0.3)
   */
  private static rankMemories(results: SearchResult[]): SearchResult[] {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return results
      .map((res) => {
        const createdAt = res.memory.created_at
          ? new Date(res.memory.created_at).getTime()
          : now;

        const daysOld = (now - createdAt) / oneDayMs;

        // Recency score decays smoothly over time
        const recencyScore = daysOld > 0 ? 1 / (1 + Math.log1p(daysOld)) : 1;
        const finalScore = res.similarity * 0.7 + recencyScore * 0.3;

        return { ...res, similarity: finalScore };
      })
      .sort((a, b) => b.similarity - a.similarity);
  }

  private static formatContext(results: SearchResult[]): string {
    const contextLines = results.map((res) => {
      const topic = res.memory.metadata?.topic ?? "General";
      const content = res.memory.content.replace(/^User: |^AI: /gm, "").trim();
      return `- [${topic}]: ${content}`;
    });

    return `
<System Memory Context>
Relevant historical context for this user:
${contextLines.join("\n")}
</System Memory Context>
`.trim();
  }
}
