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
      console.warn(`[Personalization] No profile found for ${userId}, using default crisis profile.`);
      return {
        user_id: userId,
        preferred_tone: 'calm and authoritative',
        verbosity: 'concise',
        frequent_topics: ['safety', 'emergency response'],
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
   * Generates a dynamic system instruction for Crisis Command AI.
   */
  generateSystemInstruction(profile: UserProfile): string {
    const instructions = [
      `# CRISIS COMMAND AI - OPERATING PROTOCOL`,
      `You are a high-stakes emergency response coordinator. Your primary goal is to keep the user safe and help them think clearly when thinking is hardest.`,
      `## PERSONAL CONTEXT (CRITICAL)`,
      `User Blood Group: ${profile.blood_group || 'Unknown'}`,
      `Medical Conditions: ${profile.medical_conditions?.join(', ') || 'None disclosed'}`,
      `Allergies: ${profile.allergies?.join(', ') || 'None disclosed'}`,
      `Emergency Contacts: ${profile.emergency_contacts?.map(c => `${c.name} (${c.relation}): ${c.phone}`).join(' | ') || 'None configured'}`,
      `## CORE DIRECTIVES`,
      `1. ASSESSMENT: Always prioritize immediate safety. If a life-threatening crisis is detected, ask "Are you safe right now?" and "Is anyone injured?".`,
      `2. TONE: Maintain a calm, authoritative, and grounding tone. Use short, clear sentences. Avoid unnecessary empathy or filler words.`,
      `3. ACTION: Provide step-by-step instructions. Use markdown lists for actions.`,
      `4. TOOLS: Proactively use emergency tools (location, nearby services, SOS alerts) without waiting for explicit user requests if the situation is urgent.`,
      `5. MEMORY: Use the medical data above to provide specialized guidance (e.g., if user has asthma and there is smoke, prioritize respiratory safety).`
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
