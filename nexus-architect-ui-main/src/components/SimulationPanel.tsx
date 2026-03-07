import { motion } from 'framer-motion';
import { PlayCircle, Target, AlertTriangle, Zap, Clock, Save, History, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function SimulationPanel() {
  const { tasks, addTask, removeTask, setSimulation } = useAppStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' as const, time: '09:00 AM' });

  const runSimulation = () => {
    setIsSimulating(true);
    // Mock simulation logic based on task count
    setTimeout(() => {
      const risk = tasks.length > 5 ? 'Extreme risk of burnout. Day overrun by 2.5 hours.' : 
                   tasks.length > 3 ? 'Moderate risk of conflict. Task sequence optimization required.' :
                   'Low risk. Optimal schedule sequence established.';
      
      setSimulation({
        outcome: tasks.length > 5 ? 'High Probability of Failure' : 'High Probability of Success',
        confidence: tasks.length > 5 ? 65 : 92,
        risk: risk,
        suggestion: tasks.length > 5 ? 'Postpone at least 2 non-critical tasks.' : 'Start with your highest priority task to maximize momentum.'
      });
      setIsSimulating(false);
    }, 1500);
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    addTask({ ...newTask, status: 'Pending' });
    setNewTask({ title: '', priority: 'Medium', time: '09:00 AM' });
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-[#0f172a]/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Life Simulation Engine</h2>
          <p className="text-slate-400 font-medium mt-1">Predicting and optimizing daily outcomes</p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isSimulating || tasks.length === 0}
          className="px-6 py-3 rounded-xl bg-teal-500 text-teal-950 font-bold uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50"
        >
          {isSimulating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
          Run Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Input */}
        <GlassPanel className="p-6 border-white/10 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" /> Daily Task Input
            </h3>
            <span className="text-[10px] font-bold text-teal-500/50 uppercase tracking-widest">{tasks.length} Active</span>
          </div>
          
          <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <input 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Task title..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 font-medium"
            />
            <select 
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input 
              type="time"
              value={newTask.time.includes('AM') || newTask.time.includes('PM') ? '09:00' : newTask.time}
              onChange={(e) => setNewTask({...newTask, time: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 outline-none"
            />
            <button 
              onClick={handleAddTask}
              className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-all border border-teal-500/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-200">{task.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{task.time} • {task.priority} Priority</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel className="p-6 border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-400" /> Active Variables
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Workload Density', value: tasks.length > 5 ? 'Critical' : tasks.length > 3 ? 'High' : 'Optimal' },
                { label: 'Available Energy', value: '72%' },
                { label: 'Deadline Proximity', value: '4.2 hrs' },
                { label: 'Interrupt Probability', value: 'Low' },
              ].map((v) => (
                <div key={v.label} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-sm text-slate-400">{v.label}</span>
                  <span className="text-sm font-bold text-white font-mono">{v.value}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" /> Recent Simulations
            </h3>
            <div className="space-y-3">
              {[
                { time: '09:00 AM', result: '92% Success Rate', delta: '+4% vs Baseline' },
                { time: 'Yesterday', result: '81% Success Rate', delta: '-2% vs Baseline' },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white">{s.result}</p>
                      <p className="text-xs text-slate-500 mt-1">{s.time}</p>
                    </div>
                    <span className="text-[10px] font-bold text-teal-500/50 uppercase tracking-widest">{s.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      <GlassPanel className="p-8 border-white/10 bg-teal-500/[0.02] relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
            <Zap className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Timeline Optimization</h3>
        </div>
        
        <div className="relative h-24 flex items-center">
          <div className="absolute inset-0 h-1 bg-white/5 top-1/2 -translate-y-1/2" />
          <div className="flex justify-between w-full relative z-10 px-4">
            {tasks.length === 0 ? (
              <span className="text-xs text-slate-600 font-bold uppercase tracking-widest w-full text-center">Neural timeline pending task input...</span>
            ) : (
              tasks.slice(0, 5).map((task, i) => (
                <div key={task.id} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-teal-500'} shadow-[0_0_10px_rgba(var(--primary),0.5)] mb-3`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[80px] text-center truncate">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
