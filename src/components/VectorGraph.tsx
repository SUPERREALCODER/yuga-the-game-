import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Activity, Terminal, Zap, Info } from 'lucide-react';

const initialNodes: Node[] = [
  { id: 'n1', position: { x: 50, y: 150 }, data: { label: 'Innovatia (Swampert)' } },
  { id: 'n2', position: { x: 300, y: 50 }, data: { label: 'Bodhon Agency Config' } },
  { id: 'n3', position: { x: 100, y: 350 }, data: { label: 'Switched-Capacitor Charging' } },
  { id: 'n4', position: { x: 350, y: 250 }, data: { label: 'OttoMail Architecture' } },
  { id: 'n5', position: { x: 600, y: 200 }, data: { label: 'GATE DA: Applied Math' } }
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: 'n1', target: 'n3', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e2-4', source: 'n2', target: 'n4', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e4-5', source: 'n4', target: 'n5', animated: true, style: { stroke: '#06b6d4' } }
];

const nodePayloads: Record<string, any> = {
  'n4': { 
    title: 'OttoMail', 
    the_build: 'Local AI email copilot using Llama 3.', 
    friction_log: 'IMAP rate limits. Solved via batching/sleep buffer.', 
    forward_vectors: 'Reuse batch logic for scraping in solo AI bounties.',
    mental_model: {
      scenario: "Continuous data fetching triggered server lockouts.",
      thought_process: "If I hit the server at machine speed, anti-bot mechanisms trigger. I need to mimic human latency to keep the pipeline open.",
      execution: "Added a 2s sleep buffer between IMAP batch fetches."
    }
  },
  'n1': { title: 'Innovatia (Swampert)', the_build: 'Amphibious vehicle prototype.', friction_log: 'Hardware/motor calibration.', forward_vectors: 'Physical integration baseline.' },
  'n2': { title: 'Bodhon Agency Config', the_build: 'Client delivery infrastructure.', friction_log: 'Scope creep.', forward_vectors: 'Modular templates.' },
  'n3': { title: 'Switched-Capacitor', the_build: 'Solar battery circuit.', friction_log: 'MOSFET switching losses.', forward_vectors: 'Power efficiency logic.' },
  'n5': { title: 'GATE DA: Math', the_build: 'Matrix transformations.', friction_log: 'High-dimensional visualization.', forward_vectors: 'Underlying logic for LLM weights.' }
};

export default function VectorGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedPayload = selectedNodeId ? nodePayloads[selectedNodeId] : null;

  return (
    <div className="flex h-full w-full bg-bg overflow-hidden border border-border">
      {/* ReactFlow Canvas (70%) */}
      <div className="w-[70%] h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          style={{ background: '#0A0A0A' }}
        >
          <Background color="#262626" gap={20} variant={BackgroundVariant.Lines} />
          <Controls className="bg-surface border border-border fill-white" />
          <MiniMap 
            style={{ background: '#171717' }} 
            nodeColor="#262626"
            maskColor="rgba(0, 0, 0, 0.5)"
          />
        </ReactFlow>
      </div>

      {/* Node Telemetry Panel (30%) */}
      <div className="w-[30%] h-full bg-surface border-l border-border flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Activity size={16} className="text-accent" />
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase">Node_Telemetry</h3>
        </div>

        {selectedPayload ? (
          <div className="p-6 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-muted" />
                <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Title</h4>
              </div>
              <p className="text-lg font-bold tracking-tight">{selectedPayload.title}</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-muted" />
                <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">The_Build</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed font-mono">
                {selectedPayload.the_build}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={14} className="text-muted" />
                <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Friction_Log</h4>
              </div>
              <div className="bg-bg p-4 border border-border">
                <p className="text-xs font-mono text-muted leading-relaxed">
                  {selectedPayload.friction_log}
                </p>
              </div>
            </section>

            {selectedPayload.mental_model && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={14} className="text-muted" />
                  <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">{">_ MENTAL_MODEL"}</h4>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-4">
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase mb-1">SCENARIO</p>
                    <p className="text-xs leading-relaxed">{selectedPayload.mental_model.scenario}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase mb-1">THOUGHT_PROCESS</p>
                    <p className="text-xs leading-relaxed">{selectedPayload.mental_model.thought_process}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase mb-1">EXECUTION</p>
                    <p className="text-xs leading-relaxed">{selectedPayload.mental_model.execution}</p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-muted" />
                <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Forward_Vectors</h4>
              </div>
              <p className="text-sm text-accent font-mono leading-relaxed">
                {selectedPayload.forward_vectors}
              </p>
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
            <Activity size={48} className="mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-widest">Select_Node_To_Initialize_Stream</p>
          </div>
        )}

        <div className="mt-auto p-4 border-t border-border bg-bg/50">
          <div className="flex justify-between font-mono text-[8px] text-muted">
            <span>STATUS: READY</span>
            <span>PORT: 3000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
