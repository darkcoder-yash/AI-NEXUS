/**
 * personalizationTypes.ts
 */

export type MemoryType = 'fact' | 'preference' | 'goal' | 'task' | 'constraint';

export interface StructuredMemory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  importanceScore: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  userId: string;
  tonePreference: string;
  toolPermissions: string[];
  longTermGoals: string[];
  identityFacts: Record<string, any>;
  updatedAt: Date;
}

/**
 * Example Structured Memory Object:
 * {
 *   id: "uuid-123",
 *   type: "preference",
 *   content: "User prefers concise, bullet-point responses for technical topics.",
 *   importanceScore: 0.9,
 *   metadata: { source: "message_id_456", category: "communication_style" }
 * }
 */
