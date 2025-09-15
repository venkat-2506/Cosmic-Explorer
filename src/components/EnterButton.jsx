import React from 'react';
import { motion } from 'framer-motion';

export default function EnterButton({ onClick }) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="group relative font-orbitron font-bold text-xl md:text-2xl px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white rounded-full border-2 border-transparent hover:border-cyan-400 transition-all duration-300 animate-pulse-glow overflow-hidden"
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        
        {/* Button text */}
        <span className="relative z-10 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
          ENTER THE COSMOS
        </span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
        
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-20"></div>
      </motion.button>
    </div>
  );
}
