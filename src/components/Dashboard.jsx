import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, Telescope, Satellite, Orbit, BookOpen, ArrowLeft, Trophy, Gamepad2, BrainCircuit } from 'lucide-react';
import StarField from './StarField';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Comet from './Comet';
import OverviewPanel from './OverviewPanel';
import TrackingPanel from './TrackingPanel';
import ChaseSimulator from './ChaseSimulator';
import MissionDiary from './MissionDiary';
import EducationMode from './EducationMode';
import CosmicAssist from './CosmicAssist';

const menuItems = [
  {
    id: 'overview',
    title: 'Overview',
    buttonText: 'Explore',
    description: 'Get a comprehensive overview of the 3i/Atlas mission and interstellar objects',
    icon: Telescope,
  },
  {
    id: 'tracking',
    title: 'Track 3i/Atlas',
    buttonText: 'Start Tracking',
    description: 'Real-time tracking and monitoring of the 3i/Atlas spacecraft',
    icon: Satellite,
  },
  {
    id: 'chase',
    title: 'Chase Simulator',
    buttonText: 'Launch Mission',
    description: 'Interactive simulator to plan and execute intercept missions',
    icon: Gamepad2,
  },
  {
    id: 'mission',
    title: 'Mission Diary',
    buttonText: 'View History',
    description: 'Complete history and analysis of your intercept missions',
    icon: Trophy,
  },
  {
    id: 'assist',
    title: 'Cosmic Assist',
    buttonText: 'Ask AI',
    description: 'AI-powered analysis and suggestions for your completed missions',
    icon: BrainCircuit,
  },
  {
    id: 'education',
    title: 'Education Center',
    buttonText: 'Learn More',
    description: 'Learn orbital mechanics and spacecraft propulsion systems',
    icon: BookOpen,
  }
];

function RotatingStars() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      <StarField count={9000} isAnimated twinkle />
    </group>
  );
}

function ParallaxDrift() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.05) * 8;
    camera.position.y = 5 + Math.sin(t * 0.03) * 3;
    camera.position.z = 60 + Math.sin(t * 0.02) * 5;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function DashboardStarField() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }} camera={{ position: [0, 10, 60], fov: 60 }}>
        <ParallaxDrift />
        <RotatingStars />
        <Comet startPosition={[-80, -20, -50]} endPosition={[80, 20, -20]} speed={0.01} size={0.25} color="#66ccff" />
        <Comet startPosition={[60, 30, -40]} endPosition={[-60, -10, -10]} speed={0.015} size={0.2} color="#ff66cc" />
        <ambientLight intensity={0.1} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default function Dashboard({ onBack }) {
  const [selectedView, setSelectedView] = useState(null);
  const [showMissionControl, setShowMissionControl] = useState(false);

  const handleMenuClick = (viewId) => {
    setSelectedView(viewId);
    setShowMissionControl(false);
  };

  const handleBackToDashboard = () => {
    setSelectedView(null);
  };

  const toggleMissionControl = () => {
    setShowMissionControl(!showMissionControl);
  };

  const renderViewContent = () => {
    switch (selectedView) {
      case 'overview':
        return <OverviewPanel onBack={handleBackToDashboard} />;
      case 'tracking':
        return <TrackingPanel onBack={handleBackToDashboard} />;
      case 'chase':
        return <ChaseSimulator onBack={handleBackToDashboard} />;
      case 'mission':
        return <MissionDiary onBack={handleBackToDashboard} onNavigate={handleMenuClick} />;
      case 'assist':
        return <CosmicAssist onBack={handleBackToDashboard} />;
      case 'education':
        return <EducationMode onBack={handleBackToDashboard} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden"
    >
      <DashboardStarField />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/20"></div>

      <AnimatePresence>
        {!showMissionControl && selectedView === null && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={toggleMissionControl}
            className="fixed top-8 left-8 z-50 p-4 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 backdrop-blur-lg rounded-full border border-cyan-400/50 hover:border-cyan-300 transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Orbit className="w-8 h-8 text-cyan-300 group-hover:text-white transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-md group-hover:bg-cyan-300/50 transition-all duration-300"></div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMissionControl && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed top-0 left-0 w-80 h-full bg-gray-900/95 backdrop-blur-lg border-r border-cyan-500/30 z-40"
          >
            <div className="p-6 h-full flex flex-col no-scrollbar overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-orbitron text-2xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    MISSION CONTROL
                  </span>
                </h2>
                <button
                  onClick={toggleMissionControl}
                  className="p-2 bg-gray-800/60 hover:bg-red-600/60 rounded-full transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <nav className="space-y-4 flex-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-4 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80 border border-purple-400/50 rounded-lg text-purple-200 hover:from-blue-500/90 hover:via-purple-500/90 hover:to-pink-500/90 transition-all duration-300 font-orbitron font-semibold"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span>{item.buttonText}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-20 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedView ? (
            <motion.div
              key={selectedView}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {renderViewContent()}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto no-scrollbar"
            >
              <div className="text-center py-8">
                <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                    Cosmic Dashboard
                  </span>
                </h1>
                <p className="font-exo text-xl text-gray-300 max-w-4xl mx-auto">
                  Welcome to the mission control center. Plan intercept missions, track spacecraft, and learn about the visitors from beyond our solar system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                {menuItems.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.3, duration: 0.6 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border rounded-xl p-8 overflow-hidden cursor-pointer transition-all duration-300 border-gray-700/50 hover:border-cyan-500/50`}
                      onClick={() => handleMenuClick(feature.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-orbitron text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <IconComponent className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <p className="font-exo text-gray-400 text-lg mb-8 flex-1 group-hover:text-gray-300 transition-colors duration-300">
                          {feature.description}
                        </p>
                        <button className={`font-orbitron font-bold text-lg px-6 py-3 rounded-lg border-2 transition-all duration-300 group-hover:scale-105 border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-600/10`}>
                          <span className="flex items-center justify-center gap-2">
                            <IconComponent className="w-5 h-5" />
                            {feature.buttonText}
                          </span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-center mt-12">
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gray-700/80 backdrop-blur-md border border-gray-600 rounded-lg text-gray-300 hover:border-cyan-500/50 hover:bg-cyan-900/40 transition-all duration-300 font-orbitron flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Solar System
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
