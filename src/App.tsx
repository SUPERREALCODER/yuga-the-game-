/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Database, 
  Terminal, 
  Activity, 
  Target, 
  Clock, 
  Code2, 
  ChevronRight,
  Menu,
  X,
  Network,
  Plus
} from 'lucide-react';
import VectorGraph from './components/VectorGraph';
import DataIngestModal from './components/DataIngestModal';

const INITIAL_STATE = {
  "okrs": [
    {
      "id": "okr_1",
      "title": "Financial Velocity via Solo Hackathons",
      "target": "₹1,200,000",
      "current": "₹150,000",
      "progress_percentage": 12.5,
      "deadline": "July 31, 2026",
      "key_results": ["Win 2 major agentic AI bounties", "Close 3 Bodhon client retainers"]
    },
    {
      "id": "okr_2",
      "title": "Academic Mastery: GATE DA",
      "target": "100% Syllabus Completion",
      "current": "45%",
      "progress_percentage": 45,
      "deadline": "Feb 2027",
      "key_results": ["Score >85% on 3 consecutive mock tests", "Complete Probability & Stats module"]
    }
  ],
  "active_sprint": {
    "sprint_name": "Sprint 42: Agentic Pipelines",
    "days_remaining": 4,
    "velocity_score": "A-",
    "tasks": [
      { "id": "t1", "title": "Integrate Gemini API into OttoMail core", "type": "Build", "status": "In Progress" },
      { "id": "t2", "title": "Draft architecture for new Bodhon client project", "type": "Build", "status": "Todo" },
      { "id": "t3", "title": "GATE DA: Linear Algebra practice set", "type": "Study", "status": "Done" }
    ]
  },
  "registry": [
    {
      "component_id": "comp_alpha_042",
      "title": "OttoMail: Local LLM Email Parsing Engine",
      "category": "Agentic AI Tools",
      "integration_time_mins": 25,
      "reliability": "A",
      "tags": ["Llama 3", "Python", "Local-First"],
      "friction_log": "Rate limiting triggered on IMAP batch fetch. Solved with 2s sleep buffer."
    }
  ]
};

type View = 'command' | 'sprint' | 'registry' | 'topology';

export default function App() {
  const [activeView, setActiveView] = useState<View>('command');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'command':
        return <CommandCenter okrs={INITIAL_STATE.okrs} />;
      case 'sprint':
        return <ActiveSprint sprint={INITIAL_STATE.active_sprint} />;
      case 'registry':
        return <SystemRegistry registry={INITIAL_STATE.registry} />;
      case 'topology':
        return <VectorGraph />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-200 border-r border-border bg-surface flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {isSidebarOpen && <span className="font-mono font-bold tracking-tighter text-xl">VERTEX_v1.0</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-border transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 py-4">
          <NavItem 
            icon={<Target size={18} />} 
            label="COMMAND_CENTER" 
            active={activeView === 'command'} 
            onClick={() => setActiveView('command')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Zap size={18} />} 
            label="ACTIVE_SPRINT" 
            active={activeView === 'sprint'} 
            onClick={() => setActiveView('sprint')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Database size={18} />} 
            label="SYSTEM_REGISTRY" 
            active={activeView === 'registry'} 
            onClick={() => setActiveView('registry')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Network size={18} />} 
            label="CAPABILITY_VECTORS" 
            active={activeView === 'topology'} 
            onClick={() => setActiveView('topology')} 
            collapsed={!isSidebarOpen}
          />
          
          <div className="mt-8 px-4">
            <button 
              onClick={() => setIsIngestModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 py-3 border border-accent text-accent hover:bg-accent hover:text-black transition-all font-mono text-[10px] font-bold tracking-widest ${!isSidebarOpen && 'px-0'}`}
            >
              <Plus size={14} />
              {isSidebarOpen && "NEW_ENTRY"}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 opacity-50">
            <Activity size={14} />
            {isSidebarOpen && <span className="text-[10px] font-mono tracking-widest">SYSTEM_STABLE</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-bg p-8">
        <header className="mb-8 flex justify-between items-end border-b border-border pb-4">
          <div>
            <h1 className="text-xs font-mono text-muted mb-1 tracking-widest uppercase">
              {activeView.replace('_', ' ')} / TELEMETRY_STREAM
            </h1>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeView === 'command' && 'MACRO_STRATEGY_OVERVIEW'}
              {activeView === 'sprint' && 'EXECUTION_LAYER_STATUS'}
              {activeView === 'registry' && 'CODE_ARCHITECTURE_WAREHOUSE'}
              {activeView === 'topology' && 'CAPABILITY_TOPOLOGY_MAP'}
            </h2>
          </div>
          <div className="text-right font-mono text-[10px] text-muted">
            <p>LATENCY: 14ms</p>
            <p>UPTIME: 99.99%</p>
          </div>
        </header>

        {renderContent()}
      </main>
      <DataIngestModal 
        isOpen={isIngestModalOpen} 
        onClose={() => setIsIngestModalOpen(false)} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 transition-colors relative group
        ${active ? 'bg-border text-white' : 'text-muted hover:text-white hover:bg-border/50'}`}
    >
      <div className={active ? 'text-white' : 'text-muted group-hover:text-white'}>{icon}</div>
      {!collapsed && <span className="font-mono text-xs tracking-wider">{label}</span>}
      {active && <div className="absolute right-0 top-0 h-full w-1 bg-white" />}
    </button>
  );
}

function CommandCenter({ okrs }: { okrs: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {okrs.map((okr) => (
        <div key={okr.id} className="telemetry-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold mb-1">{okr.title}</h3>
              <p className="text-xs text-muted font-mono">DEADLINE: {okr.deadline}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold">{okr.progress_percentage}%</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-[10px] font-mono text-muted mb-2">
              <span>CURRENT: {okr.current}</span>
              <span>TARGET: {okr.target}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${okr.progress_percentage}%` }} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-mono text-muted mb-3 tracking-widest uppercase">Key Results</h4>
            <ul className="space-y-2">
              {okr.key_results.map((kr: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted">
                  <ChevronRight size={14} className="text-accent" />
                  <span>{kr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActiveSprint({ sprint }: { sprint: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="telemetry-card flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase">Sprint Name</span>
          <span className="text-xl font-bold">{sprint.sprint_name}</span>
        </div>
        <div className="telemetry-card flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase">Time Remaining</span>
          <span className="text-xl font-mono font-bold">{sprint.days_remaining} DAYS</span>
        </div>
        <div className="telemetry-card flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase">Velocity Score</span>
          <span className="text-xl font-mono font-bold text-accent">{sprint.velocity_score}</span>
        </div>
      </div>

      <div className="telemetry-card">
        <h3 className="text-[10px] font-mono text-muted mb-6 tracking-widest uppercase">Task Execution Queue</h3>
        <div className="space-y-1">
          {sprint.tasks.map((task: any) => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-border hover:bg-border/20 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-none ${
                  task.status === 'Done' ? 'bg-green-500' : 
                  task.status === 'In Progress' ? 'bg-blue-500' : 'bg-muted'
                }`} />
                <span className="text-sm">{task.title}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-muted uppercase tracking-tighter">{task.type}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                  task.status === 'Done' ? 'border-green-500 text-green-500' : 
                  task.status === 'In Progress' ? 'border-blue-500 text-blue-500' : 'border-muted text-muted'
                }`}>
                  {task.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemRegistry({ registry }: { registry: any[] }) {
  return (
    <div className="space-y-6">
      {registry.map((item) => (
        <div key={item.component_id} className="telemetry-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code2 size={18} className="text-accent" />
                <h3 className="text-lg font-bold">{item.title}</h3>
              </div>
              <p className="text-xs text-muted font-mono uppercase tracking-tighter">{item.category} / {item.component_id}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-mono text-muted uppercase">Reliability</p>
                <p className="text-lg font-mono font-bold text-accent">{item.reliability}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-muted uppercase">Integration</p>
                <p className="text-lg font-mono font-bold">{item.integration_time_mins}m</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {item.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-border text-muted">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="bg-bg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} className="text-muted" />
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Friction Log</span>
            </div>
            <p className="text-sm font-mono text-muted leading-relaxed">
              {item.friction_log}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
