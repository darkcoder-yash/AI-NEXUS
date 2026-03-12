import { motion } from 'framer-motion';

export function FloatingData() {
  const fragments = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 15,
    text: `SYS_FRAG_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
    data: Math.random() > 0.5 ? '0x' + Math.random().toString(16).slice(2, 8).toUpperCase() : 'NULL_POINTER'
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {fragments.map(frag => (
        <motion.div
          key={frag.id}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: [0, -80, 0], 
            opacity: [0, 0.4, 0],
            rotateX: [0, 15, 0],
            rotateY: [0, 20, 0]
          }}
          transition={{
            duration: frag.duration,
            repeat: Infinity,
            delay: frag.delay,
            ease: "linear"
          }}
          className="absolute text-[9px] font-mono text-[#00E6FF] p-3 border border-[#00E6FF]/20 bg-[#071A1F]/30 backdrop-blur-md rounded-lg shadow-[0_0_15px_rgba(0,230,255,0.1)]"
          style={{ top: frag.top, left: frag.left }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-[#2AF6FF] rounded-full animate-pulse" />
            <span className="font-bold tracking-widest">{frag.text}</span>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-[#00E6FF]/50 to-transparent my-1.5" />
          <div className="text-[#E9FFFF]/60 tracking-wider">{frag.data}</div>
        </motion.div>
      ))}
    </div>
  );
}
