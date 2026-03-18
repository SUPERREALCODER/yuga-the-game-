/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Zap, Database, Plus } from 'lucide-react';

interface DataIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type IngestType = 'sprint' | 'registry';

export default function DataIngestModal({ isOpen, onClose }: DataIngestModalProps) {
  const [activeType, setActiveType] = useState<IngestType>('sprint');

  // Sprint Task State
  const [sprintTask, setSprintTask] = useState({
    type: 'BUILD',
    title: ''
  });

  // Registry Asset State
  const [registryAsset, setRegistryAsset] = useState({
    title: '',
    tags: '',
    vectorOriginId: 'genesis',
    build: '',
    friction: '',
    mentalModel: ''
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ADDING TASK:', sprintTask);
    // TODO: Wire to backend API
    onClose();
  };

  const handleSaveRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SAVING REGISTRY:', registryAsset);
    // TODO: Wire to backend API
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-surface border border-border flex flex-col shadow-2xl overflow-hidden">
        {/* Header Telemetry */}
        <div className="p-4 border-b border-border bg-bg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-accent" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Data_Ingest_Protocol</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Toggle Controls */}
        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveType('sprint')}
            className={`flex-1 py-4 font-mono text-xs tracking-widest transition-colors ${
              activeType === 'sprint' ? 'bg-white text-black font-bold' : 'text-muted hover:bg-border/30'
            }`}
          >
            [ SPRINT TASK ]
          </button>
          <button 
            onClick={() => setActiveType('registry')}
            className={`flex-1 py-4 font-mono text-xs tracking-widest transition-colors ${
              activeType === 'registry' ? 'bg-white text-black font-bold' : 'text-muted hover:bg-border/30'
            }`}
          >
            [ REGISTRY ASSET ]
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {activeType === 'sprint' ? (
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Task_Type</label>
                <div className="flex gap-4">
                  {['BUILD', 'STUDY'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="taskType" 
                        value={t}
                        checked={sprintTask.type === t}
                        onChange={(e) => setSprintTask({ ...sprintTask, type: e.target.value })}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border border-border flex items-center justify-center transition-colors ${sprintTask.type === t ? 'bg-accent border-accent' : 'bg-transparent'}`}>
                        {sprintTask.type === t && <div className="w-1.5 h-1.5 bg-black" />}
                      </div>
                      <span className={`text-xs font-mono tracking-wider ${sprintTask.type === t ? 'text-white' : 'text-muted group-hover:text-white'}`}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Task_Title</label>
                <input 
                  type="text"
                  value={sprintTask.title}
                  onChange={(e) => setSprintTask({ ...sprintTask, title: e.target.value })}
                  placeholder="Enter task objective..."
                  className="w-full bg-bg border border-border p-4 font-sans text-sm text-white focus:border-accent outline-none placeholder:text-muted/20"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black py-4 font-mono text-xs font-bold tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                EXECUTE: ADD TO SPRINT
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveRegistry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Asset_Title</label>
                  <input 
                    type="text"
                    value={registryAsset.title}
                    onChange={(e) => setRegistryAsset({ ...registryAsset, title: e.target.value })}
                    className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Tech_Tags</label>
                  <input 
                    type="text"
                    value={registryAsset.tags}
                    onChange={(e) => setRegistryAsset({ ...registryAsset, tags: e.target.value })}
                    placeholder="Llama 3, Python..."
                    className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">VECTOR_ORIGIN (Builds Upon)</label>
                <select 
                  value={registryAsset.vectorOriginId}
                  onChange={(e) => setRegistryAsset({ ...registryAsset, vectorOriginId: e.target.value })}
                  className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none appearance-none cursor-pointer"
                >
                  <option value="genesis">None (Genesis Node)</option>
                  <option value="otto">OttoMail Architecture</option>
                  <option value="capacitor">Switched-Capacitor Circuit</option>
                  <option value="innovatia">Innovatia Hardware</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">The_Build (Summary)</label>
                <textarea 
                  rows={2}
                  value={registryAsset.build}
                  onChange={(e) => setRegistryAsset({ ...registryAsset, build: e.target.value })}
                  className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Friction_Log (Bugs & Fixes)</label>
                <textarea 
                  rows={2}
                  value={registryAsset.friction}
                  onChange={(e) => setRegistryAsset({ ...registryAsset, friction: e.target.value })}
                  className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Mental_Model (Architectural reasoning)</label>
                <textarea 
                  rows={3}
                  value={registryAsset.mentalModel}
                  onChange={(e) => setRegistryAsset({ ...registryAsset, mentalModel: e.target.value })}
                  className="w-full bg-bg border border-border p-3 font-sans text-sm text-white focus:border-accent outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black py-4 font-mono text-xs font-bold tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Database size={14} />
                EXECUTE: WAREHOUSE ASSET
              </button>
            </form>
          )}
        </div>

        {/* Footer Telemetry */}
        <div className="px-4 py-2 bg-bg border-t border-border flex justify-between font-mono text-[8px] text-muted/50">
          <span>INGEST_READY</span>
          <span>SYSTEM_STABLE</span>
        </div>
      </div>
    </div>
  );
}
