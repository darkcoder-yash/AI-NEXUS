import { StructuredMemory, UserProfile } from './personalizationTypes.js';

/**
 * PersonalizationInjector constructs the specialized contextual blocks for Gemini.
 * It prioritizes identity, then goals, then recent relevant memories.
 */
export class PersonalizationInjector {
  /**
   * Main entry point for prompt construction.
   */
  async inject(userId: string, profile: UserProfile, memories: StructuredMemory[]): Promise<string> {
    const identityBlock = this.formatIdentity(profile);
    const goalBlock = this.formatGoals(profile.longTermGoals);
    const memoryBlock = this.formatMemories(memories);

    return `
### USER IDENTITY & PREFERENCES ###
Tone: ${profile.tonePreference}
${identityBlock}

### LONG-TERM GOALS ###
${goalBlock}

### STRUCTURED MEMORIES ###
${memoryBlock}
##################################
    `.trim();
  }

  private formatIdentity(profile: UserProfile): string {
    const facts = Object.entries(profile.identityFacts)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');
    return facts || 'No identity facts known.';
  }

  private formatGoals(goals: string[]): string {
    return goals.length > 0 
      ? goals.map(g => `- ${g}`).join('\n') 
      : 'No active long-term goals.';
  }

  private formatMemories(memories: StructuredMemory[]): string {
    if (memories.length === 0) return 'No relevant structured memories.';

    // Group by type for clarity
    const grouped = memories.reduce((acc, mem) => {
      if (!acc[mem.type]) acc[mem.type] = [];
      acc[mem.type].push(mem.content);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(grouped)
      .map(([type, contents]) => `[${type.toUpperCase()}]\n${contents.map(c => `- ${c}`).join('\n')}`)
      .join('\n\n');
  }
}
