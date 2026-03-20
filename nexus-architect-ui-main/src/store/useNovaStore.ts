import { create } from 'zustand';

export type NovaState = 'idle' | 'thinking' | 'planning' | 'executing' | 'success' | 'error';

export interface NovaTask {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  position: [number, number, number];
  connections: string[]; // IDs of tasks this connects to
}

export interface NovaLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'action' | 'system' | 'error';
}

interface NovaStore {
  systemState: NovaState;
  tasks: NovaTask[];
  logs: NovaLog[];
  inputQuery: string;
  
  setSystemState: (state: NovaState) => void;
  setTasks: (tasks: NovaTask[]) => void;
  updateTaskStatus: (id: string, status: NovaTask['status']) => void;
  addLog: (message: string, type?: NovaLog['type']) => void;
  setInputQuery: (query: string) => void;
}

export const useNovaStore = create<NovaStore>((set) => ({
  systemState: 'idle',
  tasks: [],
  logs: [],
  inputQuery: '',
  
  setSystemState: (state) => set({ systemState: state }),
  setTasks: (tasks) => set({ tasks }),
  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
  addLog: (message, type = 'info') => set((state) => ({
    logs: [...state.logs, { id: Math.random().toString(36).substring(7), message, timestamp: new Date(), type }].slice(-20) // Keep last 20
  })),
  setInputQuery: (query) => set({ inputQuery: query })
}));
