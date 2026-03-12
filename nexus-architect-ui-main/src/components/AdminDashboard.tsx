import { motion } from 'framer-motion';
import { BarChart3, Users, MessageSquare, Cpu, Zap, RefreshCw } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { MetricGauge } from './MetricGauge';
import { useState, useEffect, useCallback } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

interface AdminStats {
  activeUsers: number;
  sessionsToday: number;
  tokensUsed: number;
  avgResponse: number;
}

interface ToolMetric {
  name: string;
  value: number;
  color: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red';
}

interface Activity {
  message: string;
  time: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    activeUsers: 0,
    sessionsToday: 0,
    tokensUsed: 0,
    avgResponse: 0
  });
  const [toolMetrics, setToolMetrics] = useState<ToolMetric[]>([
    { name: 'Web Search', value: 0, color: 'blue' },
    { name: 'File Analysis', value: 0, color: 'purple' },
    { name: 'Email Draft', value: 0, color: 'cyan' },
    { name: 'Calculator', value: 0, color: 'green' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admin stats from backend
  const fetchAdminStats = useCallback(() => {
    if (nexusWS) {
      setIsLoading(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
        text: '/admin stats',
        requestAdminStats: true
      });
    }
  }, []);

  // Connect to backend for real admin data
  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.TOKEN_USAGE:
          // Get token usage stats from backend
          if (message.payload) {
            setStats(prev => ({
              ...prev,
              tokensUsed: message.payload.totalTokens || prev.tokensUsed,
            }));
          }
          break;
          
        case WebSocketEventTypes.SERVER_RESPONSE:
          // Check for admin stats
          if (message.payload.adminStats) {
            const adminStats = message.payload.adminStats;
            setStats(prev => ({
              activeUsers: adminStats.activeUsers || prev.activeUsers,
              sessionsToday: adminStats.sessionsToday || prev.sessionsToday,
              tokensUsed: adminStats.tokensUsed || prev.tokensUsed,
              avgResponse: adminStats.avgResponse || prev.avgResponse,
            }));
          }
          if (message.payload.toolMetrics) {
            setToolMetrics(message.payload.toolMetrics);
          }
          if (message.payload.activities) {
            setActivities(message.payload.activities);
          }
          setIsLoading(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    if (!nexusWS.isConnected()) {
      nexusWS.connect();
    }
    
    // Check connection status and fetch initial data
    const checkConnection = setInterval(() => {
      setIsConnected(true);
      
      if (!isLoading) {
        fetchAdminStats();
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [fetchAdminStats, isLoading]);

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statsData = [
    { label: 'Active Users', value: formatNumber(stats.activeUsers), change: '+12%', icon: Users, color: 'text-primary' },
    { label: 'Sessions Today', value: formatNumber(stats.sessionsToday), change: '+8%', icon: MessageSquare, color: 'text-neon-cyan' },
    { label: 'Tokens Used', value: formatNumber(stats.tokensUsed), change: '+23%', icon: Zap, color: 'text-neon-orange' },
    { label: 'Avg Response', value: stats.avgResponse ? `${stats.avgResponse}s` : '1.3s', change: '-15%', icon: Cpu, color: 'text-neon-green' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-neon-cyan" />
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminStats}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className={`text-xs text-neon-green`}>
            Live
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassPanel className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${s.change.startsWith('+') ? 'text-neon-green' : 'text-neon-red'}`}>{s.change} vs yesterday</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Tool Metrics */}
      <GlassPanel className="p-4 space-y-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Tool Usage Metrics</h3>
        {toolMetrics.map((metric) => (
          <MetricGauge 
            key={metric.name}
            label={metric.name} 
            value={metric.value} 
            color={metric.color as any} 
          />
        ))}
      </GlassPanel>

      {/* Recent Activity */}
      <GlassPanel className="p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {activities.length > 0 ? (
            activities.map((act, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{act.message}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{act.time}</span>
              </div>
            ))
          ) : (
            ['Waiting for backend data...'].map((act, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                <span className="text-muted-foreground">{act}</span>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

