import { motion } from 'framer-motion';
import { 
  LayoutDashboard, PlayCircle, Activity, Share2, MessageSquare, LineChart, Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { nexusWS } from '@/lib/websocket';

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'simulation', label: 'SIMULATION', icon: PlayCircle },
  { id: 'cognitive', label: 'NEURAL LOAD', icon: Activity },
  { id: 'graph', label: 'KNOWLEDGE', icon: Share2 },
  { id: 'command', label: 'DECISION CORE', icon: MessageSquare },
  { id: 'patterns', label: 'ANALYTICS', icon: LineChart },
  { id: 'settings', label: 'PARAMETERS', icon: Settings },
];

export function AppSidebar() {
  const { activePanel, setActivePanel } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (nexusWS && !nexusWS.isConnected()) {
      nexusWS.connect();
    }
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-[#01080b]/90 border-r border-[#00E6FF]/10 flex flex-col overflow-hidden relative z-50 backdrop-blur-3xl shrink-0"
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E6FF]/30 z-20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00E6FF]/30 z-20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00E6FF]/30 z-20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E6FF]/30 z-20" />

      <div className="nu-scanlines opacity-[0.05]" />
      
      {/* Top Branding */}
      <div className="p-8 flex items-center gap-5 min-h-[110px] relative z-10">
        <div className="w-10 h-10 rounded-sm bg-[#00E6FF]/5 flex items-center justify-center border border-[#00E6FF]/20 shrink-0 shadow-[0_0_15px_rgba(0,230,255,0.1)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E6FF] animate-pulse shadow-[0_0_10px_rgba(0,230,255,0.8)]" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="overflow-hidden"
          >
            <h1 className="text-sm font-black text-white tracking-[0.3em] leading-none">AI NEXUS</h1>
            <p className="text-[8px] text-[#00E6FF] font-black uppercase tracking-[0.5em] mt-2 opacity-60 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#00E6FF] rounded-full animate-ping" />
              Quantum Layer
            </p>
          </motion.div>
        )}
      </div>

      {/* Sidebar Decorative Coordinates */}
      {!collapsed && (
        <div className="px-8 mb-4 flex justify-between opacity-20 relative z-10">
          <span className="text-[7px] font-mono text-[#00E6FF] tracking-tighter">SEC_01 // AX_44</span>
          <span className="text-[7px] font-mono text-[#00E6FF] tracking-tighter">LN_882.04</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-none relative z-10">
        {navItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-sm transition-all duration-500 group relative overflow-hidden
                ${isActive 
                  ? 'bg-[#00E6FF]/5 text-[#00E6FF] border border-[#00E6FF]/20' 
                  : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.02] border border-transparent'
                }`}
            >
              {/* Button HUD Lines */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[#00E6FF]/50" />
                  <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-[#00E6FF]/50" />
                </>
              )}

              <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,230,255,0.8)]' : 'group-hover:scale-110'}`} />
              {!collapsed && (
                <span className="font-black text-[9px] tracking-[0.3em] uppercase">{item.label}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute right-0 w-0.5 h-6 bg-[#00E6FF] shadow-[0_0_15px_rgba(0,230,255,1)]" 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status HUD */}
      {!collapsed && (
        <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Neural Link</span>
              <span className="text-[7px] font-black text-[#00E6FF] uppercase tracking-widest">Active</span>
            </div>
            <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 h-full w-1/2 bg-[#00E6FF]/40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="p-8 border-t border-white/5 bg-black/40 relative z-10">
        <div className="flex items-center gap-4 px-1">
          <div className="relative shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#00E6FF] animate-pulse shadow-[0_0_10px_rgba(0,230,255,0.8)]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#00E6FF] animate-ping opacity-20" />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-[8px] font-black text-white uppercase tracking-[0.3em] leading-none">SYSTEM_SYNC</span>
              <span className="text-[7px] text-slate-600 mt-2 uppercase font-black tracking-widest whitespace-nowrap">Core Stability: 99.98%</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button HUD Style */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-10 -right-3 w-6 h-6 rounded-sm bg-[#05161a] border border-[#00E6FF]/30 flex items-center justify-center hover:bg-[#0B2C33] hover:border-[#00E6FF] transition-all z-[60] shadow-2xl group"
      >
        <div className="absolute inset-0 bg-[#00E6FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {collapsed ? <ChevronRight className="w-3 h-3 text-[#00E6FF]" /> : <ChevronLeft className="w-3 h-3 text-[#00E6FF]" />}
      </button>
    </motion.aside>
  );
}
