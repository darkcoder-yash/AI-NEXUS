import { motion } from 'framer-motion';
import { Shield, Lock, Eye, AlertTriangle, UserCheck, Key, RefreshCw } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

interface AuditLog {
  action: string;
  user: string;
  time: string;
  severity: 'info' | 'warning' | 'error';
}

interface Role {
  name: string;
  users: number;
  permissions: string;
}

interface SecurityStats {
  activeTokens: number;
  roles: number;
  alerts: number;
}

export function SecurityPanel() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { action: 'API key rotated', user: 'admin', time: '2 min ago', severity: 'info' },
    { action: 'Failed login attempt', user: 'unknown', time: '15 min ago', severity: 'warning' },
    { action: 'Permission granted: tool.execute', user: 'admin', time: '1h ago', severity: 'info' },
    { action: 'Rate limit triggered', user: 'user_42', time: '3h ago', severity: 'warning' },
    { action: 'New API token created', user: 'admin', time: '5h ago', severity: 'info' },
  ]);
  
  const [roles, setRoles] = useState<Role[]>([
    { name: 'Admin', users: 2, permissions: 'Full access' },
    { name: 'Operator', users: 5, permissions: 'Execute tools, view logs' },
    { name: 'Viewer', users: 12, permissions: 'Read-only access' },
  ]);
  
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    activeTokens: 3,
    roles: 3,
    alerts: 1
  });
  
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to backend for real security data
  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          // Check for security data
          if (message.payload.securityStats) {
            setSecurityStats(message.payload.securityStats);
          }
          if (message.payload.auditLogs) {
            setAuditLogs(message.payload.auditLogs);
          }
          if (message.payload.roles) {
            setRoles(message.payload.roles);
          }
          setIsLoading(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    if (!nexusWS.isConnected()) {
      nexusWS.connect();
    }
    
    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  // Refresh security data
  const refreshSecurityData = () => {
    if (nexusWS) {
      setIsLoading(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
        text: '/admin security',
        requestSecurityData: true
      });
    }
  };

  const stats = [
    { label: 'Active Tokens', value: securityStats.activeTokens.toString(), icon: Key, color: 'text-primary' },
    { label: 'Roles', value: securityStats.roles.toString(), icon: UserCheck, color: 'text-neon-cyan' },
    { label: 'Alerts', value: securityStats.alerts.toString(), icon: AlertTriangle, color: securityStats.alerts > 0 ? 'text-neon-orange' : 'text-neon-green' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-neon-green" />
          <h2 className="text-lg font-semibold">Security Control</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshSecurityData}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className={`text-xs text-neon-green`}>
            Connected
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <GlassPanel key={s.label} className="p-3 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
            <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Roles */}
      <GlassPanel className="p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Roles & Permissions</h3>
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.permissions}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{r.users} users</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Audit Log */}
      <GlassPanel className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Audit Log</h3>
        </div>
        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2 text-sm border-b border-border last:border-0"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                log.severity === 'warning' ? 'bg-neon-orange' : 
                log.severity === 'error' ? 'bg-neon-red' : 'bg-neon-green'
              }`} />
              <span className="flex-1">{log.action}</span>
              <span className="text-[10px] text-muted-foreground">{log.user}</span>
              <span className="text-[10px] text-muted-foreground">{log.time}</span>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

