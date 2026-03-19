import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CognitiveField } from './components/CognitiveField';
import { ThoughtBlob } from './components/ThoughtBlob';
import { FluidInput } from './components/FluidInput';
import { useNovaState, NovaState } from './hooks/useNovaState';
import { Canvas } from '@react-three/fiber';
import './styles/nova-os.css';

export const NovaOS: React.FC = () => {
  const { state, transitionTo } = useNovaState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleInput = useCallback((text: string) => {
    setHistory(prev => [text, ...prev]);
    setIsInitialized(true);
    transitionTo('THINKING');

    // Simulate thinking process
    setTimeout(() => {
      transitionTo('EXECUTING');
      setTimeout(() => {
        transitionTo('SUCCESS');
        setTimeout(() => transitionTo('IDLE'), 3000);
      }, 4000);
    }, 2000);
  }, [transitionTo]);

  return (
    <div className="nova-os-root">
      <CognitiveField />

      {/* State Indicator */}
      <div className="nova-state-indicator">
        {state}
      </div>

      <main className="relative z-10 w-full h-full flex flex-col overflow-hidden">
        
        {/* Thought Formation Zone */}
        <div className="flex-grow flex items-center justify-center relative">
          <AnimatePresence>
            {isInitialized && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-[400px] h-[400px]"
              >
                <Canvas camera={{ position: [0, 0, 3] }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <ThoughtBlob state={state} />
                </Canvas>
              </motion.div>
            )}
          </AnimatePresence>

          {!isInitialized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute text-center"
            >
              <h1 className="text-4xl font-light tracking-[0.5em] text-white opacity-40 uppercase">
                Nova OS
              </h1>
              <p className="text-sm tracking-widest text-white opacity-20 mt-4 uppercase">
                Cognitive Field Active
              </p>
            </motion.div>
          )}
        </div>

        {/* Cognitive Overlays */}
        {isInitialized && (
          <>
            {/* Memory / History (Right) */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-1/2 right-10 -translate-y-1/2 w-64 nova-overlay-panel"
            >
              <div className="text-[10px] uppercase tracking-widest opacity-30 mb-4">Memory Field</div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-light opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tools / Agents (Left) */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-1/2 left-10 -translate-y-1/2 w-48 nova-overlay-panel"
            >
              <div className="text-[10px] uppercase tracking-widest opacity-30 mb-4">Focus Zones</div>
              <div className="space-y-6">
                {['Vision', 'Language', 'Reasoning', 'Action'].map((zone) => (
                  <div key={zone} className="group cursor-pointer">
                    <div className="text-xs uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">
                      {zone}
                    </div>
                    <div className="h-[1px] w-0 group-hover:w-full bg-white opacity-20 transition-all duration-500 mt-1" />
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Input Field */}
        <FluidInput onSubmit={handleInput} isExpanded={isInitialized} />
      </main>

      {/* Final Visual Polish */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.4) 100%)' 
        }} 
      />
    </div>
  );
};
