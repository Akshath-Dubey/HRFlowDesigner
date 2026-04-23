
import React from 'react';
import { NodeProps } from 'reactflow';
import { ClipboardList } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeData } from '../../types/workflow';

export const TaskNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <BaseNode
      title={data.title || "Human Task"}
      icon={ClipboardList}
      color="#3b82f6"
      selected={selected}
    >
      <div className="space-y-1">
        <p className="font-medium text-gray-600">{data.assignee || "Unassigned"}</p>
        <p className="italic text-[10px]">{data.description || "No description provided"}</p>
      </div>
    </BaseNode>
  );
};
