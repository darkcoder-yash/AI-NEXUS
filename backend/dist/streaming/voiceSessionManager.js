import { VoiceState, VoiceEventType } from './voiceTypes.js';
import { GeminiStreamer } from './geminiStreamer.js';
/**
 * VoiceSessionManager orchestrates the full-duplex voice lifecycle.
 * It manages state transitions and coordinates between STT, Gemini, and TTS.
 */
export class VoiceSessionManager {
    sessions = new Map();
    streamer;
    constructor() {
        this.streamer = new GeminiStreamer();
    }
    /**
     * Initializes a new session.
     */
    createSession(sessionId) {
        this.sessions.set(sessionId, {
            state: VoiceState.IDLE,
            sessionId,
            abortController: null,
        });
    }
    /**
     * Main state transition handler.
     */
    transition(sessionId, newState, onEvent) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        // Barge-In: If user starts speaking while we are in GENERATING or SPEAKING, INTERRUPT.
        if (newState === VoiceState.LISTENING && (session.state === VoiceState.GENERATING || session.state === VoiceState.SPEAKING)) {
            console.log(`[VoiceSession] Barge-In Detected for session ${sessionId}`);
            this.interrupt(sessionId, onEvent);
        }
        session.state = newState;
        onEvent(VoiceEventType.STATE_CHANGE, { state: newState });
    }
    /**
     * Interrupts any active generation or playback.
     */
    interrupt(sessionId, onEvent) {
        const session = this.sessions.get(sessionId);
        if (session && session.abortController) {
            session.abortController.abort();
            session.abortController = null;
        }
        onEvent(VoiceEventType.INTERRUPT, { message: 'Barge-In: Current stream cancelled' });
    }
    /**
     * Orchestrates the Gemini + TTS pipeline.
     */
    async processFinalTranscription(sessionId, text, onEvent) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        this.transition(sessionId, VoiceState.GENERATING, onEvent);
        session.abortController = new AbortController();
        try {
            // In a real implementation, we would pass tokens directly to the TTS Manager
            await this.streamer.stream(text, session.abortController.signal, {
                onToken: (token) => {
                    // Token forwarded to TTS (this would be where sentence bundling happens)
                    onEvent('stream_token', { token });
                },
                onEnd: (fullText) => {
                    this.transition(sessionId, VoiceState.SPEAKING, onEvent);
                    // TTS Complete Audio Generation (this would emit binary buffers in production)
                    onEvent(VoiceEventType.TTS_CHUNK, { message: 'TTS Generation Started' });
                },
                onError: (err) => {
                    if (err.message !== 'STREAM_CANCELLED') {
                        this.transition(sessionId, VoiceState.ERROR, onEvent);
                    }
                }
            });
        }
        catch (err) {
            console.error(`[VoiceSession] Error for ${sessionId}:`, err);
        }
    }
    removeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session?.abortController) {
            session.abortController.abort();
        }
        this.sessions.delete(sessionId);
    }
}
