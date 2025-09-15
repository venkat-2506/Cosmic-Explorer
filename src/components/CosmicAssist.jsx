import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, User, BrainCircuit } from 'lucide-react';
import { db, getLatestChat, saveChat } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { runChat } from '../utils/gemini';
import { v4 as uuidv4 } from 'uuid';
import { interstellarObjects } from '../data/interstellarObjects';
import { educationalContent } from '../data/educationalContent';

export default function CosmicAssist({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const missions = useLiveQuery(() => db.missions.toArray(), []);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getLatestChat();
      if (history && history.messages) {
        const messagesWithIds = history.messages.map(m => ({ ...m, id: m.id || uuidv4() }));
        setMessages(messagesWithIds);
      } else {
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            text: 'Hello! I am Cosmic Assist, your AI mission analyst and space expert. Ask me about your missions, the educational content, or any question about the cosmos!'
          }
        ]);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: uuidv4(), sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    const missionHistory = missions ? missions.map(m => ({
      name: m.name,
      status: m.data.interceptSuccess ? 'Success' : 'Failure',
      propulsion: m.data.propulsionType,
      deltaV: m.data.deltaV,
      travelTime: m.data.travelTime,
      fuel: m.data.fuelRequired,
      explanation: m.data.explanation
    })) : [];

    const educationalData = educationalContent.map(topic => ({
      title: topic.title,
      description: topic.description,
      lessons: topic.lessons.map(lesson => lesson.title)
    }));

    const overviewData = interstellarObjects.map(obj => ({
      name: obj.name,
      type: obj.type,
      description: obj.description
    }));

    const combinedPrompt = `
      You are Cosmic Assist, a friendly, enthusiastic, and highly knowledgeable AI assistant. Your expertise covers all of space: astronomy, astrophysics, space exploration, cosmology, and the specific data within this application.

      You have access to the following contextual information from the application:
      1.  **Mission Diary**: A complete history of the user's simulated intercept missions, including successes and failures.
      2.  **Education Center**: A curriculum on orbital mechanics, propulsion, and mission planning.
      3.  **Overview Data**: Information on known interstellar objects like 'Oumuamua and 2I/Borisov.

      Your primary goal is to answer the user's questions accurately and engagingly.

      **How to Respond:**
      - **If the question is about the user's missions:** Use the "Mission History" data to provide specific analysis, summaries, or advice.
      - **If the question is about topics in the app (e.g., "Tell me about 'Oumuamua", "What is Delta-V?"):** Use the "Overview Data" and "Education Center Data" to answer.
      - **If the question is a general space question (e.g., "What is a black hole?", "How do stars form?"):** Use your broad, built-in knowledge of space to provide a comprehensive answer.
      - **Always be friendly and maintain your persona.** Use markdown for clear formatting (lists, bolding).

      ---
      **CONTEXTUAL DATA (for your reference):**

      **1. Mission History (JSON):**
      ${JSON.stringify(missionHistory, null, 2)}

      **2. Education Center Topics (JSON):**
      ${JSON.stringify(educationalData, null, 2)}

      **3. Interstellar Objects Overview (JSON):**
      ${JSON.stringify(overviewData, null, 2)}
      ---

      **User's Request:** "${userInput}"
    `;

    const aiResponseText = await runChat(combinedPrompt);
    const aiMessage = { id: uuidv4(), sender: 'ai', text: aiResponseText };
    
    const finalMessages = [...newMessages, aiMessage];
    setMessages(finalMessages);
    setIsLoading(false);
    await saveChat(finalMessages);
  };

  return (
    <div className="h-full w-full bg-black text-white relative flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/20"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 bg-gray-800/60 hover:bg-cyan-600/60 rounded-full transition-colors duration-300">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="font-orbitron text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">COSMIC ASSIST</span>
              </h1>
              <p className="font-exo text-gray-400">Your AI Mission Analyst </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-4 mb-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-cyan-600/30 flex items-center justify-center flex-shrink-0 border border-cyan-500">
                    <Bot className="w-6 h-6 text-cyan-300" />
                  </div>
                )}
                <div className={`max-w-lg p-4 rounded-xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/50 text-white rounded-br-none'
                    : 'bg-gray-800/70 text-gray-300 rounded-bl-none'
                }`}>
                  <p className="font-exo whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0 border border-blue-500">
                    <User className="w-6 h-6 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-600/30 flex items-center justify-center flex-shrink-0 border border-cyan-500">
                <Bot className="w-6 h-6 text-cyan-300" />
              </div>
              <div className="max-w-lg p-4 rounded-xl bg-gray-800/70 text-gray-300 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100"></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-gray-700/50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-900/80 border border-cyan-500/30 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your missions or the cosmos..."
              className="flex-1 bg-transparent text-white font-exo placeholder-gray-500 focus:outline-none px-2"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
