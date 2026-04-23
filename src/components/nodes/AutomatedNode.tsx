
import React from 'react';
import { NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeData } from '../../types/workflow';

export const AutomatedNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <BaseNode
      title={data.title || "Automated Step"}
      icon={Zap}
      color="#8b5cf6"
      selected={selected}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded self-start">
          {data.actionId || "Select Action..."}
        </span>
      </div>
    </BaseNode>
  );
};
