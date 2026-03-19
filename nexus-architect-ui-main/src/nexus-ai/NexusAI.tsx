import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CognitiveField } from './components/CognitiveField';
import { ThoughtBlob } from './components/ThoughtBlob';
import { FluidInput } from './components/FluidInput';
import { NexusText } from './components/NexusText';
import { useNexusState } from './hooks/useNexusState';
import { Canvas } from '@react-three/fiber';
import './styles/nexus-ai.css';

export const NexusAI: React.FC = () => {
  const { state, transitionTo } = useNexusState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleInput = useCallback((text: string) => {
    setHistory(prev => [text, ...prev]);
    setIsInitialized(true);
    transitionTo('THINKING');

    setTimeout(() => {
      transitionTo('EXECUTING');
      setTimeout(() => {
        transitionTo('SUCCESS');
        setTimeout(() => transitionTo('IDLE'), 3000);
      }, 4000);
    }, 2000);
  }, [transitionTo]);

  const stateLabel = useMemo(() => {
    switch (state) {
      case 'THINKING': return 'Cognitive Processing...';
      case 'EXECUTING': return 'Directive Execution...';
      case 'SUCCESS': return 'Intent Resolved';
      case 'ERROR': return 'Neural Fragmentation';
      default: return 'Field Stabilized';
    }
  }, [state]);

  return (
    <div className="nexus-ai-root">
      <CognitiveField />

      {/* State & Neural Info */}
      <div className="nexus-state-indicator">
        <NexusText text={`STATUS: ${state}`} delay={1} />
        <div className="mt-2 opacity-50">
          <NexusText text={stateLabel} delay={1.5} />
        </div>
      </div>

      <main className="relative z-10 w-full h-full flex flex-col overflow-hidden">
        
        {/* Thought Formation Zone */}
        <div className="flex-grow flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!isInitialized ? (
              <motion.div
                key="entry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <h1 className="text-6xl font-extralight tracking-[0.8em] text-white opacity-40 uppercase mb-8">
                  Nexus
                </h1>
                <NexusText 
                  text="Awaiting Human Directive" 
                  className="text-xs tracking-[0.5em] text-white opacity-20 uppercase"
                  delay={1}
                />
              </motion.div>
            ) : (
              <motion.div
                key="system"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-[600px] h-[600px] relative"
              >
                {/* Central Intelligence Core */}
                <Canvas camera={{ position: [0, 0, 3] }} alpha={true}>
                  <ambientLight intensity={0.2} />
                  <pointLight position={[10, 10, 10]} intensity={0.5} />
                  <ThoughtBlob state={state} />
                </Canvas>
                
                {/* Internal Ripples (UI Overlay) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div 
                    animate={{ 
                      scale: state === 'EXECUTING' ? [1, 1.2, 1] : 1,
                      opacity: state === 'EXECUTING' ? [0.1, 0.3, 0.1] : 0.1
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-full h-full border border-white/10 rounded-full blur-2xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cognitive Overlays (Drifting) */}
        {isInitialized && (
          <>
            {/* Memory Field (Right) */}
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 2 }}
              className="absolute top-1/4 right-12 w-72 nexus-overlay-drifting"
            >
              <div className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-6 border-b border-white/5 pb-2">
                Memory Field
              </div>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-light opacity-40 hover:opacity-100 transition-all cursor-default leading-relaxed"
                  >
                    <span className="opacity-30 mr-3 text-[10px] font-mono">[{history.length - i}]</span>
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Neural Pathways (Left) */}
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 2 }}
              className="absolute bottom-1/4 left-12 w-56 nexus-overlay-drifting"
              style={{ animationDelay: '-5s' }}
            >
              <div className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-6 border-b border-white/5 pb-2">
                Focus Zones
              </div>
              <div className="space-y-8">
                {['Neural Link', 'Semantic Map', 'Logic Flux', 'Action Stream'].map((zone, i) => (
                  <div key={zone} className="group cursor-pointer">
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 group-hover:text-teal-400 transition-all">
                      {zone}
                    </div>
                    <motion.div 
                      className="h-[1px] bg-white/10 mt-2 origin-left" 
                      whileHover={{ scaleX: 1.5, backgroundColor: 'rgba(0, 255, 209, 0.3)' }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Intelligence Interface (Input) */}
        <div className={`transition-all duration-1000 ${isInitialized ? 'mb-12' : 'mb-[20vh]'}`}>
          <FluidInput onSubmit={handleInput} isExpanded={isInitialized} />
        </div>
      </main>

      {/* Global Vignette & Noise */}
      <div 
        className="absolute inset-0 pointer-events-none z-50" 
        style={{ 
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
          mixBlendMode: 'multiply'
        }} 
      />
    </div>
  );
};
