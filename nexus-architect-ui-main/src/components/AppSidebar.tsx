import { motion } from 'framer-motion';
import { 
  LayoutDashboard, PlayCircle, Activity, Share2, MessageSquare, LineChart, Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulation', label: 'Life Simulation', icon: PlayCircle },
  { id: 'cognitive', label: 'Cognitive Load', icon: Activity },
  { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
  { id: 'command', label: 'Decision Assistant', icon: MessageSquare },
  { id: 'patterns', label: 'Pattern Insights', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const { activePanel, setActivePanel } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden relative z-50 shadow-xl transition-colors duration-300"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-4 min-h-[80px]">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="text-lg font-black text-foreground tracking-tighter leading-none">AI NEXUS</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:scale-110'}`} />
              {!collapsed && <span className="font-semibold tracking-tight">{item.label}</span>}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-muted/30">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">Core_v0.1</span>
              <span className="text-[9px] text-primary/50 mt-1 uppercase font-medium tracking-wider">Sync_Optimal</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 -right-3 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-all z-[60] shadow-lg group"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" /> : <ChevronLeft className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" />}
      </button>
    </motion.aside>
  );
}
