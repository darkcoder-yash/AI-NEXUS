import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useNovaStore } from '@/store/useNovaStore';

export function NovaEnvironment() {
  const systemState = useNovaStore(s => s.systemState);

  // Determine bloom color/intensity based on state
  let bloomIntensity = 1.5;
  let luminanceThreshold = 0.2;

  if (systemState === 'executing') {
    bloomIntensity = 2.5;
    luminanceThreshold = 0.1;
  } else if (systemState === 'success') {
    bloomIntensity = 3.0;
  } else if (systemState === 'error') {
    bloomIntensity = 2.0;
  }

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00E6FF" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8A2BE2" />
      
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={luminanceThreshold} 
          mipmapBlur 
          intensity={bloomIntensity} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
}
