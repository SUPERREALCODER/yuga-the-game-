/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IsometricMap } from './components/IsometricMap';
import { HabitPanel } from './components/HabitPanel';
import { AdvisoryCouncil } from './components/AdvisoryCouncil';
import { Coins, Users, Landmark, Microscope, Palette, Menu, ShieldCheck } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<any>(null);
  const [isHabitPanelOpen, setIsHabitPanelOpen] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/state');
    const data = await res.json();
    setState(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLog = async (habitId: string) => {
    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId })
    });
    if (res.ok) {
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  if (!state) return <div className="flex items-center justify-center h-screen bg-vedic-dark text-brass">Initializing Yuga...</div>;

  const isDarkAge = state.habits.every((h: any) => h.streak === 0);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Map */}
      <div className={isDarkAge ? 'grayscale contrast-125 brightness-50 transition-all duration-1000' : 'transition-all duration-1000'}>
        <IsometricMap era={state.state.era} stats={state.state} />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        
        {/* Top Bar: Stats */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <StatCard icon={<Coins size={18}/>} label="Treasury" value={`${state.state.gold} G`} color="text-yellow-400" />
              <StatCard icon={<Microscope size={18}/>} label="Research" value={state.state.research_points} color="text-blue-400" />
              <StatCard icon={<Palette size={18}/>} label="Culture" value={state.state.culture_points} color="text-pink-400" />
            </div>
            <AdvisoryCouncil />
          </div>

          <div className="text-right">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-bold brass-text tracking-tighter"
            >
              YUGA
            </motion.h1>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 mt-1">The Architect's Epoch</p>
            {isDarkAge && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse"
              >
                ⚠️ DARK AGE DETECTED
              </motion.p>
            )}
          </div>
        </div>

        {/* Bottom Bar: Era & Controls */}
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="sandstone-border p-5 bg-vedic-dark/90 backdrop-blur rounded-tr-3xl min-w-[240px]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sandstone/20 rounded-xl">
                <Landmark className="text-sandstone" size={28} />
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-50 tracking-widest">Current Civilization Era</p>
                <p className="font-display text-2xl brass-text">{state.state.era} Epoch</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] uppercase opacity-50 mb-1">Population</p>
                <p className="font-mono text-xl font-bold flex items-center gap-2 justify-end">
                  <Users size={16} className="text-blue-400" />
                  {state.state.population}
                </p>
             </div>
            <button 
              onClick={() => setIsHabitPanelOpen(true)}
              className="w-16 h-16 bg-sandstone text-white rounded-full shadow-[0_0_30px_rgba(226,114,91,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center pointer-events-auto border-4 border-white/20"
            >
              <Menu size={32} />
            </button>
          </div>
        </div>
      </div>

      {/* Habit Panel */}
      <HabitPanel 
        habits={state.habits} 
        onLog={handleLog} 
        isOpen={isHabitPanelOpen} 
        onClose={() => setIsHabitPanelOpen(false)} 
      />

      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brass/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sandstone/30 to-transparent" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-vedic-dark/60 backdrop-blur border border-white/10 p-2 px-4 rounded-lg flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-[8px] uppercase opacity-50 leading-none">{label}</p>
        <p className="font-mono text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
