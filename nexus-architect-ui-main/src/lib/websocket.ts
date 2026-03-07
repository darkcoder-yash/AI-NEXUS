import { create } from 'zustand';

// Type definitions for the store
interface WebSocketStore {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  setIsConnected: (v: boolean) => void;
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

// Create the store instance for use outside of React components
export const useAppStoreOut = create<WebSocketStore>((set) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  setIsConnected: (v: boolean) => set({ isConnected: v }),
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => set({ connectionStatus: status }),
}));

export enum WebSocketEventTypes {
  CLIENT_MESSAGE = 'CLIENT_MESSAGE',
  SERVER_RESPONSE = 'SERVER_RESPONSE',
  ERROR = 'ERROR',
  RESPONSE_START = 'RESPONSE_START',
  RESPONSE_TOKEN = 'RESPONSE_TOKEN',
  RESPONSE_COMPLETE = 'RESPONSE_COMPLETE',
  FUNCTION_CALL_DETECTED = 'FUNCTION_CALL_DETECTED',
  PLAN_GENERATED = 'PLAN_GENERATED',
  STEP_UPDATE = 'STEP_UPDATE',
  TOKEN_USAGE = 'TOKEN_USAGE',
  // Voice & Interaction Control
  VOICE_AUDIO_CHUNK = 'VOICE_AUDIO_CHUNK',
  VOICE_TRANSCRIPTION = 'VOICE_TRANSCRIPTION',
  VOICE_INTERRUPT = 'VOICE_INTERRUPT',
  VOICE_RESPONSE_START = 'VOICE_RESPONSE_START',
  VOICE_RESPONSE_AUDIO = 'VOICE_RESPONSE_AUDIO',
  CANCEL_REQUEST = 'CANCEL_REQUEST',
  AUTH = 'AUTH',
}

export interface ServerToClientMessage {
  type: WebSocketEventTypes;
  payload: any;
  timestamp: string;
}

type MessageHandler = (message: ServerToClientMessage) => void;

// Callback for auth events
type AuthHandler = (sessionId: string) => void;

/**
 * NexusWebSocket Manager - Connects nexus-architect-ui-main to backend
 * Communicates with backend WebSocket server on port 4001
 */
export class NexusWebSocket {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private authHandlers: Set<AuthHandler> = new Set();
  private reconnectTimeout: number = 3000;
  private url: string;
  private isAuthenticated: boolean = false;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(url: string = 'ws://localhost:4001') {
    this.url = url;
    // Don't auto-connect in constructor - wait for explicit connection
  }

  private authRetryTimeout: any = null;

  // Update store connection status
  private setConnectionStatus = (status: 'disconnected' | 'connecting' | 'connected') => {
    this.connectionStatus = status;
    useAppStoreOut.getState().setConnectionStatus(status);
  };

  // Update store connected status
  private setIsConnected = (connected: boolean) => {
    useAppStoreOut.getState().setIsConnected(connected);
  };

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      console.log('[NexusWS] Already connecting or connected');
      return;
    }

    console.log('[NexusWS] Attempting to connect to:', this.url);
    this.setConnectionStatus('connecting');
    
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[NexusWS] Connected to backend');
        this.setConnectionStatus('connected');
        this.reconnectAttempts = 0;
        // Authenticate immediately after connection
        this.authenticate();
      };
      
      this.socket.onmessage = (event) => {
        try {
          // Skip empty messages
          if (!event.data || event.data.length === 0) {
            console.warn('[NexusWS] Empty message received, skipping');
            return;
          }
          
          const message: ServerToClientMessage = JSON.parse(event.data);
          console.log('[NexusWS] Incoming:', message.type, message.payload);
          
          if (message.type === WebSocketEventTypes.SERVER_RESPONSE) {
            if (message.payload.sessionId || message.payload.message === "Authenticated successfully") {
              console.log('[NexusWS] Auth confirmed');
              clearTimeout(this.authRetryTimeout);
              this.sessionId = message.payload.sessionId || this.sessionId || 'authorized-session';
              this.isAuthenticated = true;
              // Update the store with connection status
              this.setIsConnected(true);
              this.authHandlers.forEach(handler => handler(this.sessionId!));
            }
          }
          
          this.handlers.forEach((handler) => handler(message));
        } catch (err: any) { 
          console.error('[NexusWS] Message handle error:', err); 
        }
      };

      this.socket.onclose = (event) => {
        console.warn('[NexusWS] Disconnected', event.code, event.reason);
        this.cleanup();
        
        // Auto-reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectTimeout * this.reconnectAttempts;
          console.log(`[NexusWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
          setTimeout(() => this.connect(), delay);
        } else {
          console.error('[NexusWS] Max reconnect attempts reached');
        }
      };

      this.socket.onerror = (error) => {
        console.error('[NexusWS] WebSocket Error:', error);
      };
    } catch (error) {
      console.error('[NexusWS] Failed to create WebSocket:', error);
      this.setConnectionStatus('disconnected');
    }
  }

  private cleanup() {
    clearTimeout(this.authRetryTimeout);
    this.setConnectionStatus('disconnected');
    this.isAuthenticated = false;
    this.setIsConnected(false);
    this.sessionId = null;
  }

  private authenticate() {
    console.log('[NexusWS] Sending AUTH message...');
    this.send(WebSocketEventTypes.AUTH, { token: "STRESS_TEST_TOKEN" });
    
    // Retry auth if no response in 3 seconds
    clearTimeout(this.authRetryTimeout);
    this.authRetryTimeout = setTimeout(() => {
      if (this.connectionStatus === 'connected' && !this.isAuthenticated) {
        console.warn('[NexusWS] Auth timeout, retrying...');
        this.authenticate();
      }
    }, 3000);
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  getSessionId() {
    return this.sessionId;
  }

  isConnected() {
    return this.connectionStatus === 'connected' && this.isAuthenticated;
  }

  onAuthenticated(handler: AuthHandler) {
    this.authHandlers.add(handler);
    // If already authenticated, call handler immediately
    if (this.sessionId) {
      handler(this.sessionId);
    }
    return () => this.authHandlers.delete(handler);
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(type: WebSocketEventTypes | string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[NexusWS] Cannot send message - not connected', type);
    }
  }

  sendAudio(chunk: ArrayBuffer) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(chunk);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Singleton instance - export for use throughout the app
export const nexusWS = typeof window !== 'undefined' ? new NexusWebSocket() : null;

