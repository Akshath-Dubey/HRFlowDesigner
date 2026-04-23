
import React from 'react';
import { 
  Play, 
  ClipboardList, 
  ShieldCheck, 
  Zap, 
  Flag 
} from 'lucide-react';
import { NodeType } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const NODE_TEMPLATES = [
  { type: 'startNode' as NodeType, label: 'Start Node', icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { type: 'taskNode' as NodeType, label: 'Task Node', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
  { type: 'approvalNode' as NodeType, label: 'Approval Node', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
  { type: 'automatedNode' as NodeType, label: 'Automated Step', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  { type: 'endNode' as NodeType, label: 'End Node', icon: Flag, color: 'text-red-500', bg: 'bg-red-50' },
];

export const Sidebar: React.FC = () => {
  const { addNode, nodes } = useWorkflowStore();

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClickAdd = (type: NodeType) => {
    if (type === 'startNode' && nodes.some(n => n.type === 'startNode')) return;
    
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250, y: 250 }, // Default center-ish
      data: { label: `${type}`, title: `New ${type.replace('Node', '')}` },
    };
    addNode(newNode);
  };

  return (
    <aside className="w-64 border-r border-border-subtle bg-bg-panel p-6 flex flex-col gap-8 z-10 shadow-lg">
      <div>
        <div className="pill mb-4 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">HR FLOW DESIGNER</div>
        <h2 className="text-2xl font-light text-white mb-1 tracking-tight">Modules</h2>
        <p className="text-xs text-text-dim">Drag or click to architect flow</p>
      </div>

      <div className="space-y-4">
        <div className="label-small uppercase text-[10px]">Components</div>
        {NODE_TEMPLATES.map((node) => (
          <div
            key={node.type}
            className={`flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-bg-card cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group`}
            onDragStart={(event) => onDragStart(event, node.type)}
            onClick={() => handleClickAdd(node.type)}
            draggable
          >
            <div className={`p-2 rounded-md bg-bg-deep shadow-sm transition-transform group-hover:scale-110 ${node.color}`}>
              <node.icon size={18} />
            </div>
            <span className="text-sm font-medium text-text-dim group-hover:text-white transition-colors">{node.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 bg-bg-deep rounded-lg border border-border-subtle">
        <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-wide">
          ARCHITECTURE LOG: SYSTEM READY. SELECT COMPONENT TO BEGIN.
        </p>
      </div>
    </aside>
  );
};
