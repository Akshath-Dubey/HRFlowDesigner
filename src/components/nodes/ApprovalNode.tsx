import React from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { ShieldCheck } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { NodeData } from "../../types/workflow";

export const ApprovalNode: React.FC<NodeProps<NodeData>> = ({
  data,
  selected,
}) => {
  return (
    <BaseNode
      title={data.title || "Approval Step"}
      icon={ShieldCheck}
      color="#f59e0b"
      selected={selected}
      customHandles={
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="react-flow__handle"
          />
          <div className="flex justify-between mt-4 -mx-4 px-4 pb-1">
            <div className="relative group/handle">
              <Handle
                type="source"
                position={Position.Bottom}
                id="approved"
                style={{ left: "25%" }}
                className="react-flow__handle !bg-emerald-500"
              />
              <span className="absolute top-4 left-0 text-[8px] font-bold text-emerald-500 uppercase">
                Approved
              </span>
            </div>
            <div className="relative group/handle">
              <Handle
                type="source"
                position={Position.Bottom}
                id="rejected"
                style={{ left: "75%" }}
                className="react-flow__handle !bg-red-500"
              />
              <span className="absolute top-4 right-0 text-[8px] font-bold text-red-500 uppercase text-right">
                Rejected
              </span>
            </div>
          </div>
        </>
      }
    >
      <div className="space-y-2">
        <p className="font-medium text-text-muted font-mono text-[9px] uppercase tracking-wider">
          ROLE: {data.approverRole || "N/A"}
        </p>
        <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
          <div
            className="bg-amber-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${(data.threshold || 0) * 10}%` }}
          />
        </div>
      </div>
    </BaseNode>
  );
};
