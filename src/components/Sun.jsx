import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

export default function Sun() {
  const sunRef = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group>
      {/* Single realistic Sun sphere */}
      <Sphere ref={sunRef} args={[3, 32, 32]}>
        <meshBasicMaterial 
          color="#ffaa00"
        />
      </Sphere>
      
      {/* Point light for illumination */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={3} 
        distance={150} 
        decay={2} 
        color="#ffaa00" 
      />
    </group>
  );
}
