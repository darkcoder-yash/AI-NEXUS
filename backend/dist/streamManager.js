import { WebSocketEventTypes } from './types.js';
/**
 * StreamManager orchestrates the real-time voice pipeline.
 * It coordinates STT, Gemini Agent interactions, and TTS responses.
 */
export class StreamManager {
    agent;
    onEvent;
    currentResponseController = null;
    isProcessingVoice = false;
    constructor(agent, onEvent) {
        this.agent = agent;
        this.onEvent = onEvent;
    }
    /**
     * Processes a complete user utterance.
     */
    async processUserUtterance(text) {
        if (this.isProcessingVoice) {
            console.log('[StreamManager] Interrupted! Cancelling current stream.');
            this.cancelCurrentStream();
        }
        this.isProcessingVoice = true;
        this.currentResponseController = new AbortController();
        try {
            this.onEvent(WebSocketEventTypes.VOICE_RESPONSE_START, {});
            // Call Gemini and handle tokens for TTS streaming
            await this.agent.processMessage(text, async (type, payload) => {
                // Stop if cancelled
                if (this.currentResponseController?.signal.aborted)
                    return;
                // Forward normal text tokens to frontend
                this.onEvent(type, payload);
                // If it's a token, we theoretically would queue it for TTS
                // For production, we can stream sentences to TTS to reduce latency.
                if (type === WebSocketEventTypes.RESPONSE_TOKEN) {
                    // We'll handle TTS integration here or after complete response for simpler logic
                    // In a full implementation, we'd use a buffer to group tokens into sentences for smoother TTS.
                }
                if (type === WebSocketEventTypes.RESPONSE_COMPLETE) {
                    // Once text is complete, trigger TTS for the whole block or the last sentence.
                    await this.generateTTS(payload.fullText);
                }
            });
        }
        catch (err) {
            console.error('[StreamManager] Error processing utterance:', err);
            this.onEvent(WebSocketEventTypes.ERROR, { message: 'Voice processing failed' });
        }
        finally {
            this.isProcessingVoice = false;
        }
    }
    /**
     * Generates Speech from Text and streams it back.
     * Note: In production, you'd use Google Cloud TTS or similar.
     */
    async generateTTS(text) {
        try {
            // Placeholder for TTS logic. 
            // In a real implementation:
            // const audioContent = await googleCloudTTS.synthesize(text);
            // this.onEvent(WebSocketEventTypes.VOICE_RESPONSE_AUDIO, { audio: audioContent.toString('base64') });
            console.log(`[StreamManager] Synthesizing speech for: ${text.substring(0, 30)}...`);
            // For this task, we assume the frontend can do TTS via Web Speech API or we provide the base64 audio.
            // Let's mock a response event for demonstration of the flow.
            this.onEvent(WebSocketEventTypes.VOICE_RESPONSE_AUDIO, {
                // audio: <base64_data> 
                message: "TTS Audio Stream would be here"
            });
        }
        catch (err) {
            console.error('[StreamManager] TTS Error:', err);
        }
    }
    /**
     * Cancels the current Gemini generation and TTS playback.
     */
    cancelCurrentStream() {
        if (this.currentResponseController) {
            this.currentResponseController.abort();
            this.currentResponseController = null;
        }
        this.isProcessingVoice = false;
        this.onEvent(WebSocketEventTypes.VOICE_INTERRUPT, { reason: 'User started speaking' });
    }
    /**
     * Handles binary audio chunks from the frontend.
     * Typically passes them to an STT stream.
     */
    handleAudioChunk(chunk) {
        // 1. If we are currently outputting audio, this is an interruption.
        if (this.isProcessingVoice) {
            this.cancelCurrentStream();
        }
        // 2. Stream chunk to STT service (e.g., Google Cloud Speech-to-Text)
        // For now, we'll log receipt. In production, this would pipe to a SpeechClient.
        // console.log(`[StreamManager] Received audio chunk: ${chunk.length} bytes`);
    }
}
