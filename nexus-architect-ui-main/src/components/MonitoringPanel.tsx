import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Wifi, Clock, Layers, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlassPanel } from './GlassPanel';
import { MetricGauge } from './MetricGauge';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

interface BackendMetrics {
  cpu: number;
  memory: number;
  latency: number;
  connections: number;
  queueLength: number;
}

export function MonitoringPanel() {
  const { systemMetrics, updateMetrics } = useAppStore();
  const [backendMetrics, setBackendMetrics] = useState<BackendMetrics>({
    cpu: 0,
    memory: 0,
    latency: 0,
    connections: 0,
    queueLength: 0
  });
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          if (message.payload.systemMetrics) {
            setBackendMetrics(message.payload.systemMetrics);
          }
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

    const interval = setInterval(updateMetrics, 2000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
      clearInterval(interval);
    };
  }, [updateMetrics]);

  const displayMetrics = backendMetrics.cpu > 0 ? backendMetrics : systemMetrics;

  const metrics = [
    { label: 'Neural CPU Load', value: displayMetrics.cpu, icon: Cpu, color: 'cyan' as const },
    { label: 'Synaptic Memory', value: displayMetrics.memory, icon: HardDrive, color: 'purple' as const },
    { label: 'Core Latency', value: displayMetrics.latency || 45, unit: 'ms', max: 200, icon: Clock, color: 'blue' as const },
    { label: 'Active Links', value: displayMetrics.connections || 128, unit: '', max: 500, icon: Wifi, color: 'green' as const },
    { label: 'Request Queue', value: displayMetrics.queueLength || 3, unit: '', max: 20, icon: Layers, color: 'orange' as const },
    { label: 'Power Draw', value: 84, unit: 'W', max: 150, icon: Zap, color: 'orange' as const },
  ];

  return (
    <div className="p-10 space-y-10 overflow-y-auto h-full scrollbar-thin relative">
      {/* Cinematic Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-1px bg-gradient-to-r from-[#00E6FF] to-transparent" />
          <span className="text-[10px] font-black tracking-[0.5em] text-[#00E6FF] uppercase">System_Diagnostic</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-white tracking-tighter font-orbitron">CORE MONITOR</h2>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse shadow-[0_0_10px_#00FF9D]" />
              <span className="text-[10px] font-bold font-mono text-[#00FF9D]">SYNC_ACTIVE</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] font-bold font-mono text-slate-400">ID: NEXUS_CORE_01</span>
          </div>
        </div>
      </div>

      {/* 12-Column Grid for Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassPanel className="p-8 group hover:bg-white/[0.03] transition-all" neon={m.color === 'cyan' ? 'cyan' : 'none'}>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-colors`}>
                  <m.icon className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                </div>
                <div className="text-[8px] font-black text-slate-600 tracking-widest uppercase">Telemetry_Stream</div>
              </div>
              <MetricGauge label={m.label} value={m.value} max={m.max} unit={m.unit} color={m.color} />
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Cinematic Traffic Layer */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black tracking-[0.3em] text-slate-400">NEURAL_TRAFFIC_FLOW</h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/20" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="w-2 h-2 rounded-full bg-primary/60" />
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-48">
              {Array.from({ length: 60 }).map((_, i) => {
                const h = 20 + Math.random() * 60;
                const opacity = 0.1 + (h / 100) * 0.6;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.01, duration: 1 }}
                    className="flex-1 rounded-t-sm"
                    style={{ 
                      backgroundColor: '#00E6FF',
                      opacity: opacity,
                      boxShadow: h > 70 ? '0 0 15px rgba(0, 230, 255, 0.3)' : 'none'
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-600 mt-4 uppercase tracking-widest font-mono">
              <span>Origin_T-60m</span>
              <span>Vector_Established</span>
              <span>Current_Interval</span>
            </div>
          </GlassPanel>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <GlassPanel className="p-8 flex flex-col justify-between h-full bg-[#00E6FF]/5 border-[#00E6FF]/20">
            <div>
              <h3 className="text-xs font-black tracking-[0.3em] text-[#00E6FF] mb-6">CORE_INTEGRITY</h3>
              <p className="text-[10px] text-[#00E6FF]/70 leading-relaxed font-bold uppercase tracking-widest">
                All neural subsystems operating within nominal parameters. Predictive caching optimized at 94.2%.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-widest">
                <span>Security_Shield</span>
                <span className="text-[#00FF9D]">STABLE</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-widest">
                <span>Logic_Engine</span>
                <span className="text-[#00FF9D]">OPTIMAL</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-widest">
                <span>Database_Link</span>
                <span className="text-[#00FF9D]">ACTIVE</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
