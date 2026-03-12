import { Settings, Thermometer, Hash, Database, Code2, Bug, RefreshCw, Cpu, Activity, Globe, Sun, Moon } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';
import { useTheme } from 'next-themes';

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [debugMode, setDebugMode] = useState(false);
  const [model, setModel] = useState('gemini-2.5-flash');
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          if (message.payload.settings) {
            const settings = message.payload.settings;
            if (settings.model) setModel(settings.model);
            if (settings.temperature) setTemperature(settings.temperature);
            if (settings.maxTokens) setMaxTokens(settings.maxTokens);
          }
          setIsSaving(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    if (!nexusWS.isConnected()) {
      nexusWS.connect();
    }
    
    const checkConnection = setInterval(() => {
      setIsConnected(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  const saveSettings = () => {
    if (!nexusWS) return;
    setIsSaving(true);
    nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
      text: `/settings update --model ${model} --temperature ${temperature} --max-tokens ${maxTokens}`,
      settings: { model, temperature, maxTokens }
    });
  };

  const updateModel = (newModel: string) => { setModel(newModel); saveSettings(); };
  const updateTemperature = (newTemp: number) => { setTemperature(newTemp); saveSettings(); };
  const updateMaxTokens = (newTokens: number) => { setMaxTokens(newTokens); saveSettings(); };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-background/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">System Configuration</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Core Parameters & Logic</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-green-500/10 text-green-500 border-green-500/20`}>
            NODE_ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Config */}
        <GlassPanel className="p-6 space-y-6 border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Neural Engine Selection</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Primary Intelligence Model</label>
              <select
                value={model}
                onChange={(e) => updateModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Optimized)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Legacy)</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-medium"><Thermometer className="w-4 h-4 text-primary/50" /> Entropy (Temp)</span>
                <span className="font-mono text-primary font-bold">{temperature}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" value={temperature} 
                onChange={(e) => updateTemperature(+e.target.value)}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-medium"><Hash className="w-4 h-4 text-primary/50" /> Context Token Limit</span>
                <span className="font-mono text-primary font-bold">{maxTokens}</span>
              </div>
              <input 
                type="range" min="256" max="32768" step="256" value={maxTokens} 
                onChange={(e) => updateMaxTokens(+e.target.value)}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </GlassPanel>

        {/* System Metadata */}
        <div className="space-y-6">
          <GlassPanel className="p-6 space-y-4 border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-primary" />
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Appearance Mode</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm font-medium">Theme Selection</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-widest"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-4 border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Memory Architecture</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Context Window', value: '1M Tokens', status: 'Optimal' },
                { label: 'Retrieval Strategy', value: 'Vector Semantic', status: 'Active' },
                { label: 'Persistence Layer', value: 'Supabase PGVector', status: 'Enabled' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="text-right">
                    <p className="font-bold">{item.value}</p>
                    <p className="text-[9px] text-primary uppercase tracking-widest font-bold">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-4 border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Developer Protocol</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bug className="w-4 h-4 text-primary/50" />
                <span className="text-sm font-medium">Debug Mode Override</span>
              </div>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`w-10 h-5 rounded-full transition-all duration-500 relative ${debugMode ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-foreground transition-all duration-300 ${debugMode ? 'translate-x-[24px]' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 font-mono text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ENDPOINT:</span>
                <span className="text-primary">ws://localhost:4001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PROTOCOL:</span>
                <span className="text-primary">NEXUS_V2_STREAM</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
