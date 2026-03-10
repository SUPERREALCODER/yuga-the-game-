import React from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, Code, Search } from 'lucide-react';

const advisors = [
  { id: 'strategist', name: 'Growth Strategist', role: 'Business', icon: TrendingUp, color: 'text-yellow-400' },
  { id: 'lead', name: 'Web Lead', role: 'Development', icon: Code, color: 'text-blue-400' },
  { id: 'researcher', name: 'Researcher', role: 'AI/Data', icon: Search, color: 'text-purple-400' },
  { id: 'guardian', name: 'Vitality Guardian', role: 'Physical', icon: Shield, color: 'text-green-400' },
];

export const AdvisoryCouncil: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-2">Advisory Council</h3>
      <div className="grid grid-cols-2 gap-2">
        {advisors.map((advisor) => (
          <div key={advisor.id} className="bg-vedic-dark/40 border border-white/5 p-2 rounded flex items-center gap-2 group hover:border-brass/30 transition-colors cursor-pointer">
            <div className={`${advisor.color} opacity-70 group-hover:opacity-100`}>
              <advisor.icon size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold leading-none">{advisor.name}</p>
              <p className="text-[7px] uppercase opacity-40">{advisor.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
