# HR Workflow Designer Module

A visual, interactive workflow builder for HR administrators to design and simulate internal processes.

##  Features

- **Drag-and-Drop Canvas**: Built with React Flow for high-performance visual graph editing.
- **Custom Node Types**: 5 specialized HR-focused nodes (Start, Task, Approval, Automated, End).
- **Dynamic Configuration**: A reactive properties panel that updates node logic in real-time.
- **State Management**: Centralized store using Zustand for predictable graph transitions.
- **Workflow Simulator**: A sandbox panel that validates the graph structure and simulates execution via a mock API.
- **Type-Safe Architecture**: Full TypeScript implementation for robust development.

##  Architecture

### 1. Folder Structure

- `/src/components`: UI components decomposed into Canvas, Editor parts, and Custom Nodes.
- `/src/store`: Zustand store managing the global state of nodes and edges.
- `/src/api`: Mock API service layer for automation actions and simulation.
- `/src/types`: Centralized TypeScript interfaces for domain models.

### 2. Design Choices

- **React Flow**: Chosen for its robust handle/edge management and extensibility for custom node designs.
- **Zustand**: Selected over Redux for its simplicity and excellent performance with React Flow's frequent update cycles.
- **Tailwind CSS**: Used for all styling to maintain a modern, responsive "Elite Clean" aesthetic.
- **Modularity**: Every node type is a separate component, making it easy to extend with new step types (e.g., "AI Decision Node").

### 3. Workflow Validation

The simulator implements basic graph theory validation:

- **Existence**: Must have exactly one Start Node and at least one End Node.
- **Connectivity**: Identifies orphaned nodes not connected to the main flow.
- **Simulation**: Uses a mock time-delayed API to provide a realistic "execution" experience.

##  How to Use

1. **Drag** components from the left sidebar onto the canvas.
2. **Connect** nodes by dragging from a source (bottom point) to a target (top point).
3. **Select** any node to open the Configuration Panel on the right.
4. **Edit** titles, assignees, or automated actions.
5. **Click "Run Simulator"** to test your designed workflow for structural integrity.

##  Future Improvements

// Final updates integrated - tour + git hook

- **Persistence**: Integration with Firestore for saving/loading drafts.
- **Undo/Redo**: Implementation of history patches in the Zustand store.
- **Edge Logic**: Conditional branching based on task outcomes (e.g., "If Approved" -> Path A).
- **Collaboration**: Real-time multi-user editing using WebSockets/Yjs.
  
