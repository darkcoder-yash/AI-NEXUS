import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useNovaStore, NovaTask } from '@/store/useNovaStore';
import { NovaCore } from './NovaCore';
import { SpatialTaskGraph } from './SpatialTaskGraph';
import { NovaEnvironment } from './NovaEnvironment';
import { HolographicHUD } from './HolographicHUD';

// Demo Scenario Data
const demoTasks: NovaTask[] = [
  { id: '1', label: 'Parse Intent', status: 'pending', position: [-2, 1, 0], connections: ['2'] },
  { id: '2', label: 'Fetch Data', status: 'pending', position: [-1, 2, -1], connections: ['3', '4'] },
  { id: '3', label: 'Analyze Context', status: 'pending', position: [1, 2, -1], connections: ['5'] },
  { id: '4', label: 'Validate Sources', status: 'pending', position: [0, 3, -2], connections: ['5'] },
  { id: '5', label: 'Synthesize Output', status: 'pending', position: [2, 1, 0], connections: [] }
];

export default function NovaOS() {
  const { setSystemState, setTasks, updateTaskStatus, addLog } = useNovaStore();

  // Demo Sequence Loop
  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];

    const runDemo = () => {
      // 1. Idle
      setSystemState('idle');
      setTasks(demoTasks);
      addLog('System initialized. Waiting for input...', 'system');

      // 2. Thinking (Input received)
      timeoutIds.push(setTimeout(() => {
        setSystemState('thinking');
        addLog('Receiving cognitive input stream...', 'info');
      }, 3000));

      // 3. Planning (Graph appears)
      timeoutIds.push(setTimeout(() => {
        setSystemState('planning');
        addLog('Constructing execution DAG...', 'system');
        updateTaskStatus('1', 'active');
      }, 6000));

      // 4. Executing - Node 1
      timeoutIds.push(setTimeout(() => {
        setSystemState('executing');
        updateTaskStatus('1', 'completed');
        updateTaskStatus('2', 'active');
        addLog('Intent parsed successfully.', 'action');
        addLog('Initiating parallel data fetch...', 'info');
      }, 9000));

      // 5. Executing - Node 2 & 3
      timeoutIds.push(setTimeout(() => {
        updateTaskStatus('2', 'completed');
        updateTaskStatus('3', 'active');
        updateTaskStatus('4', 'active');
        addLog('Data streams acquired. Analyzing...', 'info');
      }, 12000));

      // 6. Executing - Node 4 & 5
      timeoutIds.push(setTimeout(() => {
        updateTaskStatus('3', 'completed');
        updateTaskStatus('4', 'completed');
        updateTaskStatus('5', 'active');
        addLog('Context synthesized. Generating final output...', 'action');
      }, 15000));

      // 7. Success
      timeoutIds.push(setTimeout(() => {
        updateTaskStatus('5', 'completed');
        setSystemState('success');
        addLog('Directive executed successfully.', 'system');
      }, 18000));

      // Reset
      timeoutIds.push(setTimeout(() => {
        runDemo();
      }, 24000));
    };

    runDemo();

    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full h-screen bg-[#010203] overflow-hidden relative selection:bg-[#00E6FF]/30">
      {/* 3D Environment */}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <NovaEnvironment />
        <NovaCore />
        <SpatialTaskGraph />
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* 2D Holographic Overlay */}
      <HolographicHUD />
    </div>
  );
}
