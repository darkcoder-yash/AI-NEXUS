import React from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  neon?: 'cyan' | 'orange' | 'blue' | 'none';
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = "", 
  animate = true,
  neon = 'none',
  onClick
}) => {
  const neonStyles = {
    cyan: 'border-[#00E6FF]/20 shadow-[0_0_15px_rgba(0,230,255,0.05)] hover:border-[#00E6FF]/40',
    orange: 'border-[#FF9D00]/20 shadow-[0_0_15px_rgba(255,157,0,0.05)] hover:border-[#FF9D00]/40',
    blue: 'border-[#2AF6FF]/20 shadow-[0_0_15px_rgba(42,246,255,0.05)] hover:border-[#2AF6FF]/40',
    none: 'border-white/5 hover:border-white/10'
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.98 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`
        nu-glass
        rounded-2xl
        p-6
        transition-all
        duration-500
        ${neonStyles[neon]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
