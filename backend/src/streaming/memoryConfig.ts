/**
 * memoryConfig.ts
 * Configuration for the memory engine weights and limits.
 */
export const MemoryConfig = {
  // Weights for Hybrid Ranking (must sum to 1.0)
  WEIGHT_SIMILARITY: 0.7,
  WEIGHT_RECENCY: 0.3,

  // Search Parameters
  TOP_K_RETRIEVAL: 20, // Initial retrieval count before ranking
  MAX_INJECTION_TOKENS: 1500,
  MIN_SCORE_THRESHOLD: 0.65,

  // Recency Decay (halflife in days)
  RECENCY_HALFLIFE_DAYS: 7,

  // Gemini Embedding Model
  EMBEDDING_MODEL: 'text-embedding-004',
  EMBEDDING_DIMENSION: 768,
};
