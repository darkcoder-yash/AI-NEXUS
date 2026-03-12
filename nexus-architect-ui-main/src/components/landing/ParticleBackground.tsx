import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { random } from 'maath';

function ParticleGrid() {
  const ref = useRef<THREE.Points>(null);
  
  // Create a sphere distribution of particles
  const sphere = random.inSphere(new Float32Array(5000 * 3), { radius: 15 }) as Float32Array;

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00E6FF"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ParticleGrid />
      </Canvas>
    </div>
  );
}
