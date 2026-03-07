import { motion } from 'framer-motion';
import { Share2, Search, Plus, Filter, Database, Link as LinkIcon, User, Briefcase, FileText } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

export function KnowledgeGraph() {
  const nodes = [
    { id: 1, label: 'Alex Chen', type: 'Person', connections: 3 },
    { id: 2, label: 'AI NEXUS Project', type: 'Project', connections: 5 },
    { id: 3, label: 'Q1 Review', type: 'Meeting', connections: 2 },
    { id: 4, label: 'Architecture.pdf', type: 'Document', connections: 1 },
    { id: 5, label: 'Database Design', type: 'Task', connections: 2 },
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-[#0f172a]/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Personal Knowledge Graph</h2>
          <p className="text-slate-400 font-medium mt-1">Mapping connections across your life data</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
          <button className="px-6 py-3 rounded-xl bg-teal-500 text-teal-950 font-bold uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            <Plus className="w-5 h-5" /> Add Entity
          </button>
        </div>
      </div>

      {/* Graph Visualizer Placeholder */}
      <GlassPanel className="h-[400px] border-white/10 relative overflow-hidden bg-black/40 group">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent" />
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="relative w-64 h-64 border border-teal-500/10 rounded-full flex items-center justify-center"
          >
            <div className="absolute w-2 h-2 bg-teal-400 rounded-full top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
            <div className="w-32 h-32 border border-teal-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Share2 className="w-12 h-12 text-teal-400 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Mock Nodes */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/4 left-1/3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:border-teal-500/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI_NEXUS_Project</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-1/3 right-1/4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:border-teal-500/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Alex_Chen</span>
          </div>
        </motion.div>

        <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl">
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em] mb-2">Graph Stats</p>
          <div className="space-y-1">
            <p className="text-xs text-white font-mono">NODES: 1,242</p>
            <p className="text-xs text-white font-mono">EDGES: 4,891</p>
            <p className="text-xs text-white font-mono">DENSITY: 0.12</p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-6 border-white/5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Entities</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                placeholder="Search graph..." 
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs outline-none focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            {nodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    {node.type === 'Person' ? <User className="w-4 h-4 text-teal-400" /> : 
                     node.type === 'Project' ? <Briefcase className="w-4 h-4 text-teal-400" /> : 
                     <FileText className="w-4 h-4 text-teal-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{node.label}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{node.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-slate-600" />
                  <span className="text-xs font-mono text-slate-400">{node.connections} links</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Discovery Engine</h3>
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">New Path Found</p>
            <p className="text-xs text-teal-100/70 leading-relaxed font-medium">
              "Architecture.pdf" shares 4 semantic keywords with "Alex Chen's" recent meeting notes. Suggest linking?
            </p>
            <button className="mt-4 w-full py-2 rounded-lg bg-teal-500 text-teal-950 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-400 transition-all">
              Confirm Link
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sync Status</span>
              <span className="text-teal-400 font-bold uppercase tracking-widest text-[9px]">Live_Sync</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Last Index</span>
              <span className="text-slate-200 font-mono">2m ago</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
