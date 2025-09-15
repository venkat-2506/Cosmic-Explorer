import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Globe, Zap, Clock, ArrowLeft, TrendingUp, Navigation, MapPin, Circle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Trail } from '@react-three/drei';
import { EffectComposer, Bloom, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import StarField from './StarField';
import Planet from './Planet';
import ErrorBoundary from './ErrorBoundary';
import * as THREE from 'three';
import { planetsData } from '../data/planets';

const useMockTelemetry = (isTracking) => {
  const [telemetryData, setTelemetryData] = useState(null);
  const simState = useRef({
    angle: -Math.PI / 1.5,
  });
  const AU_TO_KM = 149597870.7;

  const eccentricity = 1.5; // hyperbola e>1
  const semi_latus_rectum = 60; // p in AU

  useEffect(() => {
    let interval;
    if (isTracking) {
      const updateTelemetry = () => {
        const state = simState.current;
        const now = Date.now();

        state.angle += 0.005;
        const r = semi_latus_rectum / (1 + eccentricity * Math.cos(state.angle));
        
        const atlasPosAU = new THREE.Vector3(r * Math.cos(state.angle), (r * Math.sin(state.angle)) * 0.2, r * Math.sin(state.angle));
        const atlasPosKm = atlasPosAU.clone().multiplyScalar(AU_TO_KM);

        // Fluctuate velocity between 45 and 50 km/s
        const velocity = 45 + Math.random() * 5;

        // Fluctuate altitude, distance, and signal strength
        const altitudeKm = 114000 + (Math.random() - 0.5) * 8000;
        const distanceToEarthAU = 2.5 + Math.random() * 0.5;
        const signalStrength = 85 + Math.random() * 15;

        setTelemetryData({
          name: '3I/ATLAS',
          timestamp: new Date().toISOString(),
          position: { x: atlasPosKm.x, y: atlasPosKm.y, z: atlasPosKm.z },
          positionAU: { x: atlasPosAU.x, y: atlasPosAU.y, z: atlasPosAU.z },
          velocity,
          distance: distanceToEarthAU,
          altitude: altitudeKm,
          status: 'TRACKING',
          signal_strength: signalStrength,
        });
      };

      updateTelemetry();
      interval = setInterval(updateTelemetry, 2000);
    } else {
      simState.current.angle = -Math.PI / 1.5;
      setTelemetryData(null);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  return telemetryData;
};

function SolarSystemVisualization({ satellitePositionAU, isTracking }) {
  const marsR = planetsData.find(p => p.name === 'Mars').orbitRadius;
  const jupiterR = planetsData.find(p => p.name === 'Jupiter').orbitRadius;
  let satellitePosUnits = null;
  if (satellitePositionAU) {
    const angle = Math.atan2(satellitePositionAU.z, satellitePositionAU.x);
    const rAU = Math.sqrt(satellitePositionAU.x * satellitePositionAU.x + satellitePositionAU.z * satellitePositionAU.z);
    const t = Math.min(Math.max((rAU - 2.5) / 0.5, 0), 1);
    const beltMin = marsR + 1;
    const beltMax = jupiterR - 1;
    const rUnits = beltMin + t * (beltMax - beltMin);
    const x = rUnits * Math.cos(angle);
    const z = rUnits * Math.sin(angle);
    const y = z * 0.1;
    satellitePosUnits = [x, y, z];
  }
  return (
    <Canvas camera={{ position: [0, 60, 100], fov: 60 }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.15} />
      <hemisphereLight skyColor={'#88aaff'} groundColor={'#080808'} intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={4} distance={300} decay={2} color="#ffdd88" />
      <OrbitControls enablePan enableZoom enableRotate minDistance={30} maxDistance={200} autoRotate={!isTracking} autoRotateSpeed={0.1} />
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <StarField count={5000} isAnimated={!isTracking} />
          <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
          </Sphere>
          {planetsData.map(planet => (
            <group key={planet.name}>
              <Planet {...planet} />
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[planet.orbitRadius - 0.05, planet.orbitRadius + 0.05, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
          {isTracking && satellitePosUnits && (
            <group position={satellitePosUnits}>
              <Trail width={1.5} length={8} color={'#ff0080'} attenuation={(t) => t * t}>
                <Sphere args={[0.5, 16, 16]}>
                  <meshStandardMaterial color="#ff0080" emissive="#ff0080" emissiveIntensity={4} toneMapped={false} />
                </Sphere>
              </Trail>
              <pointLight color="#ff0080" intensity={10} distance={30} />
              <Html distanceFactor={20}>
                <div className="bg-black/80 backdrop-blur-sm border border-pink-400 rounded-lg p-2 text-pink-400 font-orbitron text-xs whitespace-nowrap">3i/ATLAS</div>
              </Html>
            </group>
          )}
        </Suspense>
      </ErrorBoundary>
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={0.8} />
        <HueSaturation hue={0} saturation={0.25} />
        <BrightnessContrast brightness={0.02} contrast={0.12} />
      </EffectComposer>
    </Canvas>
  );
}

export default function TrackingPanel({ onBack }) {
  const [isTracking, setIsTracking] = useState(false);
  const telemetryData = useMockTelemetry(isTracking);

  const startTracking = () => setIsTracking(true);
  const stopTracking = () => setIsTracking(false);

  const formatAltitude = (alt) => {
    if (!alt) return 'N/A';
    if (alt < 1000) return `${alt.toFixed(0)} km`;
    return `${(alt / 1000).toFixed(0)}K km`;
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen w-full bg-black/90 flex flex-col">
      <button onClick={onBack} className="fixed top-8 left-8 z-50 p-3 bg-gray-800/80 backdrop-blur-sm hover:bg-purple-600/60 rounded-full transition-colors duration-300">
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="mx-auto max-w-7xl w-full px-6 py-8 space-y-6 overflow-y-auto no-scrollbar">
        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-b from-zinc-900/70 to-black/70 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-lg"><Satellite className="w-7 h-7 text-purple-400" /></div>
              <div>
                <h2 className="font-orbitron text-2xl font-bold text-white">Mission Control</h2>
                <p className="font-exo text-gray-400">Tracking Interface</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg">
                <Circle className="w-3 h-3 fill-current" />
                <span className="font-exo text-sm">Status: {isTracking ? 'ACTIVE TRACKING' : 'INACTIVE'}</span>
                {isTracking && (
                  <span className="font-mono text-xs text-gray-400 ml-2">Last update: {formatTimestamp(telemetryData?.timestamp)}</span>
                )}
              </div>

              {!isTracking ? (
                <motion.button onClick={startTracking} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-orbitron font-bold">START TRACKING</motion.button>
              ) : (
                <motion.button onClick={stopTracking} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-5 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-orbitron font-bold">STOP TRACKING</motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D View Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-b from-zinc-900/70 to-black/70 border border-white/10 rounded-2xl">
          <div className="px-6 pt-4">
            <h3 className="font-orbitron text-lg font-bold text-white/90">3D Solar System View</h3>
          </div>
          <div className="h-[420px] rounded-b-2xl overflow-hidden">
            <SolarSystemVisualization satellitePositionAU={telemetryData?.positionAU} isTracking={isTracking} />
          </div>
        </motion.div>

        {/* Metrics Row */}
        {isTracking && telemetryData ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <TelemetryCard icon={TrendingUp} color="blue" label="VELOCITY" value={telemetryData.velocity.toFixed(1)} unit="km/s" />
            <TelemetryCard icon={Globe} color="pink" label="DISTANCE" value={telemetryData.distance.toFixed(2)} unit="AU from Earth" />
            <TelemetryCard icon={MapPin} color="green" label="ALTITUDE" value={formatAltitude(telemetryData.altitude)} unit="km above Earth" />
            <TelemetryCard icon={Zap} color="orange" label="SIGNAL" value={`${telemetryData.signal_strength.toFixed(0)}%`} unit="strength" />
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="font-orbitron text-lg text-gray-500">Awaiting tracking initiation...</p>
          </div>
        )}

        {/* Details Row */}
        {isTracking && telemetryData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 flex items-center"><Navigation className="w-5 h-5 mr-2" />Position Vector (km)</h3>
              <div className="font-mono text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">X:</span><span className="text-cyan-400">{telemetryData.position.x.toExponential(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Y:</span><span className="text-cyan-400">{telemetryData.position.y.toExponential(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Z:</span><span className="text-cyan-400">{telemetryData.position.z.toExponential(2)}</span></div>
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
              <h3 className="font-orbitron text-lg font-bold text-purple-400 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2" />Mission Data</h3>
              <div className="font-mono text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">Object ID:</span><span className="text-purple-400">{telemetryData.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className="text-green-400">{telemetryData.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Timestamp (IST):</span><span className="text-blue-400">{formatTimestamp(telemetryData.timestamp)}</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const TelemetryCard = ({ icon: Icon, color, label, value, unit }) => {
  const colors = {
    blue: { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'from-blue-900/40 to-cyan-900/40' },
    pink: { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'from-pink-900/40 to-purple-900/40' },
    green: { border: 'border-green-500/50', text: 'text-green-400', bg: 'from-green-900/40 to-teal-900/40' },
    orange: { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'from-orange-900/40 to-red-900/40' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-gradient-to-br ${c.bg} backdrop-blur-sm border ${c.border} rounded-2xl p-5 flex flex-col justify-between min-h-[120px]`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-6 h-6 ${c.text}`} />
        <span className={`font-orbitron text-sm uppercase ${c.text}`}>{label}</span>
      </div>
      <div>
        <p className="font-orbitron text-3xl font-bold text-white mt-2">{value}</p>
        <p className={`font-exo text-sm ${c.text}`}>{unit}</p>
      </div>
    </div>
  );
};
