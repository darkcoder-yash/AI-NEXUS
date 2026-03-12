import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export interface UserProfile {
  user_id: string;
  preferred_tone: string;
  verbosity: 'concise' | 'balanced' | 'detailed';
  frequent_topics: string[];
  detected_preferences: Record<string, any>;
  emotional_baseline: string;
  interaction_count: number;
  role: 'user' | 'admin';
  // Emergency Fields
  medical_conditions?: string[];
  allergies?: string[];
  blood_group?: string;
  emergency_contacts?: { name: string, phone: string, relation: string }[];
  base_location?: { lat: number, lng: number, address: string };
}

export class PersonalizationEngine {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  async getProfile(userId: string = 'default_user'): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn(`[Personalization] No profile found for ${userId}, using default advanced profile.`);
      return {
        user_id: userId,
        preferred_tone: 'professional and analytical',
        verbosity: 'balanced',
        frequent_topics: ['productivity', 'general knowledge', 'system status'],
        detected_preferences: {},
        emotional_baseline: 'neutral',
        interaction_count: 0,
        role: 'user',
        medical_conditions: ['None disclosed'],
        blood_group: 'Unknown',
        emergency_contacts: []
      };
    }
    return data as UserProfile;
  }

  /**
   * Generates a dynamic, ultra-advanced system instruction for AI NEXUS.
   */
  generateAdvancedNexusInstruction(profile: UserProfile): string {
    const instructions = [
      `# AI NEXUS - ULTRA ADVANCED OPERATING CORE v4.0`,
      `You are the AI NEXUS Core, an ultra-advanced, multi-modal reasoning engine designed for high-fidelity human life management, strategic decision-support, and real-time situational awareness.`,
      
      `## COGNITIVE ARCHITECTURE`,
      `1. MULTI-STEP REASONING: Always break down complex requests into atomic sub-tasks. Use an internal chain-of-thought process before providing a final answer.`,
      `2. CONTEXTUAL SYNTHESIS: You possess deep knowledge of the user's profile, including their medical data, preferences, and frequent topics. Integrate this context into every response.`,
      `3. PROACTIVE PLANNING: If the user mentions a goal or a task, immediately simulate potential outcomes, identify conflicts, and propose optimized schedules.`,
      
      `## USER PROFILE & PERSONAL CONTEXT`,
      `- User Identity: ${profile.user_id}`,
      `- Preferred Tone: ${profile.preferred_tone || 'professional'}`,
      `- Preferred Verbosity: ${profile.verbosity || 'balanced'}`,
      `- Medical Context (CONFIDENTIAL): Blood Group: ${profile.blood_group || 'Unknown'}, Conditions: ${profile.medical_conditions?.join(', ') || 'None'}, Allergies: ${profile.allergies?.join(', ') || 'None'}.`,
      `- Emergency Protocol: If life-threatening keywords are detected, seamlessly switch to High-Stakes Emergency Mode. Contacts: ${profile.emergency_contacts?.map(c => `${c.name} (${c.relation}): ${c.phone}`).join(' | ') || 'None configured'}.`,

      `## CORE CAPABILITIES & DOMAINS`,
      `1. LIFE SIMULATION: Predict impacts of decisions on mental workload, time, and health.`,
      `2. COGNITIVE MONITORING: Estimate and report the user's mental workload (0-100) based on their requests and tone.`,
      `3. KNOWLEDGE GRAPH: Maintain an internal map of People, Projects, Tasks, and Notes.`,
      `4. DECISION ENGINE: Use multi-criteria decision analysis (MCDA) to evaluate options.`,

      `## OPERATING PRINCIPLES`,
      `- PRECISION: Avoid conversational filler, apologies, or redundant phrases. Be direct.`,
      `- STRUCTURE: Use Markdown (tables, bold, lists, code blocks) to organize complex data.`,
      `- AUTHORITY: Speak as a high-level strategic advisor, not just a chatbot.`,
      `- TOOL INTEGRATION: You have access to specialized tools (Calendar, Search, Files, Emergency). Use them autonomously when needed.`
    ];

    return instructions.join('\n\n');
  }

  /**
   * Updates the user profile based on the latest interaction.
   */
  async updateProfile(userId: string, data: { sentiment: string, topic: string, responseLength: number }) {
    try {
      const profile = await this.getProfile(userId);
      const updates: Partial<UserProfile> & { updated_at: string } = {
        interaction_count: (profile.interaction_count || 0) + 1,
        updated_at: new Date().toISOString()
      };

      // Simple Pattern Detection: Verbosity
      if (data.responseLength > 1000) {
         updates.verbosity = 'detailed';
      } else if (data.responseLength < 100 && profile.interaction_count > 5) {
         updates.verbosity = 'concise';
      }

      // Pattern Detection: Dominant Topics
      if (data.topic !== 'general' && !profile.frequent_topics.includes(data.topic)) {
        updates.frequent_topics = [...profile.frequent_topics, data.topic].slice(-5); // Keep last 5
      }

      // Pattern Detection: Emotional Baseline
      if (data.sentiment === 'negative' && profile.emotional_baseline !== 'negative') {
          updates.preferred_tone = 'empathetic and supportive';
      } else if (data.sentiment === 'positive') {
          updates.preferred_tone = 'upbeat and professional';
      }

      await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);
        
      console.log(`[Personalization] Updated profile for ${userId}:`, updates);
    } catch (err) {
      console.error('[Personalization] Failed to update profile:', err);
    }
  }
}

export const personalizationEngine = new PersonalizationEngine();
