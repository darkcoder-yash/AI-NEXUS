import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FluidShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#002244') },
    uColor2: { value: new THREE.Color('#220044') },
    uColor3: { value: new THREE.Color('#004444') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

    // Simplex noise or similar for organic flow
    float noise(vec2 p) {
      return sin(p.x * 10.0 + uTime * 0.5) * cos(p.y * 10.0 + uTime * 0.3);
    }

    void main() {
      vec2 p = vUv;
      float n1 = noise(p + vec2(uTime * 0.1, uTime * 0.05));
      float n2 = noise(p * 0.5 - vec2(uTime * 0.05, uTime * 0.1));
      
      vec3 color = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
      color = mix(color, uColor3, n2 * 0.5 + 0.5);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const BackgroundPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        {...FluidShader}
        transparent
      />
    </mesh>
  );
};

export const CognitiveField: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <BackgroundPlane />
      </Canvas>
      <div className="nova-noise-overlay" />
    </div>
  );
};
