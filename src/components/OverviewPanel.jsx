import React from 'react';
import { motion } from 'framer-motion';
import { Telescope, Globe, Zap, Star, Camera, BookOpen, Satellite, Navigation, ArrowLeft } from 'lucide-react';
import { interstellarObjects } from '../data/interstellarObjects';

const learningTopics = [
  {
    title: "What are Interstellar Objects?",
    icon: Star,
    content: "Objects that originate from outside our solar system and travel through interstellar space. They provide unique opportunities to study materials and conditions from other star systems."
  },
  {
    title: "Detection Methods",
    icon: Telescope,
    content: "Advanced telescopes and automated sky surveys detect these objects by their unusual orbits and high velocities. Their hyperbolic trajectories indicate they're not bound by our Sun's gravity."
  },
  {
    title: "Scientific Importance",
    icon: BookOpen,
    content: "These visitors carry information about their birth star systems, including composition, formation processes, and the diversity of planetary systems throughout the galaxy."
  },
  {
    title: "Real-Time Tracking",
    icon: Satellite,
    content: "Our mission uses advanced tracking systems to monitor 3i/ATLAS in real-time, providing unprecedented insights into interstellar object behavior and characteristics."
  }
];

export default function OverviewPanel({ onBack }) {
  return (
    <div className="h-full w-full bg-black/80 backdrop-blur-xl relative flex flex-col">
      <button
        onClick={onBack}
        className="fixed top-8 left-8 z-50 p-3 bg-gray-800/80 backdrop-blur-sm hover:bg-cyan-600/60 rounded-full transition-colors duration-300"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>
      
      <div className="flex-1 p-8 space-y-12 overflow-y-auto no-scrollbar">
        <div className="text-center pt-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-orbitron text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              INTERSTELLAR OBJECTS OVERVIEW
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-exo text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Explore the fascinating world of interstellar objects - cosmic messengers from distant star systems that have journeyed across the vast emptiness of space to visit our solar system.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 backdrop-blur-sm border border-cyan-400/50 rounded-xl p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-cyan-600/20 rounded-full mr-4">
              <Navigation className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="font-orbitron text-3xl font-bold text-cyan-400">ACTIVE MISSION: 3i/ATLAS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-4">Mission Status</h3>
              <ul className="space-y-2 text-gray-300 font-exo">
                <li className="flex items-center"><div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>Tracking: ACTIVE</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>Distance: ~2.8 AU from Earth</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>Velocity: 35.2 km/s</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>Next Update: Real-time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-4">Mission Objectives</h3>
              <ul className="space-y-2 text-gray-300 font-exo">
                <li>• Real-time trajectory monitoring</li>
                <li>• Composition analysis via spectroscopy</li>
                <li>• Interception mission planning</li>
                <li>• Data collection for future missions</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {learningTopics.map((topic, index) => {
            const IconComponent = topic.icon;
            return (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index + 1 }}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-cyan-600/20 rounded-lg">
                    <IconComponent className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg font-bold text-white mb-3">{topic.title}</h3>
                    <p className="font-exo text-gray-300 leading-relaxed">{topic.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="font-orbitron text-3xl font-bold text-cyan-400 mb-8 text-center"
          >
            KNOWN INTERSTELLAR VISITORS
          </motion.h2>
          <div className="space-y-8">
            {interstellarObjects.map((object, index) => (
              <motion.div
                key={object.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index + 1.4 }}
                className={`bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 ${
                  object.name.includes('3i/ATLAS') 
                    ? 'border-cyan-400/70 shadow-2xl shadow-cyan-400/20' 
                    : 'border-gray-700/50 hover:border-cyan-500/50'
                }`}
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative h-64 md:h-full">
                      <img
                        src={object.image}
                        alt={`Artist's impression of ${object.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&h=400&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="font-exo text-sm text-gray-300">
                          <Camera className="w-4 h-4 inline mr-2" />
                          Artist's Impression
                        </p>
                      </div>
                      {object.name.includes('3i/ATLAS') && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-cyan-600/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-white font-orbitron text-sm font-bold">ACTIVE MISSION</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-orbitron text-2xl font-bold text-white">{object.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-exo border ${
                        object.name.includes('3i/ATLAS')
                          ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-gray-600/20 border-gray-500/50 text-gray-400'
                      }`}>
                        {object.type}
                      </span>
                    </div>
                    <p className="font-exo text-gray-300 text-lg mb-6 leading-relaxed">{object.description}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-orbitron text-lg font-bold text-cyan-400 mb-3"><Zap className="w-5 h-5 inline mr-2" />Key Characteristics</h4>
                        <ul className="space-y-2">
                          {object.characteristics.map((char, idx) => (
                            <li key={idx} className="font-exo text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>{char}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-orbitron text-lg font-bold text-cyan-400 mb-3"><Star className="w-5 h-5 inline mr-2" />Fascinating Facts</h4>
                        <ul className="space-y-2">
                          {object.facts.map((fact, idx) => (
                            <li key={idx} className="font-exo text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>{fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700/50">
                      <p className="font-exo text-sm text-gray-400"><strong>Discovery Date:</strong> {object.discovered}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8 text-center"
        >
          <h3 className="font-orbitron text-2xl font-bold text-blue-400 mb-4">THE FUTURE OF INTERSTELLAR EXPLORATION</h3>
          <p className="font-exo text-lg text-gray-300 mb-6 leading-relaxed">
            Scientists estimate that several interstellar objects pass through our solar system each year. Advanced detection systems and rapid-response missions are revolutionizing our understanding of these cosmic visitors.
          </p>
          <div className="flex justify-center items-center space-x-4 text-blue-400">
            <Globe className="w-6 h-6" /><span className="font-orbitron font-semibold">Next Mission Target: TBD</span><Telescope className="w-6 h-6" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
