import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Languages, Radio, Settings2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect, useRef, useCallback } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

export function VoicePanel() {
  const { voiceActive, setVoiceActive, ttsEnabled, setTtsEnabled } = useAppStore();
  const [wakeWord, setWakeWord] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef(false);

  // Handle incoming voice messages from backend
  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.VOICE_TRANSCRIPTION:
          // Add transcription from backend
          setTranscription((prev) => prev + ' ' + message.payload.text);
          break;
          
        case WebSocketEventTypes.VOICE_RESPONSE_AUDIO:
          // Play audio response from backend
          if (ttsEnabled && message.payload.audioData) {
            playAudioResponse(message.payload.audioData);
          }
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    nexusWS.connect();

    return () => {
      unsubscribe();
    };
  }, [ttsEnabled]);

  // Audio playback function
  const playAudioResponse = useCallback(async (audioData: string) => {
    try {
      // Convert base64 to audio and play
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[VoicePanel] Error playing audio:', err);
    }
  }, []);

  // Start voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      isRecordingRef.current = true;
      setVoiceActive(true);
      
      // Start sending audio chunks to backend
      sendAudioChunks();
    } catch (err) {
      console.error('[VoicePanel] Error starting recording:', err);
    }
  }, [setVoiceActive]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    isRecordingRef.current = false;
    setVoiceActive(false);
  }, [setVoiceActive]);

  // Toggle voice recording
  const toggleVoice = useCallback(() => {
    if (voiceActive) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [voiceActive, startRecording, stopRecording]);

  // Send audio chunks to backend
  const sendAudioChunks = useCallback(() => {
    if (!mediaStreamRef.current || !isRecordingRef.current) return;

    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
      mimeType: 'audio/webm;codecs=opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && nexusWS && nexusWS.isConnected()) {
        // Convert to ArrayBuffer and send
        event.data.arrayBuffer().then((buffer) => {
          nexusWS.sendAudio(buffer);
        });
      }
    };

    mediaRecorder.start(250); // Send chunks every 250ms

    // Clean up on stop
    const originalStop = mediaRecorder.stop;
    mediaRecorder.stop = function() {
      originalStop.apply(this);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center gap-3 mb-2">
        <Mic className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Voice Interaction</h2>
      </div>

      {/* Mic Visualizer */}
      <GlassPanel neon={voiceActive ? 'blue' : 'none'} className="p-8 flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            animate={voiceActive ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full bg-primary/20"
            style={{ margin: '-20px' }}
          />
          <motion.div
            animate={voiceActive ? { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-primary/10"
            style={{ margin: '-40px' }}
          />
          <button
            onClick={toggleVoice}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              voiceActive ? 'bg-primary neon-glow-blue' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {voiceActive ? <Mic className="w-8 h-8 text-primary-foreground" /> : <MicOff className="w-8 h-8 text-muted-foreground" />}
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{voiceActive ? 'Listening...' : 'Tap to activate'}</p>
          <p className="text-xs text-muted-foreground mt-1">{voiceActive ? 'Speak naturally' : 'Voice input inactive'}</p>
        </div>

        {/* Waveform */}
        {voiceActive && (
          <div className="flex items-center gap-1 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                className="w-1 bg-primary rounded-full"
              />
            ))}
          </div>
        )}
      </GlassPanel>

      {/* Transcription Display */}
      {transcription && (
        <GlassPanel className="p-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Transcription</h3>
          <p className="text-sm">{transcription}</p>
        </GlassPanel>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <GlassPanel className="p-4 space-y-3">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-3 h-3" /> Input
          </h3>
          <ToggleRow label="Continuous" active={continuous} onToggle={() => setContinuous(!continuous)} />
          <ToggleRow label="Wake Word" active={wakeWord} onToggle={() => setWakeWord(!wakeWord)} />
        </GlassPanel>
        <GlassPanel className="p-4 space-y-3">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-3 h-3" /> Output
          </h3>
          <ToggleRow label="TTS" active={ttsEnabled} onToggle={() => setTtsEnabled(!ttsEnabled)} />
          <div className="flex items-center gap-2">
            <Languages className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs">English (US)</span>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function ToggleRow({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={onToggle}
        className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${active ? 'bg-primary' : 'bg-muted'}`}
      >
        <motion.div
          animate={{ x: active ? 18 : 2 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground"
        />
      </button>
    </div>
  );
}

