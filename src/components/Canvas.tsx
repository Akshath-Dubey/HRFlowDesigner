import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { useWorkflowStore } from "../store/useWorkflowStore";
import { StartNode } from "./nodes/StartNode";
import { TaskNode } from "./nodes/TaskNode";
import { ApprovalNode } from "./nodes/ApprovalNode";
import { AutomatedNode } from "./nodes/AutomatedNode";
import { EndNode } from "./nodes/EndNode";
import { Sidebar } from "./Editor/Sidebar";
import { ConfigPanel } from "./Editor/ConfigPanel";
import { Sandbox } from "./Editor/Sandbox";
import { NodeType } from "../types/workflow";

const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedNode: AutomatedNode,
  endNode: EndNode,
};

import { Undo2, Redo2 } from "lucide-react";

export const CanvasContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
    undo,
    redo,
    past,
    future,
    takeSnapshot,
  } = useWorkflowStore();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" || (event.shiftKey && event.key === "z"))
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(
        "application/reactflow",
      ) as NodeType;

      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Basic validation: Only one start node
      if (type === "startNode" && nodes.some((n) => n.type === "startNode")) {
        return;
      }

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type}`, title: `New ${type.replace("Node", "")}` },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode, nodes],
  );

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStart={onNodeDragStart}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          fitView
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />

          <Panel position="top-right" className="flex gap-2">
            <div className="flex bg-bg-panel border border-border-subtle rounded-lg p-0.5 shadow-lg">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="p-2 text-text-dim hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-bg-card"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={18} />
              </button>
              <div className="w-px bg-border-subtle my-2" />
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="p-2 text-text-dim hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-bg-card"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={18} />
              </button>
            </div>
            <Sandbox />
          </Panel>
        </ReactFlow>
      </div>

      <ConfigPanel />
    </div>
  );
};

export const Canvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasContent />
  </ReactFlowProvider>
);
