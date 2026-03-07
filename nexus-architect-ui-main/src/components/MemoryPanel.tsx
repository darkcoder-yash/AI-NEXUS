import { motion } from 'framer-motion';
import { Brain, Search, Tag, Trash2, Plus, Star, RefreshCw, Zap, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

export function MemoryPanel() {
  const { memories, deleteMemory, addMemory, setMemories } = useAppStore();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          if (message.payload.memories) {
            const backendMemories = message.payload.memories.map((mem: any) => ({
              id: mem.id || crypto.randomUUID(),
              content: mem.content || mem.text || '',
              tags: mem.tags || [],
              priority: mem.priority || 'medium',
              timestamp: mem.timestamp ? new Date(mem.timestamp) : new Date()
            }));
            setMemories(backendMemories);
          }
          break;
        case WebSocketEventTypes.RESPONSE_COMPLETE:
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
  }, [setMemories]);

  const refreshMemories = () => {
    if (nexusWS && isConnected) {
      setIsLoading(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, { 
        text: "/memory list",
        requestMemories: true 
      });
    }
  };

  const filtered = memories.filter((m) =>
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-background/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Intelligence Memory</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Quantum Neural Context</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshMemories}
            disabled={isLoading || !isConnected}
            className="p-2.5 rounded-xl hover:bg-white/5 border border-white/5 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => addMemory({ content: 'New context fragment...', tags: ['manual'], priority: 'medium' })}
            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <GlassPanel className="lg:col-span-2 flex items-center gap-3 px-4 py-2 border-white/10" animate={false}>
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search context fragments..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 font-medium py-1.5"
          />
        </GlassPanel>
        
        <GlassPanel className="p-3 flex flex-col items-center justify-center border-white/10">
          <p className="text-xl font-bold font-mono text-primary leading-none">{memories.length}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">Fragments</p>
        </GlassPanel>

        <GlassPanel className="p-3 flex flex-col items-center justify-center border-white/10">
          <p className="text-xl font-bold font-mono text-primary leading-none">{[...new Set(memories.flatMap((m) => m.tags))].length}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">Classifiers</p>
        </GlassPanel>
      </div>

      {/* Memory List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Zap className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <p className="text-sm font-bold text-muted-foreground tracking-tight">NO CONTEXTUAL FRAGMENTS FOUND</p>
            <p className="text-xs text-muted-foreground/50 mt-1 uppercase tracking-widest">Neural cache is empty or filtered</p>
          </div>
        )}
        
        {filtered.map((mem, i) => (
          <motion.div
            key={mem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <GlassPanel className="p-5 space-y-4 group border-white/5 hover:border-primary/20 transition-all duration-300 shadow-md hover:shadow-primary/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed font-medium text-foreground/90">{mem.content}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {mem.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <Tag className="w-2 h-2 text-primary/50" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border ${
                    mem.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    mem.priority === 'medium' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-white/5 text-muted-foreground border-white/10'
                  }`}>
                    {mem.priority}_PRIORITY
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/40 font-mono text-[9px]">
                  <Clock className="w-3 h-3" />
                  {mem.timestamp.toLocaleDateString()} {mem.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
