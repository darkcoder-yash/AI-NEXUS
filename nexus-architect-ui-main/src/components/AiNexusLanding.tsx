import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Database, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { QuantumCore } from './QuantumCore';
import { NeuralCursor } from './NeuralCursor';
import { useAuthStore } from '@/store/useAuthStore';
import './AiNexusLanding.css';

export default function AiNexusLanding() {
  const navigate = useNavigate();
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const [logs, setLogs] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const initialLogs = [
      'UPLINK INITIALIZING...',
      'NEURAL NETWORK SYNCHRONIZING',
      'NODE CLUSTER ONLINE',
      'AI CORE STABILIZED'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < initialLogs.length) {
        setLogs(prev => [...prev, initialLogs[i]].slice(-5));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    setIsActivating(true);
    setLogs(prev => [...prev, 'ESTABLISHING SECURE UPLINK...', 'AUTHORIZING HUMAN DIRECTIVE...']);
    
    setTimeout(() => {
      loginDemo();
      navigate('/nexus');
    }, 2000);
  };

  return (
    <div className="nexus-landing-container h-screen w-full relative">
      <NeuralCursor />
      
      {/* Background Layers */}
      <div className="energy-grid" />
      <div className="volumetric-fog" />
      <QuantumCore />

      {/* Foreground UI Layer */}
      <div className="relative z-10 flex flex-col h-full w-full pointer-events-none">
        
        {/* Top Section: Branding & Global Status */}
        <header className="nexus-navbar pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="brand-title">
              AI <span className="brand-nexus">NEXUS</span>
            </div>
            <div className="brand-subtitle">Cognitive Intelligence System</div>
          </motion.div>

          <nav className="hidden lg:flex gap-16">
            {["Architecture", "Neural Link", "Protocol"].map((link, i) => (
              <motion.a 
                key={link}
                href="#"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`nav-link ${i === 1 ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                {link}
              </motion.a>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="global-status"
          >
            <div className="status-dot" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">System Status</span>
              <span className="text-[11px] font-black status-green uppercase tracking-widest">Online</span>
            </div>
          </motion.div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex px-12 py-8 relative">
          
          {/* Left Side: System Data Panels */}
          <aside className="w-80 flex flex-col gap-6 pointer-events-auto">
            <SystemWidget 
              icon={Activity} 
              label="SYS_LOAD" 
              value="78%" 
              progress={78} 
              status="stable" 
              delay={0.5} 
            />
            <SystemWidget 
              icon={Database} 
              label="SYNC_RATE" 
              value="99.9%" 
              progress={99.9} 
              status="stable" 
              delay={0.7} 
            />
            <SystemWidget 
              icon={Cpu} 
              label="Q_CORES" 
              value="ACTIVE" 
              status="stable" 
              delay={0.9} 
              isStatic
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-auto p-4 border border-white/5 bg-white/[0.02] rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#00E6FF]" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Security Protocol</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Encrypted neural tunnel established via AES-512 Quantum layer. 
                Awaiting biometric authentication...
              </p>
            </motion.div>
          </aside>

          {/* Floating System Feedback Layer */}
          <div className="system-log-container">
            <AnimatePresence mode="popLayout">
              {logs.map((log, idx) => (
                <motion.div 
                  key={`${log}-${idx}`}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="log-entry"
                >
                  <span className="log-prefix">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </main>

        {/* Bottom CTA Layer */}
        <footer className="w-full h-48 flex items-center justify-center pointer-events-auto relative">
          <motion.button 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnter}
            disabled={isActivating}
            className={`cta-uplink group ${isActivating ? 'opacity-50 cursor-wait' : ''}`}
          >
            <div className="cta-trace-border" />
            <span className="relative z-10 flex items-center gap-6">
              {isActivating ? 'Activating AI...' : 'Establish Uplink'}
              {!isActivating && <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />}
            </span>
          </motion.button>
          
          <div className="absolute bottom-10 flex flex-col items-center opacity-30">
            <Zap className="w-4 h-4 text-[#00E6FF] animate-pulse mb-2" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.8em]">Neural Core v4.0.2</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

function SystemWidget({ 
  icon: Icon, 
  label, 
  value, 
  progress, 
  status, 
  delay, 
  isStatic = false 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  progress?: number, 
  status: 'stable' | 'warning' | 'critical', 
  delay: number,
  isStatic?: boolean
}) {
  const statusColor = status === 'stable' ? 'status-green' : status === 'warning' ? 'status-yellow' : 'status-red';
  const bgStatusColor = status === 'stable' ? 'bg-status-green' : status === 'warning' ? 'bg-status-yellow' : 'bg-status-red';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay }}
      className="sys-widget"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded bg-white/5 border border-white/10`}>
            <Icon className="w-3.5 h-3.5 text-[#00E6FF]" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest ${statusColor}`}>{value}</span>
      </div>

      {!isStatic && (
        <div className="progress-track">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2, delay: delay + 0.5, ease: "circOut" }}
            className={`progress-fill ${bgStatusColor}`}
          />
        </div>
      )}
      
      {isStatic && (
        <div className="flex gap-1.5 mt-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 5 ? bgStatusColor : 'bg-white/10'}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
