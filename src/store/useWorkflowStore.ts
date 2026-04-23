
import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { NodeData } from '../types/workflow';

interface HistoryItem {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

interface WorkflowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  past: HistoryItem[];
  future: HistoryItem[];
  selectedNode: Node<NodeData> | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  setSelectedNode: (node: Node | null) => void;
  addNode: (node: Node<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  selectedNode: null,

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    // Only take snapshot if it's different from the last one to avoid duplicates
    const lastSnapshot = past[past.length - 1];
    if (lastSnapshot && 
        JSON.stringify(lastSnapshot.nodes) === JSON.stringify(nodes) && 
        JSON.stringify(lastSnapshot.edges) === JSON.stringify(edges)) {
      return;
    }

    set({
      past: [...past.slice(-19), { nodes, edges }], // Keep last 20 steps
      future: [],
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    // We don't take a snapshot on every change because position updates are very frequent.
    // Snapshots are taken on structural changes or via takeSnapshot.
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().takeSnapshot();
    const edge: Edge = {
      ...connection,
      id: `e-${Date.now()}`,
      label: connection.sourceHandle ? connection.sourceHandle.charAt(0).toUpperCase() + connection.sourceHandle.slice(1) : undefined,
      labelStyle: { fill: '#a3a3a3', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#121212', fillOpacity: 0.8 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    };
    set({
      edges: addEdge(edge, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  setSelectedNode: (node) => set({ selectedNode: node as Node<NodeData> | null }),

  updateNodeData: (nodeId, data) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });

    // Sync selected node if it's the one being updated
    const selected = get().selectedNode;
    if (selected && selected.id === nodeId) {
      set({ selectedNode: { ...selected, data: { ...selected.data, ...data } } });
    }
  },

  addNode: (node) => {
    get().takeSnapshot();
    set({ nodes: [...get().nodes, node] });
  },

  deleteNode: (nodeId) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future].slice(0, 20),
      selectedNode: null,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }].slice(-20),
      future: newFuture,
      selectedNode: null,
    });
  },
}));
