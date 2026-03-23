import { motion } from 'framer-motion';
import { 
  LayoutDashboard, PlayCircle, Activity, Share2, MessageSquare, LineChart, Settings, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
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
  const { logout, user } = useAuthStore();
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
      className="h-screen bg-[#01080b]/95 border-r border-[#00E6FF]/10 flex flex-col overflow-hidden relative z-50 backdrop-blur-3xl shrink-0 shadow-2xl"
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00E6FF]/40 z-20" />
      <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-[#00E6FF]/20 z-20" />
      <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-[#00E6FF]/20 z-20" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00E6FF]/40 z-20" />

      <div className="nu-scanlines opacity-[0.03] pointer-events-none" />
      
      {/* Top Branding - Refined Alignment */}
      <div className="p-8 flex items-center gap-5 min-h-[120px] relative z-10 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-[#00E6FF]/5 flex items-center justify-center border border-[#00E6FF]/30 shrink-0 shadow-[0_0_20px_rgba(0,230,255,0.15)] overflow-hidden relative group">
          <div className="absolute inset-0 bg-[#00E6FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain relative z-10 drop-shadow-[0_0_5px_rgba(0,230,255,0.5)]" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex flex-col justify-center"
          >
            <h1 className="text-sm font-black text-white tracking-[0.4em] leading-tight">AI NEXUS</h1>
            <p className="text-[7px] text-[#00E6FF] font-black uppercase tracking-[0.6em] mt-2 opacity-70 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#00E6FF] rounded-full animate-pulse" />
              Core_OS_v0.1
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation - Better Spacing */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none relative z-10">
        {navItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-lg transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-[#00E6FF]/10 text-[#00E6FF] border border-[#00E6FF]/30' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent'
                }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(0,230,255,0.6)]' : 'group-hover:scale-110'}`} />
              {!collapsed && (
                <span className="font-bold text-[10px] tracking-[0.3em] uppercase whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-[#00E6FF] shadow-[0_0_15px_rgba(0,230,255,1)] rounded-r-full" 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Button */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10 flex flex-col gap-4">
        {!collapsed && user && (
          <div className="px-2 pt-2">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-1">Operator_ID</span>
            <span className="text-[9px] font-bold text-white uppercase tracking-wider truncate block">{user.email}</span>
            <div className="mt-3 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="h-full bg-teal-500/40"
              />
            </div>
          </div>
        )}
        
        <button
          onClick={() => logout()}
          className={`flex items-center gap-5 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden text-red-500/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20`}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && (
            <span className="font-bold text-[10px] tracking-[0.3em] uppercase">TERMINATE_LINK</span>
          )}
        </button>
      </div>

      {/* Status Footer - Improved Alignment */}
      <div className="p-8 border-t border-white/5 bg-black/60 relative z-10">
        <div className="flex items-center gap-4 px-1">
          <div className="relative shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E6FF] animate-pulse shadow-[0_0_12px_rgba(0,230,255,1)]" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#00E6FF] animate-ping opacity-25" />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] leading-none">SYSTEM_SYNC</span>
              <span className="text-[7px] text-slate-500 mt-2 uppercase font-black tracking-widest whitespace-nowrap">Core Stability: 99.98%</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button HUD Style - Better Hover State */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-12 -right-3 w-7 h-7 rounded-lg bg-[#05161a] border border-[#00E6FF]/30 flex items-center justify-center hover:bg-[#0B2C33] hover:border-[#00E6FF] transition-all z-[60] shadow-2xl group"
      >
        <div className="absolute inset-0 bg-[#00E6FF]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#00E6FF]" /> : <ChevronLeft className="w-3.5 h-3.5 text-[#00E6FF]" />}
      </button>
    </motion.aside>
  );
}
