import { motion } from 'framer-motion';
import { Activity, Brain, AlertTriangle, TrendingUp, Zap, Clock, Smile, Frown, Meh } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { MetricGauge } from './MetricGauge';

export function CognitivePanel() {
  const loadScore = 62;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-[#0f172a]/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Cognitive Load Monitor</h2>
          <p className="text-slate-400 font-medium mt-1">Real-time mental workload analysis</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Live_Biometrics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-8 lg:col-span-2 border-white/10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-48 h-48 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96" cy="96" r="85"
                fill="none" stroke="currentColor" strokeWidth="16"
                className="text-white/5"
              />
              <motion.circle
                cx="96" cy="96" r="85"
                fill="none" stroke="currentColor" strokeWidth="16"
                strokeDasharray={534}
                initial={{ strokeDashoffset: 534 }}
                animate={{ strokeDashoffset: 534 - (534 * loadScore / 100) }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white leading-none">{loadScore}%</span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-2">Current_Load</span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Mental State: Focused</h3>
              <p className="text-sm text-slate-400 leading-relaxed italic">
                "Your cognitive patterns show high analytical efficiency. However, pre-frontal cortex fatigue is starting to plateau."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stress Level</p>
                <div className="flex items-center gap-2">
                  <Meh className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">Moderate</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alertness</p>
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-white">Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel className="p-6 border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Burnout Risk Analytics</h3>
            <div className="space-y-6">
              <MetricGauge label="Daily Accumulation" value={45} color="blue" />
              <MetricGauge label="Weekly Trend" value={22} color="green" />
              <MetricGauge label="Burnout Probability" value={14} color="cyan" />
            </div>
          </GlassPanel>
          
          <GlassPanel className="p-6 border-red-500/20 bg-red-500/[0.02]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Critical Insight</h4>
                <p className="text-xs text-red-200/70 leading-relaxed font-medium">
                  Continuous focus duration has exceeded 120 minutes. Productivity decay is expected within 15 minutes.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      <GlassPanel className="p-6 border-white/5 overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Focus History (Last 6 Hours)</h3>
        <div className="h-32 flex items-end gap-2 px-2">
          {[40, 65, 80, 55, 70, 90, 85, 60, 45, 50, 75, 62].map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ delay: i * 0.05, duration: 1 }}
              className={`flex-1 rounded-t-lg ${val > 80 ? 'bg-red-500/50' : val > 60 ? 'bg-teal-500/50' : 'bg-slate-500/30'}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
          <span>12:00 PM</span>
          <span>03:00 PM</span>
          <span>Now</span>
        </div>
      </GlassPanel>
    </div>
  );
}
