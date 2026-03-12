import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HolographicAvatar() {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500);
    }, 5000);
    return () => clearInterval(scanInterval);
  }, []);

  return (
    <div className="absolute top-[20%] right-[10%] w-64 h-64 pointer-events-none z-20 flex justify-center items-center">
      {/* Holographic Container */}
      <div className="relative w-32 h-32 opacity-80">
        
        {/* Core Base Shape */}
        <motion.div 
          className="absolute inset-0 bg-[#00E6FF]/10 border border-[#00E6FF]/30 backdrop-blur-md"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner Circuit/Eye pattern */}
        <div className="absolute inset-4 flex justify-center items-center gap-4">
          <motion.div 
            className="w-2 h-6 bg-[#00E6FF] shadow-[0_0_15px_#00E6FF]"
            animate={{ 
              height: isScanning ? [24, 2, 24] : 24,
              opacity: isScanning ? [1, 0.4, 1] : 1
            }}
            transition={{ duration: 0.2, repeat: isScanning ? 4 : 0 }}
          />
          <motion.div 
            className="w-2 h-6 bg-[#00E6FF] shadow-[0_0_15px_#00E6FF]"
            animate={{ 
              height: isScanning ? [24, 2, 24] : 24,
              opacity: isScanning ? [1, 0.4, 1] : 1
            }}
            transition={{ duration: 0.2, repeat: isScanning ? 4 : 0, delay: 0.1 }}
          />
        </div>

        {/* Scanline Effect */}
        {isScanning && (
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-[#2AF6FF] shadow-[0_0_10px_#2AF6FF] z-10"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </div>

      {/* Floating Status Text */}
      <motion.div 
        className="absolute -bottom-8 px-3 py-1 bg-[#00E6FF]/10 border border-[#00E6FF]/30 text-[6px] font-black text-[#00E6FF] tracking-widest uppercase rounded-sm"
        animate={{ opacity: isScanning ? [0.4, 1, 0.4] : 0.6 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {isScanning ? 'SYNCHRONIZING' : 'CORE IDLE'}
      </motion.div>
    </div>
  );
}
