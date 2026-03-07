import { motion } from 'framer-motion';
import { Zap, Calendar, Mail, Cloud, MessageCircle, Plus, ArrowRight } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useState, useEffect, useCallback } from 'react';
import { nexusWS, WebSocketEventTypes, ServerToClientMessage } from '@/lib/websocket';

interface Integration {
  name: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'pending';
  color: string;
}

interface Workflow {
  name: string;
  trigger: string;
  actions: number;
  active: boolean;
}

export function AutomationPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: 'Google Calendar', icon: Calendar, status: 'disconnected', color: 'text-muted-foreground' },
    { name: 'Gmail', icon: Mail, status: 'disconnected', color: 'text-muted-foreground' },
    { name: 'Cloud Storage', icon: Cloud, status: 'disconnected', color: 'text-muted-foreground' },
    { name: 'Slack', icon: MessageCircle, status: 'disconnected', color: 'text-muted-foreground' },
  ]);
  
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { name: 'Daily Briefing', trigger: 'Every morning at 8 AM', actions: 3, active: false },
    { name: 'Email Digest', trigger: 'Hourly', actions: 2, active: false },
    { name: 'Meeting Prep', trigger: 'Before calendar events', actions: 4, active: false },
  ]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch integrations from backend
  const fetchIntegrations = useCallback(() => {
    if (nexusWS && isConnected) {
      setIsLoading(true);
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
        text: '/integrations list',
        requestIntegrations: true
      });
    }
  }, [isConnected]);

  // Fetch workflows from backend
  const fetchWorkflows = useCallback(() => {
    if (nexusWS && isConnected) {
      nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
        text: '/workflows list',
        requestWorkflows: true
      });
    }
  }, [isConnected]);

  // Update integrations based on backend response
  const updateIntegrationsFromBackend = useCallback((backendIntegrations: { name: string; status: string }[]) => {
    setIntegrations(prev => prev.map(int => {
      const backendInt = backendIntegrations.find(
        (bi) => bi.name.toLowerCase().includes(int.name.toLowerCase())
      );
      if (backendInt) {
        return {
          ...int,
          status: (backendInt.status as 'connected' | 'disconnected' | 'pending') || 'disconnected',
          color: backendInt.status === 'connected' ? 'text-neon-green' : 'text-muted-foreground'
        };
      }
      return int;
    }));
  }, []);

  // Connect to backend for real automation data
  useEffect(() => {
    if (!nexusWS) return;

    const handleMessage = (message: ServerToClientMessage) => {
      switch (message.type) {
        case WebSocketEventTypes.SERVER_RESPONSE:
          // Check for integration status
          if (message.payload.integrations) {
            updateIntegrationsFromBackend(message.payload.integrations);
          }
          if (message.payload.workflows) {
            setWorkflows(message.payload.workflows);
          }
          setIsLoading(false);
          break;
      }
    };

    const unsubscribe = nexusWS.onMessage(handleMessage);
    nexusWS.connect();
    
    // Check connection status
    const checkConnection = setInterval(() => {
      const connected = nexusWS?.isConnected() || false;
      setIsConnected(connected);
      
      // If connected, fetch integrations and workflows
      if (connected && !isLoading) {
        fetchIntegrations();
        fetchWorkflows();
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [fetchIntegrations, fetchWorkflows, isLoading, updateIntegrationsFromBackend]);

  // Connect an integration
  const connectIntegration = (name: string) => {
    if (!nexusWS || !isConnected) return;
    
    // Update local state to pending
    setIntegrations(prev => prev.map(int => 
      int.name === name ? { ...int, status: 'pending' } : int
    ));
    
    // Send request to backend
    nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
      text: `/integrations connect ${name.toLowerCase().replace(' ', '_')}`,
      integration: name
    });
  };

  // Toggle workflow
  const toggleWorkflow = (name: string) => {
    if (!nexusWS || !isConnected) return;
    
    setWorkflows(prev => prev.map(wf => 
      wf.name === name ? { ...wf, active: !wf.active } : wf
    ));
    
    nexusWS.send(WebSocketEventTypes.CLIENT_MESSAGE, {
      text: `/workflow toggle ${name.toLowerCase().replace(' ', '_')}`,
      workflow: name
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-neon-orange" />
          <h2 className="text-lg font-semibold">Automations & Integrations</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isConnected ? 'text-neon-green' : 'text-yellow-500'}`}>
            {isConnected ? '• Backend Connected' : '• Disconnected'}
          </span>
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Connected Services</h3>
        <div className="grid grid-cols-2 gap-3">
          {integrations.map((int, i) => (
            <motion.div key={int.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassPanel 
                className="p-4 flex items-center gap-3 cursor-pointer glass-panel-hover"
                onClick={() => int.status === 'disconnected' && connectIntegration(int.name)}
              >
                <int.icon className={`w-5 h-5 ${int.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{int.name}</p>
                  <p className={`text-[10px] ${int.status === 'connected' ? 'text-neon-green' : int.status === 'pending' ? 'text-neon-orange' : 'text-muted-foreground'}`}>
                    {int.status === 'connected' ? 'Connected' : int.status === 'pending' ? 'Connecting...' : 'Click to connect'}
                  </p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workflows */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Workflows</h3>
          <button className="p-1.5 rounded-lg bg-neon-orange/15 text-neon-orange hover:bg-neon-orange/25 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          {workflows.map((wf, i) => (
            <motion.div key={wf.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassPanel className={`p-4 ${!wf.active ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{wf.name}</p>
                    <p className="text-[11px] text-muted-foreground">{wf.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{wf.actions} actions</span>
                    <button 
                      onClick={() => toggleWorkflow(wf.name)}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        wf.active 
                          ? 'bg-neon-green/15 text-neon-green' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {wf.active ? 'Active' : 'Inactive'}
                    </button>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

