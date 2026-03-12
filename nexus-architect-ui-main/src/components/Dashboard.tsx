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
    <div className="p-10 space-y-10 overflow-y-auto h-full scrollbar-thin bg-transparent relative">
      <div className="nu-scanlines" />
      
      {/* Header */}
      <div className="flex items-end justify-between relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-[0.2em] nu-glitch-text">AI NEXUS Dashboard</h2>
          <p className="text-slate-500 font-medium mt-2 tracking-[0.5em] text-[10px] uppercase">Unified Command for Human Life Management</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-5 py-2.5 rounded-sm bg-white/[0.02] border border-white/10 flex items-center gap-3 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-[#00E6FF] drop-shadow-[0_0_5px_rgba(0,230,255,0.5)]" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Biometric_Verified</span>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#00E6FF]/5 border border-[#00E6FF]/20 flex items-center justify-center hover:bg-[#00E6FF]/10 transition-colors cursor-pointer group">
            <User className="w-5 h-5 text-[#00E6FF] group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Schedule & Cognitive */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Simulation View */}
          {activeSimulation && (
            <GlassPanel className="p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-40 h-40 text-[#00E6FF]" />
              </div>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-sm bg-[#00E6FF]/10 flex items-center justify-center border border-[#00E6FF]/20">
                  <Target className="w-7 h-7 text-[#00E6FF]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-widest">Active Simulation</h3>
                  <p className="text-[9px] text-[#00E6FF] font-black uppercase tracking-[0.5em] mt-1">Engine_v0.1 // Predictive_Core</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="p-6 rounded-sm bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2">Predicted Outcome</span>
                    <p className="text-xl font-bold text-white leading-tight tracking-tight">{activeSimulation.outcome}</p>
                  </div>
                  <div className="p-6 rounded-sm bg-red-500/5 border border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em]">Critical Warning</span>
                    </div>
                    <p className="text-sm text-red-100/70 font-medium leading-relaxed">{activeSimulation.risk}</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <MetricGauge label="Confidence Score" value={activeSimulation.confidence} color="cyan" />
                  <div className="p-6 rounded-sm bg-[#00E6FF]/5 border border-[#00E6FF]/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00E6FF]/50" />
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#00E6FF]" />
                      <span className="text-[9px] font-black text-[#00E6FF] uppercase tracking-[0.4em]">AI Suggestion</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{activeSimulation.suggestion}</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Today's Schedule */}
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-[#00E6FF]" />
                <h3 className="text-xl font-black text-white tracking-widest">Today's Directive</h3>
              </div>
              <button 
                onClick={() => setActivePanel('simulation')}
                className="text-[9px] font-black text-[#00E6FF] uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 group"
              >
                Launch Simulation <ArrowRight className="w-3 h-3 group-hover:translateX(5px) transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {tasks.length === 0 && (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-sm text-slate-600 font-black uppercase tracking-[0.5em] text-[10px]">
                  No active tasks detected.
                </div>
              )}
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-center justify-between p-5 rounded-sm bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-[#00E6FF]/30 transition-all cursor-pointer ${task.status === 'Completed' ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-1 h-8 ${task.priority === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-slate-700'}`} />
                    <div>
                      <p className={`text-base font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight ${task.status === 'Completed' ? 'line-through' : ''}`}>{task.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] font-black text-slate-600 flex items-center gap-1.5 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                        <span className="text-[9px] font-black text-[#00E6FF]/40 uppercase tracking-[0.3em]">{task.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${task.status === 'Completed' ? 'border-[#00E6FF] bg-[#00E6FF]/10' : 'border-white/10 group-hover:border-[#00E6FF]/50'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${task.status === 'Completed' ? 'text-[#00E6FF]' : 'text-slate-700 group-hover:text-[#00E6FF]'} transition-colors`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right Column: Cognitive & Insights */}
        <div className="lg:col-span-4 space-y-8">
          {/* Cognitive Load Meter */}
          <GlassPanel className="p-8 border-[#00E6FF]/10">
            <div className="flex items-center gap-4 mb-10">
              <Brain className="w-8 h-8 text-[#00E6FF]" />
              <div>
                <h3 className="text-lg font-black text-white tracking-widest">Neural Load</h3>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mt-1">Real-time Biosignals</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 mb-10 relative">
              <div className="absolute inset-0 bg-radial-gradient(circle, rgba(0,230,255,0.05) 0%, transparent 70%) pointer-events-none" />
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="86"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="96" cy="96" r="86"
                    fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={540}
                    initial={{ strokeDashoffset: 540 }}
                    animate={{ strokeDashoffset: 540 - (540 * (systemMetrics.memory / 100)) }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className="text-[#00E6FF] drop-shadow-[0_0_15px_rgba(0,230,255,0.6)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white leading-none tracking-tighter">{Math.round(systemMetrics.memory)}%</span>
                  <span className="text-[9px] font-black text-[#00E6FF] uppercase tracking-[0.5em] mt-3">
                    {systemMetrics.memory > 80 ? 'CRITICAL' : systemMetrics.memory > 60 ? 'ELEVATED' : 'OPTIMAL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <MetricGauge label="Burnout Risk" value={systemMetrics.memory > 70 ? 45 : 12} color="orange" />
              <MetricGauge label="Focus Efficiency" value={100 - (systemMetrics.cpu / 2)} color="cyan" />
            </div>
          </GlassPanel>

          {/* AI Insights Page Preview */}
          <GlassPanel className="p-8 overflow-hidden relative">
            <div className="flex items-center gap-4 mb-8">
              <BarChart3 className="w-6 h-6 text-[#00E6FF]" />
              <h3 className="text-lg font-black text-white tracking-widest">Insights</h3>
            </div>
            
            <div className="space-y-5">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-sm bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-0.5 h-0 group-hover:h-full bg-[#00E6FF] transition-all duration-300" />
                  <div className="mt-1">
                    <TrendingUp className="w-4 h-4 text-[#00E6FF] opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 leading-relaxed transition-colors">{insight}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={() => setActivePanel('patterns')}
                className="w-full py-4 rounded-sm bg-white/[0.02] border border-white/10 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-[#00E6FF]/5 hover:text-[#00E6FF] hover:border-[#00E6FF]/30 transition-all"
              >
                Neural Analytics Report
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
