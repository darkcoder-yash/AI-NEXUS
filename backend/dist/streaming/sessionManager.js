import { GeminiStreamer } from './geminiStreamer.js';
/**
 * SessionManager tracks active sessions and their corresponding streaming states.
 * It prevents parallel streams and handles cancellations/timeouts.
 */
export class SessionManager {
    sessions = new Map();
    streamer = new GeminiStreamer();
    DEFAULT_TIMEOUT = 30000; // 30 seconds
    /**
     * Registers a new session.
     */
    createSession(sessionId) {
        this.sessions.set(sessionId, {
            id: sessionId,
            abortController: null,
            timeoutId: null,
            isStreaming: false,
        });
    }
    /**
     * Removes a session and cleans up resources.
     */
    removeSession(sessionId) {
        this.cancelActiveStream(sessionId);
        this.sessions.delete(sessionId);
    }
    /**
     * Initiates a streaming request for a session.
     */
    async startStream(sessionId, prompt, onEvent) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        // Prevent parallel streams
        if (session.isStreaming) {
            this.cancelActiveStream(sessionId);
        }
        session.isStreaming = true;
        session.abortController = new AbortController();
        // Set timeout protection
        session.timeoutId = setTimeout(() => {
            console.log(`[SessionManager] Stream timeout for session ${sessionId}`);
            onEvent('stream_error', { message: 'Stream timed out' });
            this.cancelActiveStream(sessionId);
        }, this.DEFAULT_TIMEOUT);
        try {
            await this.streamer.stream(prompt, session.abortController.signal, {
                onToken: (token) => {
                    onEvent('stream_token', { token });
                },
                onEnd: (fullText) => {
                    this.clearCleanup(session);
                    onEvent('stream_end', { fullText });
                },
                onError: (error) => {
                    this.clearCleanup(session);
                    onEvent('stream_error', {
                        message: error.message === 'STREAM_CANCELLED' ? 'Cancelled by user' : 'Internal error'
                    });
                }
            });
        }
        catch (err) {
            console.error('[SessionManager] Streaming error:', err);
            onEvent('stream_error', { message: 'Stream initiation failed' });
            this.clearCleanup(session);
        }
    }
    /**
     * Manually cancels an active stream.
     */
    cancelActiveStream(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session && session.abortController) {
            session.abortController.abort();
            this.clearCleanup(session);
        }
    }
    /**
     * Cleans up timers and flags after stream completion or error.
     */
    clearCleanup(session) {
        if (session.timeoutId) {
            clearTimeout(session.timeoutId);
            session.timeoutId = null;
        }
        session.isStreaming = false;
        session.abortController = null;
    }
}
