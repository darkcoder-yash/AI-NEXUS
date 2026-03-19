import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NexusState } from '../hooks/useNexusState';

const BlobShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffd1') },
    uDistortion: { value: 0.2 },
    uSpeed: { value: 1.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uDistortion;
    uniform float uSpeed;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simplex 3D noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vNormal = normal;
      float noise = snoise(position * 2.0 + uTime * uSpeed);
      vec3 newPosition = position + normal * noise * uDistortion;
      vPosition = newPosition;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float intensity = 1.1 - dot(vNormal, vec3(0.0, 0.0, 1.0));
      vec3 atmosphere = uColor * pow(intensity, 1.5);
      
      // Pulse based on position and time
      float pulse = sin(vPosition.x * 10.0 + uTime) * 0.1 + 0.9;
      
      gl_FragColor = vec4(atmosphere * pulse, 0.8);
    }
  `
};

interface ThoughtBlobProps {
  state: NexusState;
}

export const ThoughtBlob: React.FC<ThoughtBlobProps> = ({ state }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const config = useMemo(() => {
    switch (state) {
      case 'THINKING':
        return { distortion: 0.6, speed: 2.0, color: '#00a3ff' };
      case 'EXECUTING':
        return { distortion: 1.2, speed: 4.0, color: '#8a2be2' };
      case 'SUCCESS':
        return { distortion: 0.1, speed: 0.5, color: '#39ff14' };
      case 'ERROR':
        return { distortion: 2.5, speed: 12.0, color: '#ff3131' };
      default:
        return { distortion: 0.3, speed: 1.0, color: '#00ffd1' };
    }
  }, [state]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uDistortion.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uDistortion.value,
        config.distortion,
        0.05
      );
      materialRef.current.uniforms.uSpeed.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uSpeed.value,
        config.speed,
        0.05
      );
      materialRef.current.uniforms.uColor.value.lerp(new THREE.Color(config.color), 0.05);
    }
  });

  return (
    <mesh scale={[1, 1, 1]}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        ref={materialRef}
        {...BlobShader}
        transparent
        depthTest={true}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
