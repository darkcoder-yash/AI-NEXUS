import { motion } from 'framer-motion';
import { 
  Calendar, CheckCircle2, AlertTriangle, TrendingUp, Zap, Clock, Brain, 
  Target, BarChart3, ArrowRight, ShieldCheck, User
} from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { MetricGauge } from './MetricGauge';
import { useAppStore } from '@/store/useAppStore';

export function Dashboard() {
  const { systemMetrics, tasks, activeSimulation, toggleTask, setActivePanel } = useAppStore();

  const insights = [
    'Peak productivity detected: 9:00 AM - 11:30 AM',
    'Cognitive load increasing. Suggest 15m break after current task.',
    'Graph density +12% this week. Stronger project-person links.',
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-[#0f172a]/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">AI NEXUS Dashboard</h2>
          <p className="text-slate-400 font-medium mt-1">Unified Command for Human Life Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Biometric_Verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-teal-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Cognitive */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Simulation View */}
          {activeSimulation && (
            <GlassPanel className="p-8 relative overflow-hidden group border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-32 h-32 text-teal-400" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                  <Target className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Active Simulation Result</h3>
                  <p className="text-sm text-teal-400/70 font-bold uppercase tracking-widest">Engine_v0.1</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Predicted Outcome</span>
                    <p className="text-lg font-bold text-white leading-tight">{activeSimulation.outcome}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Critical Warning</span>
                    </div>
                    <p className="text-sm text-red-200/80 font-medium">{activeSimulation.risk}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <MetricGauge label="Confidence Score" value={activeSimulation.confidence} color="cyan" />
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">AI Suggestion</span>
                    </div>
                    <p className="text-sm text-teal-100/80 font-medium">{activeSimulation.suggestion}</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Today's Schedule */}
          <GlassPanel className="p-6 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Today's Directive</h3>
              </div>
              <button 
                onClick={() => setActivePanel('simulation')}
                className="text-xs font-bold text-teal-400 uppercase tracking-widest hover:text-teal-300 transition-colors flex items-center gap-2"
              >
                Manage Tasks <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No active tasks. Add tasks in Simulation Panel.
                </div>
              )}
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-teal-500/20 transition-all cursor-pointer shadow-lg shadow-black/20 ${task.status === 'Completed' ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-slate-500'}`} />
                    <div>
                      <p className={`text-sm font-bold text-slate-200 group-hover:text-white transition-colors ${task.status === 'Completed' ? 'line-through' : ''}`}>{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                        <span className="text-[10px] font-bold text-teal-500/50 uppercase tracking-widest">{task.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${task.status === 'Completed' ? 'border-teal-500 bg-teal-500/20' : 'border-white/10 group-hover:border-teal-500/50'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${task.status === 'Completed' ? 'text-teal-400' : 'text-slate-600 group-hover:text-teal-400'} transition-colors`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right Column: Cognitive & Insights */}
        <div className="space-y-6">
          {/* Cognitive Load Meter */}
          <GlassPanel className="p-6 border-white/10 bg-teal-500/[0.02]">
            <div className="flex items-center gap-3 mb-8">
              <Brain className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Cognitive Load</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Biosignals</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4 mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80" cy="80" r="70"
                    fill="none" stroke="currentColor" strokeWidth="12"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="80" cy="80" r="70"
                    fill="none" stroke="currentColor" strokeWidth="12"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * (systemMetrics.memory / 100)) }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white leading-none">{Math.round(systemMetrics.memory)}%</span>
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-1">
                    {systemMetrics.memory > 80 ? 'CRITICAL' : systemMetrics.memory > 60 ? 'ELEVATED' : 'OPTIMAL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <MetricGauge label="Burnout Risk" value={systemMetrics.memory > 70 ? 45 : 12} color="orange" />
              <MetricGauge label="Focus Efficiency" value={100 - (systemMetrics.cpu / 2)} color="green" />
            </div>
          </GlassPanel>

          {/* AI Insights Page Preview */}
          <GlassPanel className="p-6 border-white/5 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">Pattern Discovery</h3>
            </div>
            
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                  <div className="mt-1">
                    <TrendingUp className="w-4 h-4 text-teal-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs font-medium text-slate-300 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => setActivePanel('patterns')}
                className="w-full py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
              >
                Full Analytics Report
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
