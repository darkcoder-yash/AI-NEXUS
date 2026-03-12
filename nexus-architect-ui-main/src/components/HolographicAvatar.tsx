import { motion } from 'framer-motion';
import { BrainCircuit, ScanLine } from 'lucide-react';

export function HolographicAvatar() {
  return (
    <div className="fixed bottom-12 left-12 z-40 pointer-events-none">
      <div className="relative w-36 h-36 rounded-full border border-[#00E6FF]/20 flex items-center justify-center bg-[#06141A]/60 backdrop-blur-2xl overflow-hidden shadow-[0_0_30px_rgba(0,230,255,0.1)]">
        
        {/* Breathing inner glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-radial-gradient from-[#00E6FF]/20 to-transparent rounded-full"
        />

        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <BrainCircuit className="w-16 h-16 text-[#00E6FF] drop-shadow-[0_0_10px_rgba(0,230,255,0.8)]" />
        </motion.div>
        
        {/* Holographic Scan Line */}
        <motion.div
          animate={{ y: ['-100%', '400%'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#2AF6FF] to-transparent shadow-[0_0_10px_#2AF6FF]"
        />

        <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
          <ScanLine className="w-24 h-24 text-white" />
        </div>
        
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-orbitron text-[#E9FFFF] tracking-[0.3em] font-bold bg-[#020B0F]/80 px-3 py-1.5 rounded border border-[#00E6FF]/40 shadow-[0_0_10px_rgba(0,230,255,0.2)] whitespace-nowrap">
          A.V.A - IDLE
        </div>
      </div>
    </div>
  );
}
