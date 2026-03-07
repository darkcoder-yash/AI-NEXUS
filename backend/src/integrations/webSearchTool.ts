import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

export const WebSearchTool = {
  search: {
    name: 'web_search',
    description: 'Searches the web for a query and returns a summarized result.',
    schema: z.object({
      query: z.string(),
      limit: z.number().optional().default(3),
    }),
    execute: async ({ query, limit }: { query: string, limit?: number }, userId: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        // Using a mock search provider (replace with real API like Serper, Brave Search, etc.)
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        
        const response = await fetch(searchUrl, { signal: controller.signal });
        const data = await response.json();
        
        const searchResult = data.AbstractText || (data.RelatedTopics && data.RelatedTopics[0]?.Text) || "No direct result found.";

        // Summarize using Gemini
        const client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
        
        const summaryPrompt = `
          Based on the following web search data for the query "${query}", 
          provide a concise summary (max 3 sentences):
          "${searchResult}"
        `;

        const summaryResult = await client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }]
        });

        const summary = summaryResult.text || 'No summary available.';

        return {
          query,
          summary,
          source: data.AbstractSource || 'DuckDuckGo API',
        };

      } catch (err: any) {
        if (err.name === 'AbortError') throw new Error('Web search timed out after 10 seconds.');
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
