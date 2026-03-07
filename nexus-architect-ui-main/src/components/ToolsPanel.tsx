import { motion } from 'framer-motion';
import { Wrench, Play, Search, Globe, Calculator, Mail, FileText, CheckSquare, FileSearch, Code, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { useAppStore, Tool } from '@/store/useAppStore';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

const iconMap: Record<string, any> = {
  Search, Globe, Calculator, Mail, FileText, CheckSquare, FileSearch, Code,
};

const backendToolIcons: Record<string, string> = {
  'web_search': 'Search',
  'url_fetcher': 'Globe',
  'calculator': 'Calculator',
  'email_draft': 'Mail',
  'file_reader': 'FileText',
  'task_creator': 'CheckSquare',
  'doc_analyzer': 'FileSearch',
  'code_runner': 'Code',
};

export function ToolsPanel() {
  const { tools, toggleTool, setTools } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          if (message.payload.tools) {
            setTools(message.payload.tools);
          }
          setIsLoading(false);
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
  }, [setTools]);

  const runTool = (tool: Tool) => {
    if (!nexusWS || !isConnected) return;
    setIsLoading(true);
    nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
      text: `/tool ${tool.name.toLowerCase().replace(' ', '_')}`,
      toolId: tool.id
    });
  };

  const refreshTools = () => {
    if (nexusWS && isConnected) {
      setIsLoading(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
        text: '/tools list',
        requestTools: true
      });
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-background/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">System Toolsets</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Interface Capabilities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshTools}
            disabled={isLoading || !isConnected}
            className="p-2.5 rounded-xl hover:bg-white/5 border border-white/5 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <GlassPanel className="p-4 flex items-center justify-between border-white/10" animate={false}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Neural Bridge Status</span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${isConnected ? 'text-primary' : 'text-red-500'}`}>
          {isConnected ? 'STABLE_CONNECTION' : 'LINK_OFFLINE'}
        </span>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const iconName = backendToolIcons[tool.name.toLowerCase().replace(' ', '_')] || tool.icon;
          const Icon = iconMap[iconName] || Wrench;
          const isActive = tool.status === 'active';
          
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassPanel className={`p-5 h-full flex flex-col justify-between group transition-all duration-300 border-white/5 hover:border-primary/30 ${isActive ? '' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary/10 group-hover:bg-primary/20 border border-primary/20' : 'bg-white/5 border border-white/10'}`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-primary animate-float' : 'text-muted-foreground'}`} />
                    </div>
                    {isActive && <ShieldCheck className="w-4 h-4 text-primary/30" />}
                  </div>
                  <div>
                    <h3 className="text-md font-bold tracking-tight mb-1">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => toggleTool(tool.id)}
                    className={`flex-1 text-[9px] py-2 rounded-lg font-bold uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
                        : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isActive ? 'Active' : 'Offline'}
                  </button>
                  {isActive && (
                    <button 
                      onClick={() => runTool(tool)}
                      disabled={!isConnected}
                      className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all border border-white/10 hover:border-primary disabled:opacity-30 group"
                    >
                      <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
