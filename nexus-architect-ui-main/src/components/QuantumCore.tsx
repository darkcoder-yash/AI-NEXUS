import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSwarm = ({ count = 20000 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetV = useMemo(() => new THREE.Vector3(), []);
  const colorV = useMemo(() => new THREE.Color(), []);

  // Base positions for lerping if needed, but for the tesseract we can compute directly
  // However, cube.jsx used positions array for lerping. 
  // For the high-performance shader-like feel, we'll compute directly for now.
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Hyper-Tesseract Parameters
    const size = 3;
    const pulse = 0.8;
    const speed = 0.4;
    const jitter = 0.05;
    const t = time * speed;

    for (let i = 0; i < count; i++) {
      const u = i / count;

      // Distribution logic
      const phi = Math.acos(1 - 2 * (i % 1000) / 1000);
      const theta = (i % 1000) * 2.39996;
      const cell = Math.floor(i / 1000);

      let x4 = Math.sin(phi) * Math.cos(theta);
      let y4 = Math.sin(phi) * Math.sin(theta);
      let z4 = Math.cos(phi);
      let w4 = Math.sin(t + cell);

      const breath = 1.0 + Math.sin(t * 1.5 + u * Math.PI) * pulse;
      x4 *= breath;
      y4 *= breath;
      z4 *= breath;
      w4 *= breath;

      const c = Math.cos(t);
      const s = Math.sin(t);

      const x1 = x4 * c - y4 * s;
      const y1 = x4 * s + y4 * c;

      const z1 = z4 * c - w4 * s;
      const w1 = z4 * s + w4 * c;

      const x2 = x1 * Math.cos(t * 0.5) - w1 * Math.sin(t * 0.5);
      const w2 = x1 * Math.sin(t * 0.5) + w1 * Math.cos(t * 0.5);

      const p = 1.0 / (5.0 - w2);
      const posX = x2 * p * size;
      const posY = y1 * p * size;
      const posZ = z1 * p * size;

      const noiseAmt = (Math.sin(i + t * 5)) * jitter;

      targetV.set(posX + noiseAmt, posY + noiseAmt, posZ + noiseAmt);
      
      dummy.position.copy(targetV);
      dummy.scale.setScalar(p * 0.5); // Perspective scaling
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // AI Nexus Colors: Shades of cyan and blue
      const h = 0.5 + (w2 * 0.05); // Around 0.5 (cyan)
      const sat = 0.8 + (w2 * 0.1);
      const lum = 0.4 + Math.sin(t + phi) * 0.2;
      colorV.setHSL(h, sat, lum);
      meshRef.current.setColorAt(i, colorV);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.1), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ 
    transparent: true, 
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
  }), []);

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
};

function StarField() {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 30;
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
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <Points positions={positions} stride={3}>
      <PointMaterial 
        transparent 
        color="#00E6FF" 
        size={0.03} 
        sizeAttenuation={true} 
        depthWrite={false} 
        opacity={0.2} 
      />
    </Points>
  );
}

// Re-implementing Points/PointMaterial since we don't want to import too much if not needed
// But they are already used in previous version.
function Points({ positions, stride, children }: any) {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / stride}
          array={positions}
          itemSize={stride}
        />
      </bufferGeometry>
      {children}
    </points>
  );
}

function PointMaterial({ color, size, transparent, opacity, sizeAttenuation, depthWrite }: any) {
  return (
    <pointsMaterial
      color={color}
      size={size}
      transparent={transparent}
      opacity={opacity}
      sizeAttenuation={sizeAttenuation}
      depthWrite={depthWrite}
    />
  );
}

export function QuantumCore() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full relative">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={["#000000"]} />
          <fog attach="fog" args={["#000000", 5, 25]} />
          
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00E6FF" />
          
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <ParticleSwarm count={20000} />
          </Float>
          
          <StarField />
          
          {/* Subtle slow rotation for the whole scene */}
          <SceneController />
        </Canvas>
      </div>
    </div>
  );
}

function SceneController() {
    useFrame((state) => {
        state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 2;
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}
