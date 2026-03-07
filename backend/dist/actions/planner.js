import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { getGeminiToolDefinitions } from '../toolRegistry.js';
import { PlanValidator } from './planValidator.js';
export class ActionPlanner {
    client;
    constructor() {
        this.client = new GoogleGenAI({
            apiKey: config.GEMINI_API_KEY,
        });
    }
    /**
     * Generates a multi-step execution plan based on the user request.
     */
    async generatePlan(request) {
        const tools = getGeminiToolDefinitions();
        const prompt = `
      You are an expert action planner. Given a user request, generate a structured, deterministic multi-step plan.
      You have access to these tools: ${JSON.stringify(tools)}

      Return ONLY a JSON object:
      {
        "steps": [
          {
            "id": "unique_string",
            "description": "Human-readable description of what this step does.",
            "toolName": "name_from_registry",
            "arguments": { ... },
            "requiresConfirmation": boolean
          }
        ]
      }

      Requirements:
      1. Sequential logic: If a step depends on a previous one, explain it in the description.
      2. Placeholders: If a step requires output from a previous step, use the placeholder format "{{step_id.path.to.property}}".
      3. Confirmation: Flag steps that are destructive (e.g. delete, mass update) with requiresConfirmation: true.
      4. Brevity: Limit to 10 steps.

      User Request: "${request}"
    `;
        const result = await this.client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
            }
        });
        const responseText = result.text;
        if (!responseText)
            throw new Error('Failed to generate plan: No response from Gemini.');
        const parsed = JSON.parse(responseText);
        return PlanValidator.validate(parsed.steps);
    }
}
