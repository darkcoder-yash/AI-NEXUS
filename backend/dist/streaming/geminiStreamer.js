import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
/**
 * GeminiStreamer handles the direct interaction with the Google Generative AI SDK.
 * It encapsulates the streaming logic and supports cancellation via AbortSignal.
 */
export class GeminiStreamer {
    genAI;
    model = "gemini-2.5-flash";
    constructor() {
        if (!config.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    }
    /**
     * Starts a streaming generation session.
     * @param prompt The user input.
     * @param signal AbortSignal to cancel the stream.
     * @param callbacks Hooks for tokens, completion, and errors.
     */
    async stream(prompt, signal, callbacks) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.model,
                systemInstruction: `You are the AI NEXUS Core, an ultra-advanced reasoning engine. Provide high-fidelity, professional, and strategic responses. Use Markdown formatting.`,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 2048,
                },
            });
            const responseStream = await model.generateContentStream({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            let fullText = "";
            for await (const chunk of responseStream.stream) {
                if (signal.aborted) {
                    throw new Error("Stream cancelled by user");
                }
                const chunkText = chunk.text();
                if (chunkText) {
                    fullText += chunkText;
                    callbacks.onToken(chunkText);
                }
            }
            callbacks.onEnd(fullText);
        }
        catch (error) {
            if (signal.aborted || error.message?.includes("cancelled")) {
                callbacks.onError(new Error("STREAM_CANCELLED"));
            }
            else {
                console.error("[GeminiStreamer] Error:", error.message);
                callbacks.onError(error);
            }
        }
    }
}
