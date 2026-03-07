import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export type Task = {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  time: string;
};

export type SimulationResult = {
  outcome: string;
  confidence: number;
  risk: string;
  suggestion: string;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'disabled' | 'running';
  icon: string;
  lastRun?: Date;
};

export type MemoryEntry = {
  id: string;
  content: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
};

type AppState = {
  activePanel: string;
  setActivePanel: (panel: string) => void;

  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  activeSimulation: SimulationResult | null;
  setSimulation: (res: SimulationResult | null) => void;

  memories: MemoryEntry[];
  addMemory: (m: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
  deleteMemory: (id: string) => void;
  setMemories: (memories: MemoryEntry[]) => void;

  tools: Tool[];
  toggleTool: (id: string) => void;
  setTools: (tools: Tool[]) => void;

  voiceActive: boolean;
  setVoiceActive: (v: boolean) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;

  isConnected: boolean;
  setIsConnected: (v: boolean) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;

  systemMetrics: {
    cpu: number;
    memory: number;
    latency: number;
    connections: number;
    queueLength: number;
  };
  updateMetrics: () => void;
};

const defaultTasks: Task[] = [
  { id: '1', title: 'Finalize AI NEXUS Prototype', priority: 'High', status: 'In Progress', time: '10:00 AM' },
  { id: '2', title: 'Research Graph Databases', priority: 'Medium', status: 'Pending', time: '01:00 PM' },
  { id: '3', title: 'Meeting with Dev Team', priority: 'High', status: 'Pending', time: '03:00 PM' },
  { id: '4', title: 'Documentation Update', priority: 'Low', status: 'Pending', time: '05:30 PM' },
];

const defaultSimulation: SimulationResult = {
  outcome: 'High Probability of Success',
  confidence: 88,
  risk: 'Potential conflict at 03:00 PM due to Task 1 overrun.',
  suggestion: 'Start Task 3 thirty minutes early to ensure Task 4 completion.'
};

const defaultTools: Tool[] = [
  { id: '1', name: 'Web Search', description: 'Search the internet for information', status: 'active', icon: 'Search' },
  { id: '2', name: 'URL Fetcher', description: 'Fetch and parse webpage content', status: 'active', icon: 'Globe' },
  { id: '3', name: 'Calculator', description: 'Perform mathematical calculations', status: 'active', icon: 'Calculator' },
  { id: '4', name: 'Email Draft', description: 'Draft and send emails', status: 'active', icon: 'Mail' },
  { id: '5', name: 'File Reader', description: 'Read and analyze files', status: 'active', icon: 'FileText' },
  { id: '6', name: 'Task Creator', description: 'Create and manage tasks', status: 'active', icon: 'CheckSquare' },
  { id: '7', name: 'Doc Analyzer', description: 'Analyze document content', status: 'active', icon: 'FileSearch' },
  { id: '8', name: 'Code Runner', description: 'Execute code snippets', status: 'disabled', icon: 'Code' },
];

const defaultMemories: MemoryEntry[] = [
  { id: '1', content: 'User prefers concise responses with code examples', tags: ['preference', 'style'], priority: 'high', timestamp: new Date(Date.now() - 86400000) },
  { id: '2', content: 'Working on a React + TypeScript project', tags: ['context', 'tech'], priority: 'medium', timestamp: new Date(Date.now() - 43200000) },
  { id: '3', content: 'Timezone: UTC-5, preferred language: English', tags: ['profile'], priority: 'low', timestamp: new Date() },
];

export const useAppStore = create<AppState>((set) => ({
  activePanel: 'dashboard',
  setActivePanel: (panel) => set({ activePanel: panel }),

  messages: [],
  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }],
  })),
  clearMessages: () => set({ messages: [] }),
  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),

  tasks: defaultTasks,
  addTask: (task) => set((s) => ({
    tasks: [...s.tasks, { ...task, id: crypto.randomUUID() }],
  })),
  toggleTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t),
  })),
  removeTask: (id) => set((s) => ({
    tasks: s.tasks.filter((t) => t.id !== id),
  })),

  activeSimulation: defaultSimulation,
  setSimulation: (res) => set({ activeSimulation: res }),

  memories: defaultMemories,
  addMemory: (m) => set((s) => ({
    memories: [...s.memories, { ...m, id: crypto.randomUUID(), timestamp: new Date() }],
  })),
  deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
  setMemories: (memories) => set({ memories }),

  tools: defaultTools,
  toggleTool: (id) => set((s) => ({
    tools: s.tools.map((t) => t.id === id ? { ...t, status: t.status === 'active' ? 'disabled' : 'active' } : t),
  })),
  setTools: (tools) => set({ tools }),

  voiceActive: false,
  setVoiceActive: (v) => set({ voiceActive: v }),
  ttsEnabled: true,
  setTtsEnabled: (v) => set({ ttsEnabled: v }),

  isConnected: false,
  setIsConnected: (v) => set({ isConnected: v }),
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  systemMetrics: { cpu: 34, memory: 62, latency: 45, connections: 128, queueLength: 3 },
  updateMetrics: () => set((s) => ({
    systemMetrics: {
      cpu: Math.min(100, Math.max(5, s.systemMetrics.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.min(100, Math.max(20, s.systemMetrics.memory + (Math.random() - 0.5) * 5)),
      latency: Math.min(200, Math.max(10, s.systemMetrics.latency + (Math.random() - 0.5) * 20)),
      connections: Math.max(0, Math.round(s.systemMetrics.connections + (Math.random() - 0.5) * 10)),
      queueLength: Math.max(0, Math.round(s.systemMetrics.queueLength + (Math.random() - 0.5) * 3)),
    },
  })),
}));
