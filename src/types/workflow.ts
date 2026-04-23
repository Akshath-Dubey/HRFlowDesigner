
export type NodeType = 'startNode' | 'taskNode' | 'approvalNode' | 'automatedNode' | 'endNode';

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface NodeData {
  label: string;
  // Common fields
  title?: string;
  // Start Node
  metadata?: Record<string, string>;
  // Task Node
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: Record<string, string>;
  // Approval Node
  approverRole?: string;
  threshold?: number;
  // Automated Node
  actionId?: string;
  actionParams?: Record<string, string>;
  // End Node
  endMessage?: string;
  summaryFlag?: boolean;
}

export interface SimulationResult {
  step: number;
  nodeId: string;
  nodeTitle: string;
  status: 'completed' | 'failed' | 'pending';
  message: string;
  timestamp: string;
}
