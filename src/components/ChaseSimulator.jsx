import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Zap, Clock, Fuel, Trophy, AlertTriangle, Play, RotateCcw, Settings, Book, TrendingUp, ArrowLeft, X } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Trail, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import StarField from './StarField';
import Planet from './Planet';
import Rocket3D from './Rocket3D';
import { planetsData } from '../data/planets';
import * as THREE from 'three';
import Confetti from 'react-confetti';
import { db } from '../db';

const bestInterceptWindows = [
  {
    label: "Dec 4–6, 2025",
    value: "2025-12-04",
    travelTime: 125,
    deltaV: 18.5,
  },
  {
    label: "Dec 11–13, 2025",
    value: "2025-12-11",
    travelTime: 118,
    deltaV: 17.2,
  },
  {
    label: "Dec 19, 2025",
    value: "2025-12-19",
    travelTime: 110,
    deltaV: 16.1,
  },
];

const propulsionData = {
  chemical: { fuelMult: 3.2, timeMod: 1.1, deltaVMod: 1.05 },
  ion: { fuelMult: 1.5, timeMod: 0.9, deltaVMod: 0.85 },
  nuclear: { fuelMult: 2.1, timeMod: 0.8, deltaVMod: 0.8 },
  solar: { fuelMult: 0.8, timeMod: 1.4, deltaVMod: 0.9 }
};

const mockBackendAPI = {
  async calculateOptimalIntercept(params) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const { propulsion, payloadMass, window } = params;

    const data = propulsionData[propulsion];
    const massModifier = 1 + ((payloadMass - 500) / 4500) * 0.2; // Max 20% increase for heaviest payload

    const finalTravelTime = Math.round(window.travelTime * data.timeMod * massModifier);
    const finalDeltaV = window.deltaV * data.deltaVMod * massModifier;
    const fuelRequired = payloadMass * data.fuelMult * (finalDeltaV / 10);

    return {
      success: true,
      interceptSuccess: true,
      launchDate: new Date(window.value).toISOString(),
      arrivalDate: new Date(new Date(window.value).getTime() + finalTravelTime * 24 * 60 * 60 * 1000).toISOString(),
      travelTime: finalTravelTime,
      deltaV: finalDeltaV.toFixed(2),
      fuelRequired: Math.round(fuelRequired),
      explanation: `Optimal trajectory confirmed! Your spacecraft will intercept 3I/ATLAS in ${finalTravelTime} days.`,
      educationalNote: `Using ${propulsion} propulsion, this optimal window provides a balanced mission profile. The payload mass of ${payloadMass}kg influences the final parameters.`
    };
  },
  async calculateAnytimeChase(params) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const { propulsion, payloadMass, launchDate } = params;
    const d = new Date(launchDate);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1; // 1-12

    const inSuccessWindow = (d >= new Date('2025-09-01T00:00:00Z') && d <= new Date('2026-01-31T23:59:59Z'));
    const inFailWindow262 = (y === 2026 && m >= 2 && m <= 9);

    const fuelMult = { chemical: 3.2, ion: 1.5, nuclear: 2.1, solar: 0.8 }[propulsion] ?? 2.0;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const randRange = (min, max) => min + Math.random() * (max - min);

    // Mass factor gently influences results
    const massFactor = 1 + ((payloadMass - 1500) / 3500) * 0.06;

    if (inSuccessWindow) {
      const ranges = {
        chemical: { dv: [12, 16], time: [160, 260] },
        ion: { dv: [8, 12], time: [200, 320] },
        nuclear: { dv: [10, 14], time: [150, 240] },
        solar: { dv: [6, 10], time: [260, 380] },
      };
      const r = ranges[propulsion] || ranges.ion;
      let dv = randRange(r.dv[0], r.dv[1]) * massFactor;
      dv = clamp(dv, r.dv[0], r.dv[1] + 0.8);
      let travelTime = randRange(r.time[0], r.time[1]) * (0.98 + (massFactor - 1) * 0.8);
      travelTime = clamp(travelTime, r.time[0], r.time[1] + 20);

      const fuelRequired = payloadMass * fuelMult * (dv / 9) * (travelTime / 280);

      return {
        success: true,
        interceptSuccess: true,
        launchDate: d.toISOString(),
        arrivalDate: new Date(d.getTime() + Math.round(travelTime) * 24 * 60 * 60 * 1000).toISOString(),
        travelTime: Math.round(travelTime),
        deltaV: dv.toFixed(2),
        fuelRequired: Math.max(800, Math.round(fuelRequired)),
        explanation: `Mission successful. Launch window from Sep 2025 to Jan 2026 provides a feasible intercept with realistic ΔV and transit time.`,
        educationalNote: `Propulsion: ${propulsion}. Heavier payloads slightly increase ΔV and time; efficient systems like ion reduce fuel for the same payload.`,
      };
    }

    // Explicit failure for Feb–Sep 2026
    if (inFailWindow262) {
      const dv = randRange(22, 34);
      const travelTime = randRange(480, 720);
      const fuelRequired = Math.max(5200, payloadMass * fuelMult * (dv / 8) * (travelTime / 260));

      return {
        success: true,
        interceptSuccess: false,
        launchDate: d.toISOString(),
        arrivalDate: new Date(d.getTime() + Math.round(travelTime) * 24 * 60 * 60 * 1000).toISOString(),
        travelTime: Math.round(travelTime),
        deltaV: dv.toFixed(2),
        fuelRequired: Math.round(fuelRequired),
        explanation: `Mission failed. Launches from Feb to Sep 2026 face unfavorable geometry; required ΔV, time, and fuel exceed feasible limits.`,
        educationalNote: 'Chasing fast hyperbolic objects after optimal windows demands prohibitive ΔV and propellant.',
      };
    }

    // All remaining months => fail with time > 450 days and fuel > 5000 kg
    {
      const dv = randRange(20, 30);
      const travelTime = randRange(460, 680);
      const fuelRequired = Math.max(5200, payloadMass * fuelMult * (dv / 8.5) * (travelTime / 270));

      return {
        success: true,
        interceptSuccess: false,
        launchDate: d.toISOString(),
        arrivalDate: new Date(d.getTime() + Math.round(travelTime) * 24 * 60 * 60 * 1000).toISOString(),
        travelTime: Math.round(travelTime),
        deltaV: dv.toFixed(2),
        fuelRequired: Math.round(fuelRequired),
        explanation: 'Mission failed. Outside the September 2025–January 2026 window, trajectories demand excessive time and fuel.',
        educationalNote: 'Optimal alignment windows minimize ΔV; missing them pushes mission durations well beyond a year and fuel above 5 tons.',
      };
    }
  }
};

function MissionScene({ isSimulating }) {
  const rocketRef = useRef();
  const targetRef = useRef();
  const trajectoryLineRef = useRef();
  const startTimeRef = useRef(0);
  const trajectoryCurve = useRef(null);
  const [interceptPoint, setInterceptPoint] = useState(null);

  useEffect(() => {
    if (!isSimulating) {
      startTimeRef.current = 0;
      trajectoryCurve.current = null;
      setInterceptPoint(null);
    }
  }, [isSimulating]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (targetRef.current) {
      const eccentricity = 1.5;
      const semiLatusRectum = 60;
      const angle = time * 0.15;
      const rAU = semiLatusRectum / (1 + eccentricity * Math.cos(angle));
      const marsR = planetsData.find(p => p.name === 'Mars').orbitRadius;
      const jupiterR = planetsData.find(p => p.name === 'Jupiter').orbitRadius;
      const t = Math.max(0, Math.min(1.2, (rAU - 2.5) / 0.5));
      const rUnits = marsR + 1 + t * (jupiterR - marsR - 2);
      const x = rUnits * Math.cos(angle);
      const z = rUnits * Math.sin(angle);
      const y = z * 0.1;
      targetRef.current.position.set(x, y, z);
    }

    if (isSimulating && rocketRef.current && targetRef.current) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = time;
        const startPos = new THREE.Vector3(16, 0, 0);
        const futureTime = time + 10;
        const eccentricity = 1.5;
        const semiLatusRectum = 60;
        const futureAngle = futureTime * 0.15;
        const rAU = semiLatusRectum / (1 + eccentricity * Math.cos(futureAngle));
        const marsR = planetsData.find(p => p.name === 'Mars').orbitRadius;
        const jupiterR = planetsData.find(p => p.name === 'Jupiter').orbitRadius;
        const t = Math.max(0, Math.min(1.2, (rAU - 2.5) / 0.5));
        const rUnits = marsR + 1 + t * (jupiterR - marsR - 2);
        const x = rUnits * Math.cos(futureAngle);
        const z = rUnits * Math.sin(futureAngle);
        const y = z * 0.1;
        const endPos = new THREE.Vector3(x, y, z);

        trajectoryCurve.current = new THREE.LineCurve3(startPos, endPos);
        
        if (trajectoryLineRef.current) {
          const points = trajectoryCurve.current.getPoints(50);
          trajectoryLineRef.current.geometry.setFromPoints(points);
        }
      }

      const elapsedTime = time - startTimeRef.current;
      const progress = Math.min(elapsedTime / 10, 1);

      if (trajectoryCurve.current) {
        const currentPos = trajectoryCurve.current.getPointAt(progress);
        rocketRef.current.position.copy(currentPos);

        const toTarget = targetRef.current.position.clone().sub(currentPos).normalize();
        if (toTarget.lengthSq() > 0.0001) {
          rocketRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toTarget);
        }
        
        if (progress >= 1 && !interceptPoint) {
          setInterceptPoint(currentPos.clone());
        }
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#000008']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={4} distance={300} decay={2} color="#ffdd88" />
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={30} maxDistance={150} autoRotate={!isSimulating} autoRotateSpeed={0.2} />
      
      <StarField count={6000} isAnimated={true} />
      
      <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
      </Sphere>
      
      {planetsData.map(planet => (
        <group key={planet.name}>
          <Planet {...planet} />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.orbitRadius - 0.1, planet.orbitRadius + 0.1, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      
      <group ref={targetRef}>
        <Trail width={2} length={15} color={'#ff0080'} attenuation={(t) => t * t}>
          <Sphere args={[0.8, 16, 16]}>
            <meshStandardMaterial color="#ff0080" emissive="#ff0080" emissiveIntensity={3} toneMapped={false} />
          </Sphere>
        </Trail>
        <pointLight color="#ff0080" intensity={15} distance={50} />
        <Html distanceFactor={15}>
          <div className="bg-black/80 backdrop-blur-sm border border-pink-400 rounded-lg p-2 text-pink-400 font-orbitron text-xs whitespace-nowrap">
            3I/ATLAS TARGET
          </div>
        </Html>
      </group>
      
      {isSimulating && (
        <group ref={rocketRef}>
          <Rocket3D
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            isThrusting={true}
            thrustIntensity={2.2}
          />
          <pointLight color="#aaddff" intensity={90} distance={30} decay={2} />
        </group>
      )}
      
      {isSimulating && <Line ref={trajectoryLineRef} points={[[0,0,0], [0,0,0]]} color="#00ff88" lineWidth={2} dashed={true} dashSize={0.5} gapSize={0.2} />}
      
      {interceptPoint && (
        <group position={interceptPoint}>
          <Sphere args={[1.2, 32, 32]}>
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={5} toneMapped={false} transparent opacity={0.5} />
          </Sphere>
          <pointLight color="#00ff88" intensity={20} distance={20} />
          <Html distanceFactor={15}>
            <div className="bg-black/80 backdrop-blur-sm border border-green-400 rounded-lg p-2 text-green-400 font-orbitron text-xs whitespace-nowrap">
              INTERCEPT POINT
            </div>
          </Html>
        </group>
      )}
      
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={1.2} />
      </EffectComposer>
    </>
  );
}

function MissionVisualization({ isSimulating }) {
  return (
    <Canvas camera={{ position: [0, 30, 80], fov: 60 }}>
      <MissionScene isSimulating={isSimulating} />
    </Canvas>
  );
}

function MissionResults({ result, onRetry, onNewMission, showConfetti }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className={`max-w-2xl mx-4 p-8 rounded-2xl border-2 ${
          result.interceptSuccess 
            ? 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 border-green-400' 
            : 'bg-gradient-to-br from-red-900/90 to-orange-900/90 border-red-400'
        } backdrop-blur-lg`}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              result.interceptSuccess ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {result.interceptSuccess ? (
              <Trophy className="w-10 h-10 text-green-400" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-400" />
            )}
          </motion.div>
          
          <h2 className={`font-orbitron text-3xl font-bold mb-4 ${
            result.interceptSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {result.interceptSuccess ? 'MISSION SUCCESS!' : 'MISSION FAILED'}
          </h2>
          
          <p className="font-exo text-lg text-gray-300 mb-6">
            {result.explanation}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              <span className="font-orbitron text-sm text-blue-400">DELTA-V</span>
            </div>
            <p className="font-orbitron text-xl font-bold text-white">{result.deltaV} km/s</p>
          </div>
          
          <div className="bg-black/40 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-purple-400 mr-2" />
              <span className="font-orbitron text-sm text-purple-400">TRAVEL TIME</span>
            </div>
            <p className="font-orbitron text-xl font-bold text-white">{result.travelTime} days</p>
          </div>
          
          <div className="bg-black/40 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Fuel className="w-5 h-5 text-orange-400 mr-2" />
              <span className="font-orbitron text-sm text-orange-400">FUEL REQUIRED</span>
            </div>
            <p className="font-orbitron text-xl font-bold text-white">{result.fuelRequired} kg</p>
          </div>
          
          <div className="bg-black/40 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="font-orbitron text-sm text-cyan-400">STATUS</span>
            </div>
            <p className={`font-orbitron text-xl font-bold ${
              result.interceptSuccess ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.interceptSuccess ? 'INTERCEPT' : 'FAILED'}
            </p>
          </div>
        </div>

        {(result.educationalNote || result.suggestion) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-900/40 border border-blue-400/50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start">
              <Book className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-orbitron text-blue-400 font-bold mb-2">Educational Note</h4>
                <p className="font-exo text-gray-300 text-sm leading-relaxed">
                  {result.educationalNote || result.suggestion}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-gray-700/80 hover:bg-gray-600/80 border border-gray-500 rounded-lg text-white font-orbitron transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewMission}
            className={`flex-1 px-6 py-3 rounded-lg font-orbitron font-bold transition-all duration-300 ${
              result.interceptSuccess 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
            }`}
          >
            <Rocket className="w-5 h-5 inline mr-2" />
            New Mission
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BestInterceptModal({ onClose, onSelect, propulsionType, payloadMass }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative max-w-lg w-full mx-4 p-8 rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-900/90 to-indigo-900/90"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-800/60 hover:bg-red-600/60 rounded-full transition-colors duration-300">
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="text-center mb-6">
          <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="font-orbitron text-2xl font-bold text-purple-300">Best Interception Windows</h2>
          <p className="font-exo text-gray-300 mt-2">Select an optimal launch window. Estimates are based on your current configuration.</p>
        </div>
        <div className="space-y-4">
          {bestInterceptWindows.map(window => {
            const data = propulsionData[propulsionType];
            const massModifier = 1 + ((payloadMass - 500) / 4500) * 0.2;
            const estimatedTime = Math.round(window.travelTime * data.timeMod * massModifier);
            const estimatedDeltaV = (window.deltaV * data.deltaVMod * massModifier).toFixed(1);

            return (
              <motion.button
                key={window.label}
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(window)}
                className="w-full p-4 bg-gray-800/60 border border-gray-600 rounded-lg text-left hover:border-purple-400 hover:bg-purple-900/40 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-orbitron font-bold text-lg text-white">{window.label}</p>
                    <p className="font-exo text-sm text-gray-400">Launch Date: {new Date(window.value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-exo text-sm text-cyan-400">Est. ΔV: {estimatedDeltaV} km/s</p>
                    <p className="font-exo text-sm text-orange-400">Est. Time: {estimatedTime} days</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChaseSimulator({ onBack }) {
  const [missionMode, setMissionMode] = useState('anytime');
  const [propulsionType, setPropulsionType] = useState('ion');
  const [payloadMass, setPayloadMass] = useState(1500);
  const [launchDate, setLaunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [missionResult, setMissionResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showBestInterceptModal, setShowBestInterceptModal] = useState(false);

  const propulsionOptions = {
    chemical: { name: 'Chemical Rocket', icon: '🚀', maxDeltaV: '15 km/s', description: 'High thrust, limited range' },
    ion: { name: 'Ion Drive', icon: '⚡', maxDeltaV: '25 km/s', description: 'High efficiency, long duration' },
    nuclear: { name: 'Nuclear Thermal', icon: '☢️', maxDeltaV: '30 km/s', description: 'High performance, complex' },
    solar: { name: 'Solar Sail', icon: '🌟', maxDeltaV: '12 km/s', description: 'Unlimited fuel, slow acceleration' }
  };

  const startMission = async (mode, params) => {
    setIsCalculating(true);
    setShowResults(false);
    setMissionResult(null);

    try {
      let result;
      if (mode === 'best-interception') {
        result = await mockBackendAPI.calculateOptimalIntercept(params);
      } else {
        result = await mockBackendAPI.calculateAnytimeChase(params);
      }

      const newMissionResult = {
        ...result,
        propulsionType: params.propulsion,
        payloadMass: params.payloadMass,
        mode: mode,
      };

      setMissionResult(newMissionResult);

      const allMissions = await db.missions.toArray();
      const newMissionName = `Mission #${allMissions.length + 1}`;
      await db.missions.add({
        name: newMissionName,
        data: newMissionResult,
        timestamp: new Date().toISOString()
      });

      setIsCalculating(false);
      setIsSimulating(true);

      setTimeout(() => {
        setIsSimulating(false);
        setShowResults(true);
      }, 12000);
      
    } catch (error) {
      console.error('Mission calculation failed:', error);
      setIsCalculating(false);
    }
  };

  const handleLaunchAnytimeMission = () => {
    startMission('anytime', {
      propulsion: propulsionType,
      payloadMass: payloadMass,
      launchDate: launchDate
    });
  };
  
  const handleSelectBestIntercept = (window) => {
    setShowBestInterceptModal(false);
    setMissionMode('best-interception');
    startMission('best-interception', {
      propulsion: propulsionType,
      payloadMass: payloadMass,
      window: window
    });
  };

  const handleRetryMission = () => {
    setShowResults(false);
    setMissionResult(null);
  };

  const handleNewMission = () => {
    setShowResults(false);
    setMissionResult(null);
    setMissionMode('anytime');
    setPropulsionType('ion');
    setPayloadMass(1500);
    setLaunchDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex">
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-gray-900/95 backdrop-blur-lg border-r border-cyan-500/30 flex flex-col"
      >
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                MISSION CONTROL
              </span>
            </h2>
            <button
              onClick={onBack}
              className="p-2 bg-gray-800/60 hover:bg-cyan-600/60 rounded-full transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="font-exo text-gray-400">Configure your intercept mission</p>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
          <div>
            <label className="block font-orbitron text-cyan-400 font-bold mb-3">Mission Mode</label>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMissionMode('best-interception');
                  setShowBestInterceptModal(true);
                }}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                  missionMode === 'best-interception'
                    ? 'border-purple-400 bg-purple-600/20 text-purple-300'
                    : 'border-gray-600 bg-gray-800/40 text-gray-300 hover:border-purple-500/50'
                }`}
              >
                <div className="font-orbitron font-bold">Best Interception</div>
                <div className="font-exo text-sm opacity-80">Choose from optimal launch windows</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMissionMode('anytime')}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                  missionMode === 'anytime'
                    ? 'border-cyan-400 bg-cyan-600/20 text-cyan-300'
                    : 'border-gray-600 bg-gray-800/40 text-gray-300 hover:border-cyan-500/50'
                }`}
              >
                <div className="font-orbitron font-bold">Anytime Chase</div>
                <div className="font-exo text-sm opacity-80">Launch on your chosen date</div>
              </motion.button>
            </div>
          </div>

          <div>
            <label className="block font-orbitron text-cyan-400 font-bold mb-3">Propulsion System</label>
            <select
              value={propulsionType}
              onChange={(e) => setPropulsionType(e.target.value)}
              className="w-full p-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white font-orbitron focus:border-cyan-400 focus:outline-none transition-colors duration-300"
            >
              {Object.entries(propulsionOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.icon} {option.name} - {option.maxDeltaV}
                </option>
              ))}
            </select>
            <p className="font-exo text-xs text-gray-400 mt-2">
              {propulsionOptions[propulsionType].description}
            </p>
          </div>

          <div>
            <label className="block font-orbitron text-cyan-400 font-bold mb-3">
              Payload Mass: {payloadMass} kg
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={payloadMass}
              onChange={(e) => setPayloadMass(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between font-exo text-xs text-gray-400 mt-1">
              <span>500 kg</span>
              <span>5000 kg</span>
            </div>
          </div>

          <AnimatePresence>
            {missionMode === 'anytime' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6">
                  <label className="block font-orbitron text-cyan-400 font-bold mb-3">Launch Date</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="space-date w-full p-3 rounded-lg text-white font-orbitron transition-all duration-300 bg-gradient-to-r from-gray-900/70 to-black/70 border border-cyan-500/40 focus:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {missionMode === 'anytime' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunchAnytimeMission}
              disabled={isCalculating || isSimulating}
              className={`w-full py-4 rounded-lg font-orbitron font-bold text-lg transition-all duration-300 ${
                isCalculating || isSimulating
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white animate-pulse-glow'
              }`}
            >
              {isCalculating ? (
                <>
                  <Settings className="w-5 h-5 inline mr-2 animate-spin" />
                  CALCULATING...
                </>
              ) : isSimulating ? (
                <>
                  <Play className="w-5 h-5 inline mr-2" />
                  MISSION IN PROGRESS...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 inline mr-2" />
                  🚀 LAUNCH MISSION
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <h1 className="font-orbitron text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              CLICK TO CHASE: 3I/ATLAS INTERCEPT SIMULATOR
            </span>
          </h1>
          <p className="font-exo text-gray-400">
            Plan and execute interstellar object intercept missions with real orbital mechanics
          </p>
        </div>

        <div className="flex-1 relative">
          <MissionVisualization isSimulating={isSimulating} />
          
          {(isCalculating || isSimulating) && (
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-cyan-400 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="font-orbitron text-cyan-400 font-bold">
                  {isCalculating ? 'CALCULATING TRAJECTORY...' : 'MISSION IN PROGRESS...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showResults && missionResult && (
          <MissionResults
            key="mission-results"
            result={missionResult}
            onRetry={handleRetryMission}
            onNewMission={handleNewMission}
            showConfetti={missionResult.interceptSuccess}
          />
        )}
        {showBestInterceptModal && (
          <BestInterceptModal
            key="best-intercept-modal"
            onClose={() => setShowBestInterceptModal(false)}
            onSelect={handleSelectBestIntercept}
            propulsionType={propulsionType}
            payloadMass={payloadMass}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
