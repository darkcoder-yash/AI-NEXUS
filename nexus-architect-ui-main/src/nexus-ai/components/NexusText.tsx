import React from 'react';
import { motion } from 'framer-motion';

interface NexusTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const NexusText: React.FC<NexusTextProps> = ({ text, className = "", delay = 0 }) => {
  const characters = text.split("");

  return (
    <div className={`nexus-progressive-text ${className}`}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.03,
            ease: "easeOut"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};
