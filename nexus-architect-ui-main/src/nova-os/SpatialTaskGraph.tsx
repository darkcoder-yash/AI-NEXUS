import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useNovaStore } from '@/store/useNovaStore';
import { motion } from 'framer-motion';

export function SpatialTaskGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const tasks = useNovaStore(s => s.tasks);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render Connections */}
      {tasks.map(task => 
        task.connections.map(targetId => {
          const target = tasks.find(t => t.id === targetId);
          if (!target) return null;
          
          const isActive = task.status === 'active' || target.status === 'active';
          
          return (
            <Line 
              key={`${task.id}-${targetId}`}
              points={[task.position, target.position]}
              color={isActive ? "#00E6FF" : "#ffffff"}
              lineWidth={isActive ? 2 : 0.5}
              transparent
              opacity={isActive ? 0.8 : 0.1}
            />
          );
        })
      )}

      {/* Render Nodes */}
      {tasks.map(task => {
        const color = task.status === 'completed' ? '#00FF88' : 
                      task.status === 'active' ? '#00E6FF' : 
                      task.status === 'error' ? '#FF0055' : '#444444';

        return (
          <group key={task.id} position={task.position}>
            <Sphere args={[0.15, 16, 16]}>
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </Sphere>
            
            <Html distanceFactor={10} center>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1 rounded border backdrop-blur-md whitespace-nowrap
                  ${task.status === 'active' ? 'border-[#00E6FF] bg-[#00E6FF]/10 text-[#00E6FF] shadow-[0_0_15px_rgba(0,230,255,0.5)]' : 
                    task.status === 'completed' ? 'border-[#00FF88] bg-[#00FF88]/5 text-[#00FF88]/70' :
                    'border-white/10 bg-black/50 text-white/50'}
                `}
                style={{ fontFamily: 'Exo, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}
              >
                {task.label}
              </motion.div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
