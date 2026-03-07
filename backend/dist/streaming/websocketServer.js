import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from './sessionManager.js';
/**
 * WebSocketServer implements the real-time event protocol for streaming.
 * Protocol:
 * - Client: { type: 'user_message', payload: { text: 'Hello' } }
 * - Client: { type: 'cancel' }
 * - Server: { type: 'stream_token', payload: { token: '...' } }
 * - Server: { type: 'stream_end', payload: { fullText: '...' } }
 * - Server: { type: 'stream_error', payload: { message: '...' } }
 */
export function initializeStreamingWebSocket(port) {
    const wss = new WebSocketServer({ port });
    const sessionManager = new SessionManager();
    console.log(`[WebSocket] Streaming server listening on port ${port}`);
    wss.on('connection', (ws) => {
        const sessionId = uuidv4();
        sessionManager.createSession(sessionId);
        console.log(`[WebSocket] New session: ${sessionId}`);
        ws.on('message', async (data) => {
            try {
                const rawMessage = data.toString();
                const message = JSON.parse(rawMessage);
                switch (message.type) {
                    case 'user_message':
                        if (message.payload?.text) {
                            await sessionManager.startStream(sessionId, message.payload.text, (type, payload) => {
                                send(ws, type, payload);
                            });
                        }
                        break;
                    case 'cancel':
                        sessionManager.cancelActiveStream(sessionId);
                        send(ws, 'stream_error', { message: 'Cancelled by user' });
                        break;
                    default:
                        console.warn(`[WebSocket] Unknown event type: ${message.type}`);
                }
            }
            catch (err) {
                console.error('[WebSocket] Parse error:', err);
                send(ws, 'stream_error', { message: 'Invalid message format' });
            }
        });
        ws.on('close', () => {
            console.log(`[WebSocket] Session closed: ${sessionId}`);
            sessionManager.removeSession(sessionId);
        });
    });
    return wss;
}
/**
 * Helper to send structured JSON messages back to the client.
 */
function send(ws, type, payload) {
    if (ws.readyState !== WebSocket.OPEN)
        return;
    ws.send(JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
    }));
}
