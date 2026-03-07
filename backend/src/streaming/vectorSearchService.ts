import { MemoryRecord, MemoryRepository } from './memoryRepository.js';
import { MemoryConfig } from './memoryConfig.js';
import { EmbeddingService } from './embeddingService.js';

/**
 * VectorSearchService implements hybrid ranking logic.
 * It combines vector similarity (relevance) with recency (decay).
 */
export class VectorSearchService {
  private repository: MemoryRepository;
  private embeddingService: EmbeddingService;

  constructor(repository: MemoryRepository) {
    this.repository = repository;
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Main entry point for retrieving contextual memories.
   */
  async search(
    userId: string,
    query: string,
    currentConversationId?: string
  ): Promise<MemoryRecord[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // 1. Initial vector search (similarity only)
    const results = await this.repository.searchSimilarMemories(
        userId, 
        queryEmbedding, 
        currentConversationId
    );

    // 2. Compute Hybrid Scores
    return this.applyHybridRanking(results);
  }

  /**
   * Applies weighted scoring: Final = (Sim * WeightSim) + (Recency * WeightRecency)
   */
  private applyHybridRanking(results: MemoryRecord[]): MemoryRecord[] {
    const now = new Date().getTime();

    const ranked = results.map(memory => {
      const similarity = memory.similarity || 0;

      // Recency Score (Exponential Decay)
      // Score = exp(-ln(2) * (t_now - t_created) / halflife)
      const diffDays = (now - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.exp(
        (-Math.log(2) * diffDays) / MemoryConfig.RECENCY_HALFLIFE_DAYS
      );

      const hybridScore = 
        (similarity * MemoryConfig.WEIGHT_SIMILARITY) + 
        (recencyScore * MemoryConfig.WEIGHT_RECENCY);

      return { ...memory, hybridScore };
    });

    // Sort by hybrid score descending and filter outliers
    return ranked
      .filter(m => (m.hybridScore || 0) > MemoryConfig.MIN_SCORE_THRESHOLD)
      .sort((a, b) => (b.hybridScore || 0) - (a.hybridScore || 0));
  }
}
