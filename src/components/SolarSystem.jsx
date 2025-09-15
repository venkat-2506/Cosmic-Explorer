import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import StarField from './StarField';
import ErrorBoundary from './ErrorBoundary';
import Sun from './Sun';
import Planet from './Planet';
import { planetsData } from '../data/planets';

function FallbackComponent() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#333333" />
    </mesh>
  );
}

export default function SolarSystem() {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#000000']} />
        
        <PerspectiveCamera makeDefault position={[0, 25, 50]} fov={60} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={25}
          maxDistance={120}
          autoRotate={true}
          autoRotateSpeed={0.3}
        />
        
        <ambientLight intensity={0.15} />
        <hemisphereLight skyColor={'#88aaff'} groundColor={'#080808'} intensity={0.2} />
        
        <ErrorBoundary fallback={<FallbackComponent />}>
          <Suspense fallback={<FallbackComponent />}>
            <StarField count={8000} />
            <Sun />

            {planetsData.map((planet) => (
              <Planet
                key={planet.name}
                {...planet}
              />
            ))}
          </Suspense>
        </ErrorBoundary>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
            intensity={0.8}
          />
          <HueSaturation hue={0} saturation={0.25} />
          <BrightnessContrast brightness={0.02} contrast={0.12} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
