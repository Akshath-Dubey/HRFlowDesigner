import React, { useCallback, useRef, useState, useEffect } from "react";
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

  // Tour state
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("tourSeen");
    if (!seen) {
      setShowTour(true);
    }
  }, []);

  const tourSteps = [
    {
      target: ".w-64", // Sidebar
      title: "Sidebar - Node Palette",
      desc: "Drag or click HR nodes (Start, Task, Approval, Automated, End) to canvas to build workflow.",
      pos: "right",
    },
    {
      target: ".flex-1.relative", // Canvas div
      title: "Canvas Area",
      desc: "Drop nodes here. Connect bottom handle (out) to top (in).",
      pos: "top",
    },
    {
      target: ".flex.bg-bg-panel", // Undo group
      title: "Undo/Redo",
      desc: "Ctrl+Z undo, Ctrl+Y redo. Auto snapshots on drag.",
      pos: "bottom",
    },
    {
      target: ".flex.gap-2", // Panel with Sandbox
      title: "Simulator",
      desc: "Click to validate (Start/End, connections) and simulate execution.",
      pos: "left",
    },
    {
      target: ".w-80", // ConfigPanel
      title: "Config Panel",
      desc: "Select node to edit title, assignee, actions. Confirm saves.",
      pos: "left",
    },
  ];

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

  const TourOverlay = () => {
    const step = tourSteps[currentStep];
    const targetElement = step.target
      ? (document.querySelector(step.target) as HTMLElement)
      : null;

    const nextStep = () => {
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        localStorage.setItem("tourSeen", "true");
        setShowTour(false);
      }
    };

    const skipTour = () => {
      localStorage.setItem("tourSeen", "true");
      setShowTour(false);
    };

    return (
      <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-8">
        <div className="bg-bg-panel/95 backdrop-blur-sm border border-border-subtle rounded-2xl max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
              {step.title}
            </h3>
            <p className="text-text-dim mb-8 leading-relaxed text-lg">
              {step.desc}
            </p>
            <div className="flex gap-4 justify-end items-center">
              <button
                onClick={skipTour}
                className="px-6 py-2.5 text-sm font-medium text-text-dim hover:text-white bg-bg-card rounded-xl transition-all border border-border-subtle hover:border-primary/50"
              >
                Skip Tour
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                {currentStep === tourSteps.length - 1 ? "Got it!" : "Next →"}
              </button>
            </div>
            <div className="mt-6 flex gap-2 justify-center">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${i === currentStep ? "bg-primary scale-125 shadow-md" : "bg-border-subtle"}`}
                />
              ))}
            </div>
          </div>
        </div>
        {targetElement && (
          <div
            style={{
              position: "absolute",
              top:
                targetElement.getBoundingClientRect().top +
                window.scrollY +
                "px",
              left:
                targetElement.getBoundingClientRect().left +
                window.scrollX +
                "px",
              width: targetElement.offsetWidth + "px",
              height: targetElement.offsetHeight + "px",
              boxShadow: "0 0 0 3px #3b82f6, 0 0 0 6px rgba(59,130,246,0.3)",
              borderRadius: "8px",
              zIndex: 999,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {showTour && <TourOverlay />}
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
    </>
  );
};

export const Canvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasContent />
  </ReactFlowProvider>
);
