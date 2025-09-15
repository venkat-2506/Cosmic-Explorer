import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
               COSMIC EXPLORER
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-exo text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            "Let's chase the unknown together"
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
