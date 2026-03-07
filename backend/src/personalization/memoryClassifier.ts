import { GoogleGenAI } from '@google/genai';
import { MemoryType } from './personalizationTypes.js';
import { config } from '../config.js';

/**
 * MemoryClassifier uses Gemini to analyze incoming messages and extract structured memories.
 */
export class MemoryClassifier {
  private client: GoogleGenAI;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  /**
   * Classifies a message and extracts potential structured memories.
   * Returns null if no actionable memory is found.
   */
  async classify(text: string): Promise<{ type: MemoryType; content: string; score: number }[] | null> {
    const prompt = `
      Analyze the following user message for long-term memories to save for a personal assistant.
      Categories: 
      - fact (immutable truths about the user: name, job, etc.)
      - preference (likes/dislikes, style)
      - goal (long-term aspirations)
      - task (specific actions to remember)
      - constraint (rules or limits)

      Message: "${text}"

      Return a JSON array of objects with { "type": "fact|preference|goal|task|constraint", "content": "memory text", "score": 0-1 } or an empty array if nothing is worth remembering.
      JSON ONLY.
    `;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const responseText = response.text;
      if (!responseText) return null;

      const data = JSON.parse(responseText);
      return data.length > 0 ? data : null;
    } catch (err: any) {
      console.error('[MemoryClassifier] Error during classification:', err.message);
      return null;
    }
  }
}
