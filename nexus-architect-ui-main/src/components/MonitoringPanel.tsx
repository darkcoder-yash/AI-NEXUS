import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Wifi, Clock, Layers } from 'lucide-react';
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
  const [isConnected, setIsConnected] = useState(false);

  // Connect to backend for real metrics
  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.TOKEN_USAGE:
          // Could show token usage metrics
          if (message.payload.metrics) {
            setBackendMetrics(prev => ({
              ...prev,
              // Map any relevant metrics from backend
            }));
          }
          break;
          
        case WebSocketEventTypes.SERVER_RESPONSE:
          // Check for system info in response
          if (message.payload.systemMetrics) {
            setBackendMetrics(message.payload.systemMetrics);
          }
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    
    // Connect and check status
    nexusWS.connect();
    
    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(nexusWS?.isConnected() || false);
    }, 1000);

    // Keep the local mock update as fallback for visual feedback
    const interval = setInterval(updateMetrics, 2000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
      clearInterval(interval);
    };
  }, [updateMetrics]);

  // Use backend metrics if connected, otherwise use local
  const displayMetrics = isConnected ? backendMetrics : systemMetrics;

  const metrics = [
    { label: 'CPU Usage', value: displayMetrics.cpu, icon: Cpu, color: 'blue' as const },
    { label: 'Memory', value: displayMetrics.memory, icon: HardDrive, color: 'purple' as const },
    { label: 'API Latency', value: displayMetrics.latency || displayMetrics.latency, unit: 'ms', max: 200, icon: Clock, color: 'cyan' as const },
    { label: 'Connections', value: displayMetrics.connections || 0, unit: '', max: 500, icon: Wifi, color: 'green' as const },
    { label: 'Queue', value: displayMetrics.queueLength || 0, unit: '', max: 20, icon: Layers, color: 'orange' as const },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-neon-green" />
        <h2 className="text-lg font-semibold">System Monitor</h2>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-yellow-500'}`} />
          <span className={`text-xs font-mono ${isConnected ? 'text-neon-green' : 'text-yellow-500'}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <GlassPanel className="p-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Backend Connection</span>
        <span className={`text-sm font-mono ${isConnected ? 'text-neon-green' : 'text-destructive'}`}>
          {isConnected ? 'Connected to ws://localhost:4001' : 'Disconnected'}
        </span>
      </GlassPanel>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassPanel className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <m.icon className={`w-4 h-4 text-neon-${m.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</span>
              </div>
              <MetricGauge label="" value={m.value} max={m.max} unit={m.unit} color={m.color} />
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Traffic Chart - Real-time simulation based on backend data */}
      <GlassPanel className="p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Request Traffic (24h)</h3>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 48 }).map((_, i) => {
            // Use backend latency as a factor for traffic visualization
            const baseHeight = isConnected ? (displayMetrics.latency || 50) / 4 : 50;
            const h = Math.random() * baseHeight + 10;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.02, duration: 0.4 }}
                className="flex-1 bg-primary/40 rounded-t hover:bg-primary/60 transition-colors"
                style={{ minWidth: 2 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
          <span>24h ago</span>
          <span>12h ago</span>
          <span>Now</span>
        </div>
      </GlassPanel>
    </div>
  );
}

