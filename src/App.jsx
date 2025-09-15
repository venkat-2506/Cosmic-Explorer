import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SolarSystem from './components/SolarSystem';
import HeroSection from './components/HeroSection';
import EnterButton from './components/EnterButton';
import LoadingScreen from './components/LoadingScreen';
import TransitionLoader from './components/TransitionLoader';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterCosmos = () => {
    setIsTransitioning(true);
    
    // Simulate transition loading
    setTimeout(() => {
      setIsTransitioning(false);
      setShowDashboard(true);
    }, 2000);
  };

  const handleBackToSystem = () => {
    setIsTransitioning(true);
    
    // Simulate transition loading
    setTimeout(() => {
      setIsTransitioning(false);
      setShowDashboard(false);
    }, 2000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isTransitioning) {
    return <TransitionLoader />;
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {showDashboard ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Dashboard onBack={handleBackToSystem} />
          </motion.div>
        ) : (
          <motion.div
            key="solar-system"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full h-screen"
          >
            <SolarSystem />
            <HeroSection />
            <EnterButton onClick={handleEnterCosmos} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
