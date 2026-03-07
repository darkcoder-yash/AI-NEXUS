import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';
import { WebSocketEventTypes } from './types.js';
import { toolRegistry, getGeminiToolDefinitions } from './toolRegistry.js';
import { personalizationEngine } from './personalization/personalizationEngine.js';
import { StructuredLogger } from './services/logger.js';
/**
 * GeminiAgent manages AI logic, history, and tool loops.
 */
export class GeminiAgent {
    client;
    history = [];
    sessionId;
    userId;
    systemInstruction = '';
    currentAbortController = null;
    MAX_HISTORY_TURNS = 20;
    MAX_TOOL_ITERATIONS = 5;
    constructor(sessionId, userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.client = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    }
    async initialize() {
        if (this.systemInstruction)
            return;
        try {
            // Add timeout to profile fetching
            const profile = await Promise.race([
                personalizationEngine.getProfile(this.userId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000))
            ]).catch(err => {
                StructuredLogger.error('Profile fetch failed, using default', this.userId, this.sessionId, { error: err.message });
                return null;
            });
            if (profile) {
                this.systemInstruction = personalizationEngine.generateSystemInstruction(profile);
            }
            else {
                this.systemInstruction = 'You are LifeOS, a highly personalized and intelligent AI assistant.';
            }
            // Enhance system instruction for better "brain"
            this.systemInstruction += `\n\n[CORE OPERATING PRINCIPLES]
      1. You are an expert engineer, researcher, and personal assistant.
      2. Use tools proactively when needed to provide accurate, real-time data.
      3. Your tone is professional yet empathetic, adapting to the user's needs.
      4. When writing code, prioritize readability, efficiency, and security.
      5. If a request is ambiguous, ask clarifying questions before acting.
      6. Leverage your long-term memory context to maintain continuity across sessions.
      7. Be concise by default, but provide depth when the topic warrants it.`;
            StructuredLogger.info('Agent initialized with enhanced instructions', this.userId, this.sessionId);
        }
        catch (err) {
            StructuredLogger.error(`Failed to initialize agent for user ${this.userId}`, this.userId, this.sessionId, { error: err.message });
            this.systemInstruction = 'You are LifeOS, a highly personalized and intelligent AI assistant.';
        }
    }
    /**
     * Transcribes audio data to text using Gemini 1.5 Flash.
     */
    async transcribeAudio(data) {
        try {
            StructuredLogger.info(`Transcribing audio buffer of size ${data.length}`, this.userId, this.sessionId);
            const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: 'audio/webm;codecs=opus',
                        data: data.toString('base64')
                    }
                },
                { text: 'Transcribe this audio exactly. If there is no speech, return an empty string. Output ONLY the transcription.' }
            ]);
            const transcription = result.response.text().trim();
            if (transcription) {
                StructuredLogger.info(`Transcription successful: ${transcription.substring(0, 50)}...`, this.userId, this.sessionId);
                return transcription;
            }
            return null;
        }
        catch (err) {
            StructuredLogger.error('Transcription failed', this.userId, this.sessionId, { error: err.message });
            return null;
        }
    }
    /**
     * Cancels the active stream if it exists.
     */
    async cancel() {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
            StructuredLogger.info(`Session ${this.sessionId} cancelled by user.`, this.userId, this.sessionId);
        }
    }
    async processMessage(prompt, onEvent) {
        await this.cancel();
        this.currentAbortController = new AbortController();
        try {
            await this.initialize();
            StructuredLogger.info(`Processing message for user ${this.userId}`, this.userId, this.sessionId, { prompt });
            onEvent(WebSocketEventTypes.RESPONSE_START, { sessionId: this.sessionId });
            // 2. Memory Context Retrieval
            let contextualPrompt = prompt;
            try {
                const { MemoryRetrieval } = await import('./memory/memoryRetrieval.js');
                const context = await MemoryRetrieval.getRelevantContext(prompt, this.userId);
                if (context) {
                    contextualPrompt = `[Context from Memory]\n${context}\n\n[User Message]\n${prompt}`;
                    StructuredLogger.info('Retrieved memory context', this.userId, this.sessionId);
                }
            }
            catch (err) {
                StructuredLogger.error('Memory retrieval error', this.userId, this.sessionId, { error: err.message });
            }
            // 3. Sliding Window History Management
            if (this.history.length > this.MAX_HISTORY_TURNS * 2) {
                this.history = this.history.slice(-this.MAX_HISTORY_TURNS * 2);
            }
            this.history.push({ role: 'user', parts: [{ text: contextualPrompt }] });
            let finalResponse = '';
            let iterationCount = 0;
            while (iterationCount < this.MAX_TOOL_ITERATIONS) {
                if (this.currentAbortController?.signal.aborted) {
                    StructuredLogger.info('Generation aborted', this.userId, this.sessionId);
                    break;
                }
                StructuredLogger.info(`Calling Gemini 2.5 Flash (Iteration ${iterationCount + 1})`, this.userId, this.sessionId);
                const model = this.client.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    systemInstruction: this.systemInstruction,
                });
                try {
                    const responseStream = await model.generateContentStream({
                        contents: this.history,
                        tools: [{ functionDeclarations: getGeminiToolDefinitions() }],
                    });
                    let currentTurnText = '';
                    let pendingFunctionCalls = [];
                    let chunkCount = 0;
                    for await (const chunk of responseStream.stream) {
                        if (this.currentAbortController?.signal.aborted)
                            break;
                        chunkCount++;
                        const text = chunk.text();
                        if (text) {
                            currentTurnText += text;
                            onEvent(WebSocketEventTypes.RESPONSE_TOKEN, { token: text });
                        }
                        const calls = chunk.functionCalls();
                        if (calls) {
                            pendingFunctionCalls.push(...calls);
                            onEvent(WebSocketEventTypes.FUNCTION_CALL_DETECTED, { functionCalls: calls });
                            StructuredLogger.info(`Gemini requested ${calls.length} tool(s)`, this.userId, this.sessionId);
                        }
                    }
                    StructuredLogger.info(`Received ${chunkCount} chunks from Gemini`, this.userId, this.sessionId);
                    if (currentTurnText) {
                        finalResponse += currentTurnText;
                        this.history.push({ role: 'model', parts: [{ text: currentTurnText }] });
                    }
                    if (pendingFunctionCalls.length > 0) {
                        const toolResults = await Promise.all(pendingFunctionCalls.map(async (call) => {
                            const tool = toolRegistry[call.name];
                            if (!tool)
                                return { functionResponse: { name: call.name, response: { error: 'Not Found' } } };
                            const startTime = Date.now();
                            StructuredLogger.info(`Executing tool: ${call.name}`, this.userId, this.sessionId);
                            try {
                                const result = await Promise.race([
                                    tool.execute(tool.schema.parse(call.args), this.userId),
                                    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000))
                                ]);
                                StructuredLogger.logToolExecution(call.name, this.userId, this.sessionId, Date.now() - startTime, true);
                                return { functionResponse: { name: call.name, response: { result } } };
                            }
                            catch (err) {
                                StructuredLogger.logToolExecution(call.name, this.userId, this.sessionId, Date.now() - startTime, false, { error: err.message });
                                return { functionResponse: { name: call.name, response: { error: 'Failed: ' + err.message } } };
                            }
                        }));
                        this.history.push({
                            role: 'model',
                            parts: pendingFunctionCalls.map(c => ({ functionCall: { name: c.name, args: c.args } }))
                        });
                        this.history.push({ role: 'user', parts: toolResults.map(r => ({ functionResponse: r.functionResponse })) });
                        iterationCount++;
                    }
                    else {
                        break;
                    }
                }
                catch (apiError) {
                    StructuredLogger.error('Gemini API call failed', this.userId, this.sessionId, {
                        error: apiError.message,
                        stack: apiError.stack,
                        historyLength: this.history.length
                    });
                    throw apiError; // Re-throw to be caught by outer catch
                }
            }
            StructuredLogger.info('Generation complete', this.userId, this.sessionId, { finalResponseLength: finalResponse.length });
            onEvent(WebSocketEventTypes.RESPONSE_COMPLETE, { fullText: finalResponse, sessionId: this.sessionId });
        }
        catch (error) {
            if (error.name === 'AbortError')
                return;
            StructuredLogger.error('Generation failed', this.userId, this.sessionId, { error: error.message, stack: error.stack });
            onEvent(WebSocketEventTypes.ERROR, { message: 'Generation failed: ' + error.message });
        }
        finally {
            this.currentAbortController = null;
        }
    }
    async cleanup() {
        this.history = [];
        await this.cancel();
    }
}
