import { z } from 'zod';
export var WebSocketEventTypes;
(function (WebSocketEventTypes) {
    WebSocketEventTypes["CLIENT_MESSAGE"] = "CLIENT_MESSAGE";
    WebSocketEventTypes["SERVER_RESPONSE"] = "SERVER_RESPONSE";
    WebSocketEventTypes["ERROR"] = "ERROR";
    WebSocketEventTypes["RESPONSE_START"] = "RESPONSE_START";
    WebSocketEventTypes["RESPONSE_TOKEN"] = "RESPONSE_TOKEN";
    WebSocketEventTypes["RESPONSE_COMPLETE"] = "RESPONSE_COMPLETE";
    WebSocketEventTypes["FUNCTION_CALL_DETECTED"] = "FUNCTION_CALL_DETECTED";
    WebSocketEventTypes["PLAN_GENERATED"] = "PLAN_GENERATED";
    WebSocketEventTypes["STEP_UPDATE"] = "STEP_UPDATE";
    WebSocketEventTypes["TOKEN_USAGE"] = "TOKEN_USAGE";
    // Voice & Interaction Control
    WebSocketEventTypes["VOICE_AUDIO_CHUNK"] = "VOICE_AUDIO_CHUNK";
    WebSocketEventTypes["VOICE_TRANSCRIPTION"] = "VOICE_TRANSCRIPTION";
    WebSocketEventTypes["VOICE_INTERRUPT"] = "VOICE_INTERRUPT";
    WebSocketEventTypes["VOICE_RESPONSE_START"] = "VOICE_RESPONSE_START";
    WebSocketEventTypes["VOICE_RESPONSE_AUDIO"] = "VOICE_RESPONSE_AUDIO";
    WebSocketEventTypes["CANCEL_REQUEST"] = "CANCEL_REQUEST";
    WebSocketEventTypes["AUTH"] = "AUTH";
})(WebSocketEventTypes || (WebSocketEventTypes = {}));
export const ClientToServerMessageSchema = z.object({
    type: z.nativeEnum(WebSocketEventTypes),
    payload: z.record(z.any()),
});
