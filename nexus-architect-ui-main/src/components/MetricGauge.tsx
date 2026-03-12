import React from 'react';
import { motion } from 'framer-motion';

interface MetricGaugeProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red';
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({ 
  label, 
  value, 
  max = 100, 
  unit = '%',
  color = 'cyan'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colorMap = {
    blue: '#2AF6FF',
    purple: '#BF00FF',
    cyan: '#00E6FF',
    green: '#00FF9D',
    orange: '#FF9D00',
    red: '#FF0055'
  };

  const activeColor = colorMap[color];

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-black font-orbitron"
            style={{ color: activeColor, textShadow: `0 0 10px ${activeColor}44` }}
          >
            {value}
          </motion.span>
          <span className="text-[10px] font-bold text-slate-600">{unit}</span>
        </div>
      </div>
      
      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        {/* Background segments for tech look */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-full bg-white/10" />
          ))}
        </div>
        
        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative h-full rounded-full"
          style={{ 
            backgroundColor: activeColor,
            boxShadow: `0 0 15px ${activeColor}88`
          }}
        >
          {/* Animated scanning light */}
          <motion.div 
            animate={{ x: ['-100%', '400%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        </motion.div>
      </div>
      
      <div className="flex justify-between text-[8px] font-bold text-slate-700 tracking-tighter uppercase">
        <span>Min_Level</span>
        <span>Operational_Cap_Max</span>
      </div>
    </div>
  );
};
