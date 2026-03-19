import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FluidInputProps {
  onSubmit: (text: string) => void;
  isExpanded?: boolean;
}

export const FluidInput: React.FC<FluidInputProps> = ({ onSubmit, isExpanded }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      layout
      className={`relative w-full flex justify-center ${isExpanded ? 'mt-auto pb-10' : 'items-center h-full'}`}
    >
      <div className="relative w-full max-w-2xl px-6">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="nova-fluid-input"
          placeholder="Intent..."
          autoFocus
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.2 }}
          className="absolute bottom-0 left-6 right-6 h-[1px] bg-white origin-center"
        />
      </div>
    </motion.div>
  );
};
