import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useNovaStore } from '@/store/useNovaStore';

export function NovaCore() {
  const meshRef = useRef<THREE.Group>(null);
  const systemState = useNovaStore(s => s.systemState);
  
  const nodesCount = 150;
  
  const nodes = useMemo(() => {
    const temp = new Float32Array(nodesCount * 3);
    for (let i = 0; i < nodesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 2 + Math.random() * 0.5;
      temp[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      temp[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      temp[i * 3 + 2] = radius * Math.cos(phi);
    }
    return temp;
  }, [nodesCount]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      let speed = 0.1;
      if (systemState === 'thinking') speed = 0.5;
      if (systemState === 'executing') speed = 0.8;
      if (systemState === 'error') speed = 0.05;

      // Smoothly interpolate rotation speed
      meshRef.current.rotation.y += speed * 0.05;
      meshRef.current.rotation.z += speed * 0.02;

      // Add glitch effect on error
      if (systemState === 'error') {
        meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
      } else {
        meshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }
    }
  });

  const getCoreColor = () => {
    switch (systemState) {
      case 'thinking': return '#8A2BE2'; // Deep purple
      case 'planning': return '#00E6FF'; // Electric cyan
      case 'executing': return '#00FF88'; // Neon green
      case 'success': return '#FFFFFF'; // Bright white
      case 'error': return '#FF0055'; // Red
      default: return '#00E6FF'; // Idle blue
    }
  };

  return (
    <group ref={meshRef}>
      {/* Outer neural shell */}
      <Points positions={nodes} stride={3}>
        <PointMaterial 
          transparent 
          color={getCoreColor()} 
          size={0.05} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </Points>
      
      {/* Inner quantum core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color={getCoreColor()} 
          transparent 
          opacity={systemState === 'idle' ? 0.1 : 0.3} 
          wireframe={systemState === 'planning'}
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
}
