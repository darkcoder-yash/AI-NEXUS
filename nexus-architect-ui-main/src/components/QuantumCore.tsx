import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

function NeuralMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const nodesCount = 40;
  
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < nodesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.8 + Math.random() * 0.4;
      temp.push(new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ));
    }
    return temp;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.2) {
          lines.push([nodes[i], nodes[j]]);
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame(({ clock, mouse }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      
      // Interactive magnetic response
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, mouse.x * 0.8, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, mouse.y * 0.8, 0.05);
    }
  });

  return (
    <group ref={meshRef}>
      {connections.map((points, i) => (
        <Line 
          key={i} 
          points={points} 
          color="#00E6FF" 
          lineWidth={0.5} 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
        />
      ))}
      <Points positions={new Float32Array(nodes.flatMap(v => [v.x, v.y, v.z]))} stride={3}>
        <PointMaterial 
          transparent 
          color="#00E6FF" 
          size={0.08} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </Points>
    </group>
  );
}

function OrbitRings() {
  const ringsRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        const speed = (i + 1) * 0.2;
        child.rotation.z = clock.getElapsedTime() * speed;
        child.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {[2.5, 3.2, 4.0].map((radius, i) => (
        <mesh key={radius} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <torusGeometry args={[radius, 0.01, 16, 100]} />
          <meshStandardMaterial 
            color="#00E6FF" 
            emissive="#00E6FF" 
            emissiveIntensity={1} 
            transparent 
            opacity={0.2 - i * 0.05} 
          />
        </mesh>
      ))}
    </group>
  );
}

function StarField() {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial 
        transparent 
        color="#E9FFFF" 
        size={0.02} 
        sizeAttenuation={true} 
        depthWrite={false} 
        opacity={0.4} 
      />
    </Points>
  );
}

export function QuantumCore() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      {/* Reduced size container for 30% reduction feel */}
      <div className="w-[80%] h-[80%] relative">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#00E6FF" distance={15} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <NeuralMesh />
            <OrbitRings />
          </Float>
          <StarField />
        </Canvas>
      </div>
    </div>
  );
}
