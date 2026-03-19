import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NovaState } from '../hooks/useNovaState';

interface ThoughtBlobProps {
  state: NovaState;
}

export const ThoughtBlob: React.FC<ThoughtBlobProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  const config = useMemo(() => {
    switch (state) {
      case 'THINKING':
        return { distortion: 0.5, speed: 2, color: '#00a3ff' };
      case 'EXECUTING':
        return { distortion: 1.0, speed: 4, color: '#8a2be2' };
      case 'SUCCESS':
        return { distortion: 0.1, speed: 0.5, color: '#39ff14' };
      case 'ERROR':
        return { distortion: 2.0, speed: 10, color: '#ff3131' };
      default:
        return { distortion: 0.2, speed: 1, color: '#00ffd1' };
    }
  }, [state]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * config.speed;
    
    // Update mesh distortion (simplified for now with scale/rotation)
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.z = time * 0.1;
    
    const s = 1 + Math.sin(time) * 0.05 * config.distortion;
    meshRef.current.scale.set(s, s, s);

    // Dynamic color shifting
    if (materialRef.current) {
      materialRef.current.color.lerp(new THREE.Color(config.color), 0.05);
      materialRef.current.emissive.lerp(new THREE.Color(config.color), 0.05);
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(time) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={config.color}
        wireframe
        transparent
        opacity={0.6}
        emissive={config.color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};
