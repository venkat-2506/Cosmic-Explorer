import React, { useMemo, useRef } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function StarField({ count = 8000, isAnimated = true, twinkle = true }) {
  const pointsRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (isAnimated && pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002;
      pointsRef.current.rotation.x += 0.00008;
    }
    if (twinkle && materialRef.current) {
      const t = state.clock.getElapsedTime();
      const flicker = 0.3 + 0.15 * Math.sin(t * 1.2) * Math.cos(t * 0.9);
      materialRef.current.opacity = flicker;
      materialRef.current.size = 0.8 + 0.1 * Math.sin(t * 0.6);
    }
  });

  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create stars in a larger sphere around the scene
      const radius = Math.random() * 800 + 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);

  return (
    <Points ref={pointsRef} positions={points}>
      <PointMaterial
        ref={materialRef}
        transparent
        color="#cfd8ff"
        size={0.8}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
      />
    </Points>
  );
}
