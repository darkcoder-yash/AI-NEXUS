import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface GraphNode {
  id: number;
  label: string;
  type: string;
  connections: number;
}

export interface GraphLink {
  source: number;
  target: number;
}

interface SpatialGraph3DProps {
  nodes: GraphNode[];
}

export function SpatialGraph3D({ nodes }: SpatialGraph3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate pseudo-random positions for nodes in a sphere
  const nodePositions = useMemo(() => {
    return nodes.map(() => {
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      return new THREE.Vector3(x, y, z);
    });
  }, [nodes]);

  // Generate some random links
  const links = useMemo(() => {
    const l: GraphLink[] = [];
    nodes.forEach((node, i) => {
      // connecting each node to 1-2 other nodes
      const targetCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < targetCount; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          l.push({ source: i, target });
        }
      }
    });
    return l;
  }, [nodes]);

  // Rotate entire graph slowly
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.001;
    }
  });

  const getColor = (type: string) => {
    switch(type) {
      case 'Person': return '#60a5fa'; // blue-400
      case 'Project': return '#2dd4bf'; // teal-400
      default: return '#f472b6'; // pink-400
    }
  };

  return (
    <group ref={groupRef}>
      {/* Draw Links */}
      {links.map((link, i) => {
        const start = nodePositions[link.source];
        const end = nodePositions[link.target];
        if (!start || !end) return null;
        
        const path = new THREE.LineCurve3(start, end);
        const tubeGeometry = new THREE.TubeGeometry(path, 20, 0.02, 8, false);
        
        return (
          <mesh key={`link-${i}`} geometry={tubeGeometry}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
        );
      })}

      {/* Draw Nodes */}
      {nodes.map((node, i) => {
        const pos = nodePositions[i];
        if (!pos) return null;
        
        return (
          <group key={`node-${node.id}`} position={pos}>
            <Sphere args={[0.2 + (node.connections * 0.05), 16, 16]}>
              <meshStandardMaterial 
                color={getColor(node.type)} 
                emissive={getColor(node.type)}
                emissiveIntensity={0.5}
                transparent 
                opacity={0.8} 
              />
            </Sphere>
            <Html distanceFactor={15}>
              <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/20 whitespace- nowrap pointer-events-none backdrop-blur-md">
                <span className="font-bold">{node.label}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
