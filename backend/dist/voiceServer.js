import { WebSocket } from 'ws';
import { WebSocketEventTypes } from './types.js';
import { StreamManager } from './streamManager.js';
/**
 * Handles specialized Voice-over-WebSocket logic.
 * This class maps binary audio streams and voice events from the WebSocket
 * to the StreamManager's internal orchestration.
 */
export class VoiceServer {
    ws;
    streamManager;
    constructor(ws, agent) {
        this.ws = ws;
        this.streamManager = new StreamManager(agent, (type, payload) => {
            this.sendToClient(type, payload);
        });
    }
    /**
     * Main dispatcher for messages arriving via WebSocket.
     */
    async handleMessage(data) {
        // 1. Check for Binary (Audio)
        if (Buffer.isBuffer(data)) {
            // Binary chunks are treated as real-time audio from the microphone
            this.streamManager.handleAudioChunk(data);
            return;
        }
        // 2. Check for JSON (Events)
        try {
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case WebSocketEventTypes.VOICE_TRANSCRIPTION:
                    // Frontend has finished transcription and is sending the final text
                    await this.streamManager.processUserUtterance(message.payload.text);
                    break;
                case WebSocketEventTypes.VOICE_INTERRUPT:
                    // Frontend detected user speech start while AI was talking
                    this.streamManager.cancelCurrentStream();
                    break;
                default:
                    // Other events handled by default server logic or ignored here
                    break;
            }
        }
        catch (err) {
            // Not JSON, or other error. Ignore for binary-heavy streams.
        }
    }
    /**
     * Helper to send JSON messages back to the client.
     */
    sendToClient(type, payload) {
        if (this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(JSON.stringify({
            type,
            payload,
            timestamp: new Date().toISOString()
        }));
    }
    /**
     * Helper to send binary audio data (TTS output) back to the client.
     */
    sendAudioToClient(audioBuffer) {
        if (this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(audioBuffer);
    }
}
