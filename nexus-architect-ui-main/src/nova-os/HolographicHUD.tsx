import { useNovaStore } from '@/store/useNovaStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function HolographicHUD() {
  const { systemState, tasks, logs, inputQuery, setInputQuery } = useNovaStore();

  const getStatusIcon = () => {
    switch (systemState) {
      case 'idle': return <Terminal className="w-5 h-5 text-[#00E6FF]" />;
      case 'thinking': return <BrainCircuit className="w-5 h-5 text-[#8A2BE2] animate-pulse" />;
      case 'planning': return <Activity className="w-5 h-5 text-[#00E6FF] animate-pulse" />;
      case 'executing': return <Activity className="w-5 h-5 text-[#00FF88] animate-pulse" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-white" />;
      case 'error': return <ShieldAlert className="w-5 h-5 text-[#FF0055] animate-bounce" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 font-['Exo',sans-serif]">
      
      {/* Top Bar: Status */}
      <header className="flex justify-between items-start w-full">
        <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-3 rounded backdrop-blur-md">
          {getStatusIcon()}
          <div>
            <h1 className="text-[#00E6FF] font-['Orbitron',sans-serif] font-black tracking-widest text-lg m-0 leading-none">NOVA OS</h1>
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mt-1">v4.0.2 // Core Online</p>
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/10 p-2 rounded backdrop-blur-md flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${systemState === 'error' ? 'bg-[#FF0055]' : 'bg-[#00FF88] animate-pulse'}`} />
          <span className="text-xs uppercase tracking-widest text-white/70">{systemState}</span>
        </div>
      </header>

      {/* Main Middle Area */}
      <main className="flex-1 flex justify-between items-center w-full mt-8">
        
        {/* Left: Input Bar */}
        <div className="w-80 pointer-events-auto">
          <div className="bg-black/40 border border-[#00E6FF]/30 rounded-lg p-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,230,255,0.1)]">
            <h3 className="text-[#00E6FF] text-[10px] uppercase tracking-widest mb-3">Direct Directive</h3>
            <input 
              type="text" 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter command..."
              className="w-full bg-transparent border-b border-white/20 text-white pb-2 outline-none focus:border-[#00E6FF] transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {/* Right: Execution Timeline */}
        <div className="w-64 bg-black/40 border border-white/10 rounded-lg p-4 backdrop-blur-md max-h-[60vh] overflow-y-auto">
          <h3 className="text-white/70 text-[10px] uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Execution Flow</h3>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {tasks.map((task, i) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 text-xs ${
                    task.status === 'active' ? 'text-[#00E6FF]' : 
                    task.status === 'completed' ? 'text-[#00FF88]' : 
                    'text-white/40'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    task.status === 'active' ? 'bg-[#00E6FF] animate-ping' : 
                    task.status === 'completed' ? 'bg-[#00FF88]' : 
                    'bg-white/20'
                  }`} />
                  <span className="font-mono">{task.label}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Bottom: Live Action Stream */}
      <footer className="w-full h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end pb-4 border-b-2 border-[#00E6FF]/30">
        <div className="w-full max-w-3xl flex flex-col gap-1 overflow-hidden h-20">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-[11px] font-mono tracking-wider flex items-center gap-2 ${
                  log.type === 'error' ? 'text-[#FF0055]' :
                  log.type === 'action' ? 'text-[#00FF88]' :
                  'text-white/60'
                }`}
              >
                <span className="opacity-50">[{log.timestamp.toISOString().split('T')[1].slice(0, -1)}]</span>
                {log.type === 'action' && <span className="text-[#00FF88]">→</span>}
                {log.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </footer>

    </div>
  );
}
