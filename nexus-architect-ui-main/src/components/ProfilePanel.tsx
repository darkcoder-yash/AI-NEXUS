import { User, Palette, Sliders, Languages, RefreshCw, LogOut, Shield, ShieldCheck, UserCog } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';
import { useAuthStore } from '@/store/useAuthStore';

export function ProfilePanel() {
  const { user, logout } = useAuthStore();
  const [creativity, setCreativity] = useState(70);
  const [verbosity, setVerbosity] = useState(50);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [responseStyle, setResponseStyle] = useState<string[]>(['Technical', 'Concise']);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          if (message.payload.personalitySettings) {
            const settings = message.payload.personalitySettings;
            if (settings.creativity) setCreativity(settings.creativity);
            if (settings.verbosity) setVerbosity(settings.verbosity);
            if (settings.responseStyle) setResponseStyle(settings.responseStyle);
          }
          setIsSaving(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    nexusWS.connect();
    
    const checkConnection = setInterval(() => {
      setIsConnected(nexusWS?.isConnected() || false);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  const savePersonalitySettings = () => {
    if (!nexusWS || !isConnected) return;
    setIsSaving(true);
    nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
      text: `/settings personality --creativity ${creativity} --verbosity ${verbosity}`,
      personalitySettings: { creativity, verbosity, responseStyle }
    });
  };

  const toggleResponseStyle = (style: string) => {
    const newStyles = responseStyle.includes(style)
      ? responseStyle.filter(s => s !== style)
      : [...responseStyle, style];
    setResponseStyle(newStyles);
    savePersonalitySettings();
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N';
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-background/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <UserCog className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Identity & Behavioral Core</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">User Profile & AI Alignment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
            {isConnected ? 'SYNC_STABLE' : 'OFFLINE_CACHE'}
          </span>
        </div>
      </div>

      {/* User Card */}
      <GlassPanel className="p-8 flex flex-col md:flex-row items-center gap-8 border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Shield className="w-32 h-32" />
        </div>
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border border-primary/20 shadow-inner">
          {getInitials(user?.name || 'Nexus User')}
        </div>
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h3 className="text-2xl font-bold tracking-tight">{user?.name || 'Nexus User'}</h3>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{user?.email || 'user@example.com'}</p>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest">{user?.plan || 'Pro Plan'}</span>
            <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/10 font-bold uppercase tracking-widest">{user?.role || 'Operator'}</span>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Personality */}
        <GlassPanel className="p-6 space-y-6 border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Neural Personality Matrix</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Synthesized Creativity</span>
                <span className="font-mono text-primary font-bold">{creativity}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={creativity} 
                onChange={(e) => { setCreativity(+e.target.value); savePersonalitySettings(); }}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Output Verbosity</span>
                <span className="font-mono text-primary font-bold">{verbosity}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={verbosity} 
                onChange={(e) => { setVerbosity(+e.target.value); savePersonalitySettings(); }}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/5 text-xs text-muted-foreground">
            <Languages className="w-4 h-4" />
            <span>PRIMARY_LOCALE: <span className="text-foreground font-bold">ENGLISH_US</span></span>
          </div>
        </GlassPanel>

        {/* Response Style */}
        <GlassPanel className="p-6 space-y-6 border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Output Modulation Styles</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Concise', 'Technical', 'Friendly', 'Formal', 'Creative', 'Analytic'].map((style) => (
              <button
                key={style}
                onClick={() => toggleResponseStyle(style)}
                className={`text-[10px] px-4 py-2.5 rounded-xl border font-bold uppercase tracking-widest transition-all ${
                  responseStyle.includes(style)
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                    : 'border-white/5 hover:border-white/20 hover:bg-white/5 text-muted-foreground'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Footer Actions */}
      <GlassPanel className="p-4 border-white/5 flex justify-center">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 transition-all px-6 py-2 rounded-xl hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Terminate Secure Session
        </button>
      </GlassPanel>
    </div>
  );
}
