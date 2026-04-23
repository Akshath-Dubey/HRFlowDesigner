import React from "react";
import { Handle, Position } from "reactflow";
import { LucideIcon } from "lucide-react";

interface BaseNodeProps {
  title: string;
  icon: LucideIcon;
  color: string;
  selected?: boolean;
  children?: React.ReactNode;
  showTarget?: boolean;
  showSource?: boolean;
  customHandles?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  icon: Icon,
  color,
  selected,
  children,
  showTarget = true,
  showSource = true,
  customHandles,
}) => {
  return (
    <div
      className={`min-w-[200px] bg-bg-card rounded-xl border p-4 transition-all ${
        selected
          ? "border-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/20 scale-105"
          : "border-border-subtle hover:border-text-muted"
      }`}
    >
      {showTarget && !customHandles && (
        <Handle
          type="target"
          position={Position.Top}
          className="react-flow__handle"
        />
      )}

      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={18} />
        </div>
        <span className="font-semibold text-white text-sm tracking-tight truncate">
          {title}
        </span>
      </div>

      <div className="text-[12px] text-text-dim leading-relaxed">
        {children}
      </div>

      {customHandles}

      {showSource && !customHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="react-flow__handle"
        />
      )}
    </div>
  );
};
