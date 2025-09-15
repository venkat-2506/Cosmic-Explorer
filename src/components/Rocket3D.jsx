import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

const RocketBodyMaterial = new THREE.MeshStandardMaterial({
  color: "#f5f5f5",
  metalness: 0.85,
  roughness: 0.15,
  emissive: "#ffffff",
  emissiveIntensity: 0.18,
  toneMapped: false,
});

const RocketDarkMaterial = new THREE.MeshStandardMaterial({
  color: "#cfcfcf",
  metalness: 0.8,
  roughness: 0.25,
});

const WindowMaterial = new THREE.MeshStandardMaterial({
  color: "#aaddff",
  metalness: 1.0,
  roughness: 0,
  emissive: "#aaddff",
  emissiveIntensity: 2.5,
  transparent: true,
  opacity: 0.85,
  toneMapped: false,
});

export default function Rocket3D({ position, rotation, isThrusting = false, thrustIntensity = 1 }) {
  const rocketRef = useRef();
  const flameRef = useRef();

  useFrame((state) => {
    if (isThrusting && flameRef.current) {
      const time = state.clock.elapsedTime;
      const flameScale = thrustIntensity * (1 + Math.sin(time * 30) * 0.15);
      flameRef.current.scale.set(flameScale, flameScale, flameScale);
      flameRef.current.position.y = -1.3 - flameScale * 0.5;
    }
  });

  return (
    <group ref={rocketRef} position={position} rotation={rotation} scale={[1.3, 1.3, 1.3]}>
      {/* Nose Cone */}
      <mesh position={[0, 1.4, 0]} material={RocketBodyMaterial}>
        <coneGeometry args={[0.3, 0.8, 32]} />
      </mesh>

      {/* Upper Stage */}
      <mesh position={[0, 0.4, 0]} material={RocketBodyMaterial}>
        <cylinderGeometry args={[0.3, 0.35, 1.2, 32]} />
      </mesh>
      
      {/* Stage Separator */}
      <mesh position={[0, -0.2, 0]} material={RocketDarkMaterial}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
      </mesh>

      {/* Lower Stage */}
      <mesh position={[0, -0.6, 0]} material={RocketBodyMaterial}>
        <cylinderGeometry args={[0.35, 0.4, 0.8, 32]} />
      </mesh>

      {/* Window */}
      <mesh position={[0, 0.5, 0.365]} material={WindowMaterial}>
        <circleGeometry args={[0.08, 16]} />
      </mesh>

      {/* Fins */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i * Math.PI) / 2;
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(0.4, -0.2);
        finShape.lineTo(0.4, -0.8);
        finShape.lineTo(0, -1.0);
        finShape.lineTo(0, 0);
        const finExtrudeSettings = { depth: 0.05, bevelEnabled: false };
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.38, -0.2, Math.sin(angle) * 0.38]}
            rotation={[0, angle, 0]}
            material={RocketDarkMaterial}
          >
            <extrudeGeometry args={[finShape, finExtrudeSettings]} />
          </mesh>
        );
      })}

      {/* Engine Bell */}
      <mesh position={[0, -1.15, 0]} material={RocketDarkMaterial}>
        <cylinderGeometry args={[0.2, 0.4, 0.3, 32]} />
      </mesh>

      {/* Thrust flame */}
      {isThrusting && (
        <group>
          <Trail width={1.5} length={8} color={'#66ccff'} attenuation={(t) => t * t}>
            <group ref={flameRef}>
              <mesh>
                <coneGeometry args={[0.2, 1, 16]} />
                <meshStandardMaterial
                  color="#66ccff"
                  emissive="#66ccff"
                  emissiveIntensity={6}
                  transparent
                  opacity={0.9}
                  toneMapped={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          </Trail>
          <pointLight color="#66ccff" intensity={thrustIntensity * 20} distance={28} />
        </group>
      )}
    </group>
  );
}
