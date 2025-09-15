import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Rocket, Target, Fuel, Clock, Trophy, X, Filter, Search, Download, ArrowLeft, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import jsPDF from 'jspdf';

export default function MissionDiary({ onBack, onNavigate }) {
  const allMissions = useLiveQuery(() => db.missions.toArray(), []);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const missions = useMemo(() => {
    return allMissions ? [...allMissions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
  }, [allMissions]);

  const filteredMissions = useMemo(() => {
    if (!missions) return [];
    
    let filtered = missions;
    
    if (filterType === 'success') {
      filtered = filtered.filter(mission => mission.data.interceptSuccess);
    } else if (filterType === 'failure') {
      filtered = filtered.filter(mission => !mission.data.interceptSuccess);
    }
    
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(mission => 
        mission.name.toLowerCase().includes(lowercasedTerm) ||
        (mission.data.propulsionType && mission.data.propulsionType.toLowerCase().includes(lowercasedTerm)) ||
        (mission.data.mode && mission.data.mode.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    return filtered;
  }, [missions, filterType, searchTerm]);

  const handleExportData = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Mission Diary Summary", 105, 20, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let y = 35;

    missions.forEach(mission => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${mission.name} - ${mission.data.interceptSuccess ? 'SUCCESS' : 'FAILURE'}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`- Date: ${format(new Date(mission.timestamp), 'MMM dd, yyyy HH:mm')}`, 20, y + 5);
      doc.text(`- Propulsion: ${mission.data.propulsionType}`, 20, y + 10);
      doc.text(`- ΔV: ${mission.data.deltaV} km/s, Travel Time: ${mission.data.travelTime} days, Fuel: ${mission.data.fuelRequired} kg`, 20, y + 15);
      y += 25;
    });

    doc.save('mission-diary-summary.pdf');
  };

  const handleDownloadMissionReport = (mission) => {
    const doc = new jsPDF();
    const { data, name, timestamp } = mission;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Mission Report: ${name}`, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Timestamp: ${format(new Date(timestamp), 'MMM dd, yyyy, HH:mm:ss')}`, 14, 35);
    
    const status = data.interceptSuccess ? 'SUCCESS' : 'FAILURE';
    const statusColor = data.interceptSuccess ? '#4CAF50' : '#F44336';
    doc.setTextColor(statusColor);
    doc.text(`Outcome: ${status}`, 14, 42);
    doc.setTextColor(0);

    doc.line(14, 48, 196, 48);

    let y = 58;
    const addDetail = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 60, y);
      y += 7;
    };

    addDetail("Propulsion System:", `${data.propulsionType}`);
    addDetail("Mission Mode:", data.mode);
    addDetail("Payload Mass:", `${data.payloadMass} kg`);
    addDetail("Launch Date:", format(new Date(data.launchDate), 'MMM dd, yyyy'));
    addDetail("Arrival Date:", format(new Date(data.arrivalDate), 'MMM dd, yyyy'));
    addDetail("Travel Time:", `${data.travelTime} days`);
    addDetail("Delta-V Required:", `${data.deltaV} km/s`);
    addDetail("Fuel Required:", `${data.fuelRequired} kg`);
    
    y += 5;
    doc.line(14, y-2, 196, y-2);
    doc.setFont("helvetica", "bold");
    doc.text("Mission Notes:", 14, y+5);
    doc.setFont("helvetica", "normal");
    const explanationLines = doc.splitTextToSize(data.explanation, 182);
    doc.text(explanationLines, 14, y + 12);
    y += 12 + (explanationLines.length * 5);

    if(data.educationalNote) {
        const noteLines = doc.splitTextToSize(`Educational Note: ${data.educationalNote}`, 182);
        doc.text(noteLines, 14, y + 7);
    }

    doc.save(`mission-report-${name.replace(/\s+/g, '-')}.pdf`);
  };

  const propulsionIcons = { chemical: '🚀', ion: '⚡', nuclear: '☢️', solar: '🌟' };
  const getSuccessRate = () => missions.length === 0 ? 0 : Math.round((missions.filter(m => m.data.interceptSuccess).length / missions.length) * 100);
  const getAverageDeltaV = () => missions.length === 0 ? 0 : (missions.reduce((sum, m) => sum + parseFloat(m.data.deltaV), 0) / missions.length).toFixed(1);
  const getBestMission = () => missions.filter(m => m.data.interceptSuccess).sort((a, b) => parseFloat(a.data.deltaV) - parseFloat(b.data.deltaV))[0];

  const chartData = filteredMissions.map((m) => ({
    name: m.name,
    travelTime: m.data.travelTime,
    fuelEfficiency: m.data.fuelRequired > 0 ? parseFloat((m.data.payloadMass / m.data.fuelRequired).toFixed(2)) : 0
  })).reverse();

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/20"></div>
      
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 bg-gray-800/60 hover:bg-cyan-600/60 rounded-full transition-colors duration-300">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="font-orbitron text-3xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">MISSION DIARY</span>
                </h1>
                <p className="font-exo text-gray-400">Complete history of your intercept missions</p>
              </div>
            </div>
            {missions.length > 0 && (
              <motion.button onClick={handleExportData} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-orbitron text-sm">
                <Download className="w-4 h-4 inline mr-2" /> Export Summary
              </motion.button>
            )}
          </div>
        </div>

        {missions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-gray-400 mb-2">No Missions Yet</h2>
              <p className="font-exo text-gray-500 mb-6">Start your first intercept mission to build your diary</p>
              <motion.button onClick={() => onNavigate('chase')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-orbitron font-bold">
                Start Chasing
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard icon={Rocket} label="TOTAL MISSIONS" value={missions.length} color="blue" />
              <StatCard icon={Trophy} label="SUCCESS RATE" value={`${getSuccessRate()}%`} color="green" />
              <StatCard icon={Target} label="AVG. DELTA-V" value={`${getAverageDeltaV()} km/s`} color="purple" />
              <StatCard icon={Fuel} label="BEST MISSION ΔV" value={getBestMission() ? `${getBestMission().data.deltaV} km/s` : 'N/A'} color="orange" />
            </div>

            <div className="h-72 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 mb-6">
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Mission Analytics</h3>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Travel Time (Days)', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Fuel Efficiency', angle: 90, position: 'insideRight', fill: '#82ca9d' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #06B6D4' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="travelTime" name="Travel Time" barSize={20} fill="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="fuelEfficiency" name="Fuel Efficiency" stroke="#82ca9d" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex items-center space-x-2"><Filter className="w-5 h-5 text-gray-400" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white font-orbitron text-sm focus:border-cyan-400 focus:outline-none">
                  <option value="all">All</option><option value="success">Successful</option><option value="failure">Failed</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 flex-1"><Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search by name, propulsion, or mode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white font-exo text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
            </div>
            <div className="grid gap-4">
              {filteredMissions.map((mission) => (
                <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-lg border cursor-pointer ${mission.data.interceptSuccess ? 'bg-green-900/40 border-green-500/50 hover:border-green-400' : 'bg-red-900/40 border-red-500/50 hover:border-red-400'}`}
                  onClick={() => setSelectedMission(mission)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4"><div className={`w-3 h-3 rounded-full ${mission.data.interceptSuccess ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white">{propulsionIcons[mission.data.propulsionType]} {mission.name}</h3>
                        <p className="font-exo text-sm text-gray-400 capitalize">{mission.data.propulsionType} • {mission.data.mode} • {format(new Date(mission.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-center">
                      <div><p className="font-orbitron text-cyan-400">ΔV</p><p className="font-bold text-white">{mission.data.deltaV}</p></div>
                      <div><p className="font-orbitron text-purple-400">TIME</p><p className="font-bold text-white">{mission.data.travelTime}d</p></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMission && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedMission(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className={`max-w-2xl w-full mx-4 p-6 rounded-2xl border-2 ${selectedMission.data.interceptSuccess ? 'bg-green-900/90 border-green-400' : 'bg-red-900/90 border-red-400'}`}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-orbitron text-2xl font-bold ${selectedMission.data.interceptSuccess ? 'text-green-400' : 'text-red-400'}`}>Mission Details: {selectedMission.name}</h2>
                <button onClick={() => setSelectedMission(null)} className="p-2 bg-gray-800/60 hover:bg-gray-700/80 rounded-full"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <DetailItem label="PROPULSION" value={`${propulsionIcons[selectedMission.data.propulsionType]} ${selectedMission.data.propulsionType}`} />
                <DetailItem label="MISSION MODE" value={selectedMission.data.mode} />
                <DetailItem label="PAYLOAD MASS" value={`${selectedMission.data.payloadMass} kg`} />
                <DetailItem label="LAUNCH DATE" value={format(new Date(selectedMission.timestamp), 'MMM dd, yyyy, HH:mm:ss')} />
                <DetailItem label="DELTA-V" value={`${selectedMission.data.deltaV} km/s`} />
                <DetailItem label="TRAVEL TIME" value={`${selectedMission.data.travelTime} days`} />
                <DetailItem label="FUEL REQUIRED" value={`${selectedMission.data.fuelRequired} kg`} />
                <DetailItem label="ARRIVAL DATE" value={format(new Date(selectedMission.data.arrivalDate), 'MMM dd, yyyy')} />
              </div>
              <div className={`p-4 rounded-lg border ${selectedMission.data.interceptSuccess ? 'bg-green-900/40 border-green-500/50' : 'bg-red-900/40 border-red-500/50'} mb-6`}>
                <h3 className={`font-orbitron font-bold mb-2 ${selectedMission.data.interceptSuccess ? 'text-green-400' : 'text-red-400'}`}>Mission Outcome</h3>
                <p className="font-exo text-gray-300">{selectedMission.data.explanation}</p>
                {selectedMission.data.educationalNote && <p className="font-exo text-gray-400 text-sm mt-2 italic">{selectedMission.data.educationalNote}</p>}
              </div>
              <motion.button onClick={() => handleDownloadMissionReport(selectedMission)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-orbitron text-sm">
                <Download className="w-4 h-4 inline mr-2" /> Download Report (PDF)
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-400', green: 'text-green-400',
    purple: 'text-purple-400', orange: 'text-orange-400'
  };
  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-orbitron text-sm ${colors[color]}`}>{label}</p>
          <p className="font-orbitron text-xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${colors[color]}`} />
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="font-orbitron text-sm text-gray-400 capitalize">{label}</p>
    <p className="font-orbitron text-lg font-bold text-white capitalize">{value}</p>
  </div>
);
