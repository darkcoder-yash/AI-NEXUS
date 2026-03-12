import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles, OrbitControls, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Energy Rings Component
const EnergyRings = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x = elapsedTime * 0.2;
      groupRef.current.rotation.y = elapsedTime * 0.3;
      groupRef.current.rotation.z = elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00E6FF" transparent opacity={0.6} />
      </mesh>
      
      {/* Mid Ring */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#2AF6FF" transparent opacity={0.8} />
      </mesh>

      {/* Inner Ring */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
        <torusGeometry args={[2.2, 0.04, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Pulsating Nucleus Component
const Nucleus = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#00E6FF"
          attach="material"
          distort={0.4} // Amount of distortion
          speed={3}     // Speed of distortion
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
          emissive="#00E6FF"
          emissiveIntensity={2}
        />
      </Sphere>
    </Float>
  );
};

// Main Scene Component
const CoreScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00E6FF" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#2AF6FF" />

      <Nucleus />
      <EnergyRings />
      
      {/* Particle Streams */}
      <Sparkles count={400} scale={10} size={2} speed={0.4} opacity={0.6} color="#00E6FF" />
      <Sparkles count={200} scale={8} size={3} speed={0.8} opacity={0.8} color="#ffffff" />
      
      {/* Distant Energy Grid */}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={2.5} 
          mipmapBlur 
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Noise opacity={0.03} />
      </EffectComposer>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
};

export default function QuantumCore() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <CoreScene />
      </Canvas>
    </div>
  );
}
