import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Trash2, Mic, Zap, Terminal, Copy, Brain, Target, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlassPanel } from './GlassPanel';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage, useAppStoreOut } from '@/lib/websocket';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function CommandCenter() {
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const setIsGenerating = useAppStore((state) => state.setIsGenerating);
  const voiceActive = useAppStore((state) => state.voiceActive);
  const setVoiceActive = useAppStore((state) => state.setVoiceActive);
  const isConnected = useAppStore((state) => state.isConnected);
  const ttsEnabled = useAppStore((state) => state.ttsEnabled);
  
  const wsIsConnected = useAppStoreOut((state) => state.isConnected);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0 && nexusWS && isConnected) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            nexusWS.sendAudio(arrayBuffer);
          };
          reader.readAsArrayBuffer(audioBlob);
        }
      };
      
      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      setVoiceActive(true);
    } catch (err) {
      console.error('[CommandCenter] Voice Error:', err);
    }
  }, [setVoiceActive, isConnected]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    setVoiceActive(false);
  }, [setVoiceActive]);

  const toggleVoice = useCallback(() => {
    voiceActive ? stopRecording() : startRecording();
  }, [voiceActive, startRecording, stopRecording]);

  const speakNextInQueue = useCallback(() => {
    if (!ttsEnabled || isSpeakingRef.current || speechQueueRef.current.length === 0) return;
    const nextText = speechQueueRef.current.shift();
    if (!nextText) return;
    isSpeakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(nextText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.1;
    utterance.onend = () => { isSpeakingRef.current = false; speakNextInQueue(); };
    utterance.onerror = () => { isSpeakingRef.current = false; speakNextInQueue(); };
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const queueForSpeech = useCallback((text: string) => {
    if (!ttsEnabled) return;
    speechQueueRef.current.push(text);
    if (!isSpeakingRef.current) speakNextInQueue();
  }, [ttsEnabled, speakNextInQueue]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
  }, []);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isGenerating) return;
    
    setInput('');
    
    addMessage({ role: 'user', content: text });
    
    if (nexusWS) {
      if (!nexusWS.isConnected()) {
        addMessage({ 
          role: 'assistant', 
          content: 'Reconnecting to AI NEXUS Core...' 
        });
        
        nexusWS.onAuthenticated(() => {
          setIsGenerating(true);
          nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, { text });
        });
        
        nexusWS.connect();
        return;
      }
      
      setIsGenerating(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, { text });
    }
  }, [input, isGenerating, addMessage, setIsGenerating]);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.RESPONSE_START:
          setIsGenerating(true);
          setStreamingContent('');
          streamingContentRef.current = '';
          stopSpeech();
          break;
          
        case WebSocketEventTypes.RESPONSE_TOKEN:
          const token = message.payload.token;
          streamingContentRef.current += token;
          setStreamingContent(streamingContentRef.current);
          break;
          
        case WebSocketEventTypes.RESPONSE_COMPLETE:
          const finalContent = message.payload.fullText || streamingContentRef.current;
          if (finalContent) {
            addMessage({ role: 'assistant', content: finalContent });
            if (ttsEnabled) queueForSpeech(finalContent);
          }
          setStreamingContent('');
          streamingContentRef.current = '';
          setIsGenerating(false);
          break;
          
        case WebSocketEventTypes.VOICE_TRANSCRIPTION:
          if (message.payload.text) {
            setInput(message.payload.text);
            setTimeout(() => handleSend(), 500);
          }
          break;
          
        case WebSocketEventTypes.ERROR:
          addMessage({ role: 'assistant', content: `Core Error: ${message.payload.message}` });
          setStreamingContent('');
          streamingContentRef.current = '';
          setIsGenerating(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    if (!nexusWS.isConnected()) {
      nexusWS.connect();
    }
    
    return () => {
      unsubscribe();
    };
  }, [addMessage, setIsGenerating, ttsEnabled, queueForSpeech, stopSpeech, handleSend]);

  const handleCancel = useCallback(() => {
    if (nexusWS && isConnected) {
      nexusWS.send(WebSocketEventTypes.CANCEL_REQUEST, {});
    }
    setStreamingContent('');
    streamingContentRef.current = '';
    setIsGenerating(false);
  }, [setIsGenerating, isConnected]);

  return (
    <div className="flex flex-col h-full bg-background dark:bg-[#0f172a]/30 backdrop-blur-xl transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border dark:border-white/5 bg-background/80 dark:bg-black/20 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground tracking-tight">Decision Assistant</h2>
            <p className="text-[8px] text-primary font-bold uppercase tracking-[0.2em]">NEXUS_Core</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse" />
            <span className="text-[10px] font-bold text-teal-500 tracking-wider">ONLINE</span>
          </div>
          <button onClick={clearMessages} className="p-2 rounded-lg hover:bg-muted dark:hover:bg-white/5 transition-colors text-muted-foreground" title="Clear Context">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
              <Terminal className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">AI NEXUS Intelligence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8 max-w-xs">
              Directives accepted. Neural link synchronized. How shall we optimize your architecture today?
            </p>
            
            <div className="grid grid-cols-1 gap-3 w-full">
              {[
                { title: "Simulate Project Growth", query: "Simulate the outcome of my current AI NEXUS project over the next 3 months." },
                { title: "Analyze Cognitive Load", query: "Based on my task list, estimate my cognitive workload for this afternoon." },
                { title: "Discover Productivity Patterns", query: "Find my peak productivity windows based on last week's activity." },
                { title: "Architectural Review", query: "Review the system architecture of the current project and suggest optimizations." }
              ].map((demo, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(demo.query)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card dark:bg-white/5 border border-border dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Target className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{demo.title}</div>
                    <div className="text-[9px] text-muted-foreground line-clamp-1">{demo.query}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground font-semibold ml-8' 
                  : 'bg-card dark:bg-white/5 border border-border dark:border-white/10 text-foreground mr-8'
                }`}
              >
                <div className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.role === 'user' ? 'USER' : 'NEXUS'}
                </div>
                
                <div className="markdown-content font-medium text-[13px]">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        return !inline ? (
                          <div className="my-3 rounded-xl overflow-hidden border border-border dark:border-white/10 bg-muted dark:bg-black/60">
                            <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed">
                              <code className={className} {...props}>{children}</code>
                            </pre>
                          </div>
                        ) : (
                          <code className="px-1 py-0.5 rounded bg-muted dark:bg-white/10 font-mono text-[11px] text-primary" {...props}>{children}</code>
                        );
                      },
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-base font-black mb-3 mt-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-black mb-2 mt-1">{children}</h2>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streamingContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-card dark:bg-white/5 border border-border dark:border-white/10 text-foreground mr-8 shadow-sm">
              <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-2 text-primary animate-pulse">STREAMING</div>
              <div className="markdown-content font-medium text-[13px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        {isGenerating && !streamingContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground ml-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Syncing</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border dark:border-white/5 bg-background dark:bg-black/20">
        <GlassPanel neon={voiceActive ? 'blue' : (isGenerating ? 'orange' : 'none')} animate={voiceActive || isGenerating} className="flex items-center gap-2 p-1.5 rounded-2xl border-border dark:border-white/10 shadow-lg bg-muted/50 dark:bg-white/5">
          <button 
            onClick={toggleVoice}
            className={`p-3 rounded-xl transition-all duration-300 ${voiceActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted dark:hover:bg-white/10 text-muted-foreground'}`}
          >
            <Mic className={`w-4 h-4 ${voiceActive ? 'animate-pulse' : ''}`} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={voiceActive ? "Listening..." : "Message AI NEXUS..."}
            className="flex-1 bg-transparent text-sm outline-none px-2 py-2 text-foreground placeholder:text-muted-foreground font-semibold tracking-tight"
          />
          {isGenerating ? (
            <button onClick={handleCancel} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20">
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()} className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-20 shadow-md">
              <Send className="w-4 h-4" />
            </button>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
