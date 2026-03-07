import { MemoryRecord } from './memoryRepository.js';
import { MemoryConfig } from './memoryConfig.js';

/**
 * MemoryInjector formats retrieved memories into a contextual block for Gemini.
 */
export class MemoryInjector {
  /**
   * Transforms ranked memories into a single prompt-ready string.
   * Respects token limits by dropping lowest-ranked entries.
   */
  inject(memories: MemoryRecord[]): string {
    if (memories.length === 0) return '';

    let contextBlocks: string[] = [];
    let currentTokenEstimate = 0;

    // Sort by Hybrid Score (already done, but ensured)
    const sorted = [...memories].sort((a, b) => (b.hybridScore || 0) - (a.hybridScore || 0));

    for (const mem of sorted) {
      const block = this.formatMemory(mem);
      const estimate = this.estimateTokens(block);

      if (currentTokenEstimate + estimate > MemoryConfig.MAX_INJECTION_TOKENS) {
        console.log(`[MemoryInjector] Token limit reached. Dropping ${sorted.length - contextBlocks.length} lower-ranked memories.`);
        break;
      }

      contextBlocks.push(block);
      currentTokenEstimate += estimate;
    }

    return `### RELEVANT MEMORIES (HYBRID RANKED) ###\n${contextBlocks.join('\n---\n')}\n##########################################`;
  }

  private formatMemory(mem: MemoryRecord): string {
    const timestamp = mem.createdAt.toISOString().split('T')[0];
    const role = mem.role === 'user' ? 'User' : 'Assistant';
    return `[${timestamp}] ${role}: ${mem.content}`;
  }

  /**
   * Simple character-to-token heuristic.
   * In production, use a library like 'tiktoken' or Gemini's countTokens API.
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
