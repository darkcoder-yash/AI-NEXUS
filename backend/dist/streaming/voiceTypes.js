/**
 * voiceTypes.ts
 * Shared types for the voice interaction protocol.
 */
export var VoiceState;
(function (VoiceState) {
    VoiceState["IDLE"] = "IDLE";
    VoiceState["LISTENING"] = "LISTENING";
    VoiceState["TRANSCRIBING"] = "TRANSCRIBING";
    VoiceState["GENERATING"] = "GENERATING";
    VoiceState["SPEAKING"] = "SPEAKING";
    VoiceState["ERROR"] = "ERROR";
})(VoiceState || (VoiceState = {}));
export var VoiceEventType;
(function (VoiceEventType) {
    VoiceEventType["STATE_CHANGE"] = "VOICE_STATE_CHANGE";
    VoiceEventType["AUDIO_CHUNK"] = "VOICE_AUDIO_CHUNK";
    VoiceEventType["TRANSCRIPTION"] = "VOICE_TRANSCRIPTION";
    VoiceEventType["TTS_CHUNK"] = "VOICE_TTS_CHUNK";
    VoiceEventType["INTERRUPT"] = "VOICE_INTERRUPT";
})(VoiceEventType || (VoiceEventType = {}));
/**
 * Example WebSocket Message Schemas:
 *
 * Client -> Server (Binary): [Raw Audio Buffer]
 * Client -> Server (JSON): { "type": "VOICE_INTERRUPT", "sessionId": "..." }
 *
 * Server -> Client (JSON): { "type": "VOICE_TRANSCRIPTION", "payload": { "text": "Hello", "isFinal": false } }
 * Server -> Client (Binary): [TTS Audio Data Chunk]
 */
