import { motion } from 'framer-motion';

export default function FloatingData() {
  const fragments = [
    { type: 'code', content: 'SYS.INIT(0x4F)', x: '10%', y: '20%', delay: 0 },
    { type: 'panel', content: 'NEURAL LINK: ESTABLISHED', x: '80%', y: '15%', delay: 1 },
    { type: 'hexagon', x: '85%', y: '60%', delay: 2 },
    { type: 'code', content: 'MEM_ALLOC: 99.9%', x: '15%', y: '70%', delay: 0.5 },
    { type: 'panel', content: 'QUANTUM STATE: STABLE', x: '75%', y: '80%', delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {fragments.map((frag, i) => {
        if (frag.type === 'code') {
          return (
            <motion.div
              key={i}
              className="absolute text-[8px] font-mono text-[#00E6FF]/40 tracking-widest"
              initial={{ opacity: 0, x: frag.x, y: frag.y }}
              animate={{ 
                opacity: [0, 0.4, 0],
                y: [`calc(${frag.y} + 20px)`, `calc(${frag.y} - 20px)`]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: frag.delay,
                ease: 'linear'
              }}
            >
              {frag.content}
            </motion.div>
          );
        }
        
        if (frag.type === 'panel') {
          return (
            <motion.div
              key={i}
              className="absolute px-3 py-1.5 border border-[#00E6FF]/20 bg-[#00E6FF]/5 backdrop-blur-sm rounded-sm text-[6px] font-black text-[#00E6FF] uppercase tracking-[0.2em]"
              initial={{ opacity: 0, x: frag.x, y: frag.y, scale: 0.8 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0.8, 1, 0.8],
                rotateX: [0, 10, 0],
                rotateY: [0, 15, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: frag.delay,
                ease: 'easeInOut'
              }}
              style={{ perspective: 1000 }}
            >
              {frag.content}
            </motion.div>
          );
        }

        if (frag.type === 'hexagon') {
          return (
            <motion.div
              key={i}
              className="absolute w-8 h-8 border border-[#2AF6FF]/30"
              style={{ 
                x: frag.x, y: frag.y, 
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                rotate: 360,
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: frag.delay,
                ease: 'linear'
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
