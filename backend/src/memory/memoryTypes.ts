import { z } from 'zod';

export const MemorySchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().min(1),
  user_id: z.string().optional().nullable(),
  content: z.string().min(1),
  embedding: z.array(z.number()),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().optional(),
});

export type Memory = z.infer<typeof MemorySchema>;

export interface SearchResult {
  memory: Memory;
  similarity: number;
}
