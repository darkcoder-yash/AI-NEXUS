import { z } from 'zod';

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

export const ClientToServerMessageSchema = z.object({
  type: z.nativeEnum(WebSocketEventTypes),
  payload: z.record(z.any()),
});

export type ClientToServerMessage = z.infer<typeof ClientToServerMessageSchema>;

export interface ServerToClientMessage {
  type: WebSocketEventTypes;
  payload: any;
  timestamp: string;
}

export interface Session {
  id: string;
  connectedAt: Date;
}
