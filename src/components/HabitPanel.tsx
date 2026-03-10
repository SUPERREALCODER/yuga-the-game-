import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, Zap, Cpu, Briefcase, Heart, BookOpen } from 'lucide-react';

interface HabitPanelProps {
  habits: any[];
  onLog: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: any = {
  cognitive: Cpu,
  kinematic: Zap,
  trade: Briefcase,
  vitality: Heart,
  culture: BookOpen
};

export const HabitPanel: React.FC<HabitPanelProps> = ({ habits, onLog, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 z-50 p-8 flex flex-col"
        >
          <div className="tala-patra h-full w-full rounded-l-3xl shadow-2xl border-l-8 border-sandstone flex flex-col p-6 overflow-y-auto relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-stone-800 hover:scale-110 transition-transform"
             >
                ✕
             </button>
             
             <h2 className="text-3xl font-display font-bold mb-8 border-b-2 border-stone-800/20 pb-2">
                Daily Rituals
             </h2>

             <div className="space-y-6">
                {habits.map((habit) => {
                  const Icon = iconMap[habit.id] || Scroll;
                  return (
                    <motion.div 
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => onLog(habit.id)}
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-800/10 hover:bg-stone-800/5 transition-colors">
                        <div className="p-3 bg-stone-800/10 rounded-lg group-hover:bg-sandstone group-hover:text-white transition-colors">
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight">{habit.name}</h3>
                          <p className="text-sm opacity-70 italic mt-1">Streak: {habit.streak} days</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
             </div>

             <div className="mt-auto pt-8 text-xs opacity-50 text-center uppercase tracking-widest">
                The Architect's Epoch
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
