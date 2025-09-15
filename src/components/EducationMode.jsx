import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, Clock, Target, Orbit, Star, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { educationalContent } from '../data/educationalContent';

function LessonDetail({ lesson, onNext, onPrev, isLast, isFirst }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6"
    >
      <h3 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">
        {lesson.title}
      </h3>
      
      <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-4 mb-6">
        <p className="font-exo text-2xl text-center text-cyan-300">
          {lesson.visual}
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <p className="font-exo text-lg text-gray-300 leading-relaxed">
          {lesson.content}
        </p>
        
        <div className="bg-blue-900/40 border border-blue-400/50 rounded-lg p-4">
          <h4 className="font-orbitron text-blue-400 font-bold mb-2">Real-World Example</h4>
          <p className="font-exo text-gray-300 leading-relaxed">
            {lesson.example}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          disabled={isFirst}
          className={`px-4 py-2 rounded-lg font-orbitron transition-all duration-300 ${
            isFirst
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700/80 hover:bg-gray-600/80 text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Previous
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className={`px-4 py-2 rounded-lg font-orbitron font-bold transition-all duration-300 ${
            isLast
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
          }`}
        >
          {isLast ? (
            <>
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function EducationMode({ onBack }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(new Set());

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentLessonIndex(0);
  };

  const handleNextLesson = () => {
    if (selectedTopic && currentLessonIndex < selectedTopic.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (selectedTopic) {
      // Mark topic as completed
      setCompletedTopics(prev => new Set([...prev, selectedTopic.id]));
      setSelectedTopic(null);
      setCurrentLessonIndex(0);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentLessonIndex(0);
  };

  if (selectedTopic) {
    const currentLesson = selectedTopic.lessons[currentLessonIndex];
    const isFirst = currentLessonIndex === 0;
    const isLast = currentLessonIndex === selectedTopic.lessons.length - 1;

    return (
      <div className="h-full w-full bg-black text-white relative flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/20"></div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToTopics}
                  className="p-2 bg-gray-800/60 hover:bg-cyan-600/60 rounded-full transition-colors duration-300"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="font-orbitron text-2xl font-bold text-cyan-400">
                    {selectedTopic.title}
                  </h1>
                  <p className="font-exo text-gray-400">
                    Lesson {currentLessonIndex + 1} of {selectedTopic.lessons.length}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {selectedTopic.lessons.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index <= currentLessonIndex ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
              <LessonDetail
                key={currentLessonIndex}
                lesson={currentLesson}
                onNext={handleNextLesson}
                onPrev={handlePrevLesson}
                isFirst={isFirst}
                isLast={isLast}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black text-white relative flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/20"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-800/60 hover:bg-cyan-600/60 rounded-full transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="font-orbitron text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                  EDUCATION CENTER
                </span>
              </h1>
              <p className="font-exo text-gray-400">Learn the science behind interstellar missions</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {educationalContent.map((topic) => {
              const IconComponent = topic.icon;
              const isCompleted = completedTopics.has(topic.id);
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: topic.id === 'orbital-mechanics' ? 0 : 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                    isCompleted 
                      ? 'border-green-500/50 hover:border-green-400' 
                      : 'border-gray-700/50 hover:border-cyan-500/50'
                  }`}
                  onClick={() => handleTopicSelect(topic)}
                >
                  {isCompleted && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-lg ${
                      isCompleted ? 'bg-green-600/20' : 'bg-cyan-600/20'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${
                        isCompleted ? 'text-green-400' : 'text-cyan-400'
                      }`} />
                    </div>
                    <span className={`font-orbitron text-sm ${
                      isCompleted ? 'text-green-400' : 'text-cyan-400'
                    }`}>
                      {topic.lessons.length} LESSONS
                    </span>
                  </div>
                  
                  <h3 className={`font-orbitron text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors duration-300 ${
                    isCompleted ? 'text-green-400' : 'text-white'
                  }`}>
                    {topic.title}
                  </h3>
                  
                  <p className="font-exo text-gray-400 text-lg mb-6 group-hover:text-gray-300 transition-colors duration-300">
                    {topic.description}
                  </p>
                  
                  <div className="space-y-2">
                    {topic.lessons.slice(0, 3).map((lesson, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isCompleted ? 'bg-green-400' : 'bg-cyan-400'
                        }`}></div>
                        <span className="font-exo text-sm text-gray-400">{lesson.title}</span>
                      </div>
                    ))}
                    {topic.lessons.length > 3 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        <span className="font-exo text-sm text-gray-500">
                          +{topic.lessons.length - 3} more lessons
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-700/50">
                    <div className={`font-orbitron font-bold flex items-center justify-center gap-2 ${
                      isCompleted ? 'text-green-400' : 'text-cyan-400'
                    }`}>
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          COMPLETED
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5" />
                          START LEARNING
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-center">
            <h3 className="font-orbitron text-xl font-bold text-blue-400 mb-3">Progress Overview</h3>
            <p className="font-exo text-gray-300 mb-4">
              Complete all topics to become a certified mission planner!
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="text-center">
                <p className="font-orbitron text-2xl font-bold text-white">
                  {completedTopics.size}/{educationalContent.length}
                </p>
                <p className="font-exo text-sm text-blue-400">Topics Completed</p>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTopics.size / educationalContent.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-center">
                <p className="font-orbitron text-2xl font-bold text-white">
                  {Math.round((completedTopics.size / educationalContent.length) * 100)}%
                </p>
                <p className="font-exo text-sm text-blue-400">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
