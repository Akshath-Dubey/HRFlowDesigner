
import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { mockApi } from '../../api/mockApi';
import { SimulationResult } from '../../types/workflow';
import { PlayCircle, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Sandbox: React.FC = () => {
  const { nodes, edges } = useWorkflowStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateWorkflow = async () => {
    const errs: string[] = [];
    const hasStart = nodes.some(n => n.type === 'startNode');
    const hasEnd = nodes.some(n => n.type === 'endNode');

    if (!hasStart) errs.push("- Workflow must have a Start Node.");
    if (!hasEnd) errs.push("- Workflow must have an End Node.");
    
    const automations = await mockApi.getAutomations();

    // Check individual nodes
    nodes.forEach(node => {
        const isConnected = edges.some(e => e.source === node.id || e.target === node.id);
        if (!isConnected && nodes.length > 1) {
            errs.push(`- Step "${node.data.title || node.id}" is not connected to the flow.`);
        }

        if (node.type === 'approvalNode') {
          if (!node.data.approverRole) {
            errs.push(`- Approval step "${node.data.title || node.id}" is missing an approver role.`);
          }
          if (node.data.threshold === undefined || node.data.threshold <= 0) {
            errs.push(`- Approval step "${node.data.title || node.id}" must have a valid approval threshold.`);
          }
        }

        if (node.type === 'automatedNode') {
          if (!node.data.actionId) {
            errs.push(`- Automated step "${node.data.title || node.id}" has no action selected.`);
          } else {
            const action = automations.find(a => a.id === node.data.actionId);
            if (action) {
              const missingParams = action.params.filter(p => !node.data.actionParams?.[p]);
              if (missingParams.length > 0) {
                errs.push(`- Automated step "${node.data.title || node.id}" is missing parameters: ${missingParams.join(', ')}.`);
              }
            }
          }
        }

        if (node.type === 'taskNode' && !node.data.title) {
          errs.push(`- Task step "${node.id}" is missing a title.`);
        }
    });

    return errs;
  };

  const handleSimulate = async () => {
    setLoading(true);
    const validationErrors = await validateWorkflow();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsOpen(true);
      setLoading(false);
      return;
    }

    setErrors([]);
    setIsOpen(true);
    
    const workflowJson = { nodes, edges };
    try {
      const simulationResults = await mockApi.simulateWorkflow(workflowJson);
      setResults(simulationResults);
    } catch (e) {
      setErrors(["Simulation failed to start. Please check connectivity."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSimulate}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95"
      >
        <PlayCircle size={18} />
        Run Simulator
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border-subtle rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-panel">
              <div>
                <h3 className="text-xl font-light text-white tracking-tight">Execution Sandbox</h3>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Real-time workflow simulation</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-bg-card text-text-muted hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-3 text-sm">
                    <AlertCircle size={18}/>
                    VALIDATION ERRORS DETECTED
                  </div>
                  <div className="space-y-2">
                    {errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-200/70 font-medium">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <Loader2 size={40} className="text-primary animate-spin" />
                  <p className="text-text-muted uppercase text-xs tracking-widest animate-pulse">Running logic synthesis...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                  {results.map((res, i) => (
                    <div key={res.nodeId} className="relative flex items-center gap-6 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-panel shadow shadow-black z-10 shrink-0 ${res.status === 'completed' ? 'bg-primary text-white' : 'bg-bg-card text-muted'}`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="bg-bg-card border border-border-subtle rounded-xl p-5 flex-1 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white tracking-tight">{res.nodeTitle}</h4>
                          <span className="text-[10px] text-text-muted font-mono bg-bg-deep px-2 py-0.5 rounded border border-border-subtle">{res.timestamp.split('T')[1].slice(0, 8)}</span>
                        </div>
                        <p className="text-sm text-text-dim lowercase tracking-tight">{res.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !errors.length && <p className="text-center text-text-muted py-20 italic">Initialize simulation to view results...</p>
              )}
            </div>

            <div className="p-6 border-t border-border-subtle bg-bg-panel flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-8 py-3 bg-white text-bg-deep rounded-lg font-bold hover:bg-text-main transition-colors active:scale-95"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
