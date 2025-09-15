import React, { useRef, useState, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// A component that renders the planet material, handling texture loading with Suspense
function PlanetMaterial({ url, color }) {
  const texture = useTexture(url);
  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.6}
      metalness={0.0}
      transparent={false}
      opacity={1}
      emissive={new THREE.Color(color).multiplyScalar(0.5)}
      emissiveMap={texture}
      emissiveIntensity={0.7}
      toneMapped={false}
    />
  );
}

// A component that renders the ring material with a proper alpha map
function RingTextureLoader({ url }) {
    const ringTexture = useTexture(url);
    return (
        <meshBasicMaterial 
          alphaMap={ringTexture}
          color="#d4af37"
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
    );
}

export default function Planet({ 
  position, 
  size, 
  color, 
  name, 
  fact, 
  orbitRadius, 
  orbitSpeed,
  textureURL = null,
  moons = [],
  hasRings = false,
  ringTextureURL = null
}) {
  const planetRef = useRef();
  const orbitRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * orbitSpeed;
    }
    
    if (planetRef.current) {
      planetRef.current.rotation.y = time * 0.2; // Slower axial rotation
    }
  });

  const handlePointerEnter = () => {
    setShowTooltip(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setShowTooltip(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={orbitRef}>
      <group position={[orbitRadius, 0, 0]}>
        <group
          ref={planetRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <Sphere args={[size, 32, 32]}>
            {textureURL ? (
              <ErrorBoundary fallback={<meshStandardMaterial color={color || '#8c7853'} transparent={false} opacity={1} emissive={color} emissiveIntensity={0.7} toneMapped={false} />}>
                <Suspense fallback={<meshStandardMaterial color={color || '#8c7853'} transparent={false} opacity={1} emissive={color} emissiveIntensity={0.7} toneMapped={false} />}>
                  <PlanetMaterial url={textureURL} color={color} />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.0}
                transparent={false}
                opacity={1}
                emissive={color}
                emissiveIntensity={0.7}
                toneMapped={false}
              />
            )}
          </Sphere>

          <Sphere args={[size * 1.08, 32, 32]}>
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </Sphere>

          {hasRings && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
              {ringTextureURL ? (
                <ErrorBoundary fallback={<meshBasicMaterial color="#d4af37" transparent opacity={0.4} />}>
                  <Suspense fallback={<meshBasicMaterial color="#d4af37" transparent opacity={0.4} />}>
                      <RingTextureLoader url={ringTextureURL} />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <meshBasicMaterial 
                  color="#d4af37" 
                  transparent 
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>
          )}
          
          {showTooltip && (
            <Html
              position={[0, size + 2, 0]}
              center
              distanceFactor={10}
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #00ffff',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontFamily: 'Orbitron, monospace',
                fontSize: '14px',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                pointerEvents: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: '#00ffff', fontSize: '16px', fontWeight: 'bold' }}>
                  {name}
                </h4>
              </div>
            </Html>
          )}
        </group>
        
        {moons.map((moon) => (
          <Moon 
            key={moon.name}
            planetRadius={size}
            orbitRadius={moon.orbitRadius}
            orbitSpeed={moon.orbitSpeed}
            size={moon.size}
            color={moon.color}
          />
        ))}
      </group>
    </group>
  );
}

function Moon({ planetRadius, orbitRadius, orbitSpeed, size, color }) {
  const moonRef = useRef();
  const moonOrbitRef = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y = time * orbitSpeed;
    }
    
    if (moonRef.current) {
      moonRef.current.rotation.y = time * 3;
    }
  });

  return (
    <group ref={moonOrbitRef}>
      <group position={[planetRadius + orbitRadius, 0, 0]}>
        <Sphere ref={moonRef} args={[size, 16, 16]}>
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.0}
            transparent={false}
            opacity={1}
          />
        </Sphere>
      </group>
    </group>
  );
}
