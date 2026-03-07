/**
 * voiceTypes.ts
 * Shared types for the voice interaction protocol.
 */

export enum VoiceState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TRANSCRIBING = 'TRANSCRIBING',
  GENERATING = 'GENERATING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}

export enum VoiceEventType {
  STATE_CHANGE = 'VOICE_STATE_CHANGE',
  AUDIO_CHUNK = 'VOICE_AUDIO_CHUNK',
  TRANSCRIPTION = 'VOICE_TRANSCRIPTION',
  TTS_CHUNK = 'VOICE_TTS_CHUNK',
  INTERRUPT = 'VOICE_INTERRUPT'
}

export interface VoiceEvent {
  type: VoiceEventType;
  sessionId: string;
  payload: any;
  timestamp: string;
}

/**
 * Example WebSocket Message Schemas:
 * 
 * Client -> Server (Binary): [Raw Audio Buffer]
 * Client -> Server (JSON): { "type": "VOICE_INTERRUPT", "sessionId": "..." }
 * 
 * Server -> Client (JSON): { "type": "VOICE_TRANSCRIPTION", "payload": { "text": "Hello", "isFinal": false } }
 * Server -> Client (Binary): [TTS Audio Data Chunk]
 */
