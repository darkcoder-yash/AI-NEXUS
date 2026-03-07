import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  neon?: 'blue' | 'purple' | 'orange' | 'none';
  animate?: boolean;
  onClick?: () => void;
}

export function GlassPanel({ children, className = '', neon = 'none', animate = true, onClick }: GlassPanelProps) {
  const neonClass = neon === 'blue' ? 'neon-border-blue shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 
                    neon === 'purple' ? 'neon-border-purple shadow-[0_0_15px_rgba(var(--neon-purple),0.1)]' : 
                    neon === 'orange' ? 'neon-border-orange shadow-[0_0_15px_rgba(var(--neon-orange),0.1)]' : '';
  
  const baseClasses = `bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-2xl ${neonClass} ${className}`;

  if (!animate) return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
