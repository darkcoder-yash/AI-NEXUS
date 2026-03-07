import { motion } from 'framer-motion';
import { LineChart, TrendingUp, Calendar, Zap, Clock, BarChart3, PieChart, Info } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

export function PatternInsights() {
  const insights = [
    { title: 'Peak Performance Window', value: '09:00 - 11:30', desc: 'You complete 40% more tasks during this window.', icon: Zap },
    { title: 'Focus Decay Rate', value: '-12% / hr', desc: 'After 2 hours of deep work, efficiency drops steadily.', icon: TrendingUp },
    { title: 'Meeting Impact', value: 'High', desc: 'Context switching after meetings takes avg 24 minutes.', icon: BarChart3 },
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-[#0f172a]/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Life Pattern Discovery</h2>
          <p className="text-slate-400 font-medium mt-1">Behavioral analytics and productivity intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-teal-500/50 transition-all text-slate-300">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, i) => (
          <GlassPanel key={i} className="p-6 space-y-4 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <insight.icon className="w-16 h-16 text-teal-400" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <insight.icon className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{insight.title}</p>
              <p className="text-2xl font-black text-white mt-1">{insight.value}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{insight.desc}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-8 border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
              <PieChart className="w-5 h-5 text-teal-400" /> Time Distribution
            </h3>
            <Info className="w-4 h-4 text-slate-600" />
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Deep Work', val: 45, color: 'bg-teal-500' },
              { label: 'Communication', val: 25, color: 'bg-blue-500' },
              { label: 'Research', val: 20, color: 'bg-purple-500' },
              { label: 'Administrative', val: 10, color: 'bg-slate-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>{item.label}</span>
                  <span className="text-white">{item.val}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${item.color} shadow-[0_0_10px_rgba(var(--primary),0.3)]`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-8 border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400" /> Weekly Momentum
            </h3>
            <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold">
              <span>+18.4%</span>
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-3 px-2">
            {[30, 45, 35, 60, 85, 70, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className={`w-full rounded-t-xl ${i === 6 ? 'bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-white/10 group-hover:bg-white/20 transition-all'}`}
                />
                <span className="text-[10px] font-bold text-slate-500">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
