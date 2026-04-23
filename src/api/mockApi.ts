
import { AutomationAction, SimulationResult } from '../types/workflow';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'slack_notify', label: 'Slack Notification', params: ['channel', 'message'] },
  { id: 'webhook', label: 'Trigger Webhook', params: ['url', 'method'] },
];

export const mockApi = {
  getAutomations: async (): Promise<AutomationAction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_AUTOMATIONS), 500);
    });
  },

  simulateWorkflow: async (workflowJson: any): Promise<SimulationResult[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { nodes, edges } = workflowJson;
        const results: SimulationResult[] = [];
        const visited = new Set<string>();
        
        let currentNode = nodes.find((n: any) => n.type === 'startNode');
        let step = 1;

        while (currentNode && !visited.has(currentNode.id)) {
          visited.add(currentNode.id);
          
          results.push({
            step: step++,
            nodeId: currentNode.id,
            nodeTitle: currentNode.data.title || currentNode.data.label || 'Untitled Step',
            status: 'completed',
            message: `Successfully executed ${currentNode.type} logic.`,
            timestamp: new Date().toISOString(),
          });

          if (currentNode.type === 'endNode') break;

          // Find next node
          const outgoingEdges = edges.filter((e: any) => e.source === currentNode?.id);
          
          if (outgoingEdges.length === 0) break;

          let selectedEdge = outgoingEdges[0];

          // If it's an approval node, try to follow "approved" path by default in simulation
          if (currentNode.type === 'approvalNode') {
            const approvedEdge = outgoingEdges.find((e: any) => e.sourceHandle === 'approved');
            if (approvedEdge) selectedEdge = approvedEdge;
          }

          currentNode = nodes.find((n: any) => n.id === selectedEdge.target);
        }

        resolve(results);
      }, 1500);
    });
  }
};
