import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

function Comet({ 
  startPosition = [0, 0, 0], 
  endPosition = [100, 50, 100], 
  speed = 0.02,
  size = 0.3,
  color = '#87ceeb'
}) {
  const cometRef = useRef();
  const pathRef = useRef(0);

  useFrame(() => {
    if (cometRef.current) {
      pathRef.current += speed;
      
      // Reset comet when it reaches the end
      if (pathRef.current > 1) {
        pathRef.current = 0;
      }
      
      // Interpolate position along the path
      const t = pathRef.current;
      const x = THREE.MathUtils.lerp(startPosition[0], endPosition[0], t);
      const y = THREE.MathUtils.lerp(startPosition[1], endPosition[1], t) + Math.sin(t * Math.PI * 2) * 5;
      const z = THREE.MathUtils.lerp(startPosition[2], endPosition[2], t);
      
      cometRef.current.position.set(x, y, z);
      
      // Add rotation for visual effect
      cometRef.current.rotation.y += 0.1;
    }
  });

  return (
    <group ref={cometRef}>
      <Trail
        width={2}
        length={8}
        color={color}
        attenuation={(t) => t * t}
      >
        <Sphere args={[size, 8, 8]}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.8}
          />
        </Sphere>
      </Trail>
      
      {/* Comet glow */}
      <Sphere args={[size * 1.5, 8, 8]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </Sphere>
    </group>
  );
}

export default Comet;
