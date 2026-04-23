
import React from 'react';
import { NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeData } from '../../types/workflow';

export const StartNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <BaseNode
      title={data.title || "Start Workflow"}
      icon={Play}
      color="#10b981"
      selected={selected}
      showTarget={false}
    >
      <p>Entry point for the HR process</p>
    </BaseNode>
  );
};
