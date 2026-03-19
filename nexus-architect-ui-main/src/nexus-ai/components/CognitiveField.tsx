import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AdvancedFluidShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#050505') },
    uColor2: { value: new THREE.Color('#001122') },
    uColor3: { value: new THREE.Color('#110022') },
    uAccent: { value: new THREE.Color('#00ffd1') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uAccent;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0.x  * vec3(x0.x,x12.xz) + a0.y * vec3(x0.y,x12.yw) + h * vec3(x.x,x.y,x.z);
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 res = vec3(0.0);
      res.x = dot(m, g);
      return 130.0 * res.x;
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.1;
      
      // Layered noise for fluid effect
      float n1 = snoise(uv * 2.0 + t);
      float n2 = snoise(uv * 4.0 - t * 0.5);
      float n3 = snoise(uv * 1.0 + vec2(n1, n2) * 0.5);
      
      vec3 finalColor = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
      finalColor = mix(finalColor, uColor3, n2 * 0.5 + 0.5);
      
      // Add a subtle accent glow based on noise
      float glow = pow(max(0.0, n3), 3.0);
      finalColor += uAccent * glow * 0.15;
      
      // Vignette effect
      float dist = distance(uv, vec2(0.5));
      finalColor *= smoothstep(0.8, 0.2, dist);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const BackgroundPlane = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        {...AdvancedFluidShader}
        transparent
      />
    </mesh>
  );
};

export const CognitiveField: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <BackgroundPlane />
      </Canvas>
      <div className="nexus-noise-overlay" />
    </div>
  );
};
