
import React from 'react';
import { NodeProps } from 'reactflow';
import { Flag } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeData } from '../../types/workflow';

export const EndNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <BaseNode
      title={data.title || "End Workflow"}
      icon={Flag}
      color="#ef4444"
      selected={selected}
      showSource={false}
    >
      <p>{data.endMessage || "Process completed"}</p>
      {data.summaryFlag && (
        <span className="mt-1 text-[10px] text-green-600 font-bold flex items-center gap-1">
          ✓ Export Summary
        </span>
      )}
    </BaseNode>
  );
};
