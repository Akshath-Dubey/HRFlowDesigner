
import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { mockApi } from '../../api/mockApi';
import { AutomationAction } from '../../types/workflow';
import { X, Trash2, Plus } from 'lucide-react';

export const ConfigPanel: React.FC = () => {
  const { selectedNode, updateNodeData, deleteNode, setSelectedNode } = useWorkflowStore();
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [showAddField, setShowAddField] = useState<'metadata' | 'customFields' | 'actionParams' | null>(null);

  useEffect(() => {
    mockApi.getAutomations().then(setAutomations);
  }, []);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateNodeData(id, { [name]: value });
  };

  const handleCustomFieldChange = (key: string, value: string, fieldType: 'metadata' | 'customFields' | 'actionParams') => {
    const currentFields = (data as any)[fieldType] || {};
    updateNodeData(id, { [fieldType]: { ...currentFields, [key]: value } });
  };

  const addField = (fieldType: 'metadata' | 'customFields' | 'actionParams') => {
    if (newFieldName) {
      handleCustomFieldChange(newFieldName, "", fieldType);
      setNewFieldName("");
      setShowAddField(null);
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'startNode':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Workflow Title</label>
              <input 
                name="title" 
                value={data.title || ''} 
                onChange={handleChange}
                className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg focus:border-primary outline-none text-sm text-text-main"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Metadata</label>
                <button onClick={() => setShowAddField(showAddField === 'metadata' ? null : 'metadata')} className="text-primary hover:bg-primary/10 p-1.5 rounded-full"><Plus size={14}/></button>
              </div>
              
              {showAddField === 'metadata' && (
                <div className="flex gap-2 mb-2 p-2 bg-bg-deep rounded border border-primary/30">
                  <input 
                    placeholder="Key name..." 
                    className="flex-1 bg-transparent text-xs outline-none"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                  <button onClick={() => addField('metadata')} className="text-[10px] font-bold text-primary">ADD</button>
                </div>
              )}

              {Object.entries(data.metadata || {}).map(([key, val]) => (
                <div key={key} className="flex gap-2">
                  <div className="bg-bg-deep p-2 text-[10px] rounded border border-border-subtle flex-1 truncate text-text-muted font-mono">{key}</div>
                  <input 
                    value={val} 
                    onChange={(e) => handleCustomFieldChange(key, e.target.value, 'metadata')}
                    className="flex-1 p-2 bg-bg-deep border border-border-subtle rounded-lg text-sm text-text-main outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'taskNode':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Task Name</label>
              <input name="title" value={data.title || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Assignee</label>
              <input name="assignee" value={data.assignee || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm" placeholder="Enter name or role"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Description</label>
              <textarea name="description" value={data.description || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg min-h-[100px] outline-none focus:border-primary text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Due Date</label>
              <input type="date" name="dueDate" value={data.dueDate || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm invert opacity-80 shrink-0"/>
            </div>
          </div>
        );

      case 'approvalNode':
        return (
          <div className="space-y-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Step Title</label>
              <input name="title" value={data.title || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Approver Role</label>
              <select name="approverRole" value={data.approverRole || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm text-text-main">
                <option value="">Select Role...</option>
                <option value="Manager">Manager</option>
                <option value="HRBP">HRBP</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Approval Threshold (%)</label>
              <input type="range" min="1" max="10" name="threshold" value={data.threshold || 5} onChange={(e) => updateNodeData(id, { threshold: parseInt(e.target.value) })} className="w-full accent-primary h-1 bg-bg-deep rounded-lg"/>
              <div className="text-center font-mono text-xl text-primary mt-2">{(data.threshold || 5) * 10}%</div>
            </div>
          </div>
        );

      case 'automatedNode':
        const selectedAction = automations.find(a => a.id === data.actionId);
        return (
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Action Title</label>
              <input name="title" value={data.title || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Automation</label>
              <select 
                name="actionId" 
                value={data.actionId || ''} 
                onChange={(e) => {
                   handleChange(e);
                   updateNodeData(id, { actionParams: {} }); // Reset params
                }} 
                className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm text-text-main"
              >
                <option value="">Choose an action...</option>
                {automations.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            {selectedAction && (
              <div className="space-y-4 border-t border-border-subtle pt-4">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Action Parameters</label>
                {selectedAction.params.map(param => (
                   <div key={param} className="space-y-1">
                     <label className="text-xs font-medium text-text-muted capitalize">{param}</label>
                     <input 
                      value={(data.actionParams || {})[param] || ''} 
                      onChange={(e) => handleCustomFieldChange(param, e.target.value, 'actionParams')}
                      className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm"
                     />
                   </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'endNode':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">End Message</label>
              <textarea name="endMessage" value={data.endMessage || ''} onChange={handleChange} className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg outline-none focus:border-primary text-sm min-h-[80px]"/>
            </div>
            <div className="flex items-center justify-between p-4 bg-bg-deep rounded-lg border border-border-subtle">
              <span className="text-sm font-medium text-text-dim">Generate Summary Report</span>
              <input 
                type="checkbox" 
                checked={data.summaryFlag || false} 
                onChange={(e) => updateNodeData(id, { summaryFlag: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>
        );

      default:
        return <p>No configuration available for this type.</p>;
    }
  };

  return (
    <div className="w-80 border-l border-border-subtle bg-bg-panel shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-panel">
        <div>
          <h3 className="text-lg font-light text-white tracking-tight">Configuration</h3>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">{id}</p>
        </div>
        <button className="text-text-muted hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-400/10" title="Delete Step" onClick={() => deleteNode(id)}>
          <Trash2 size={18}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {renderFields()}
      </div>

      <div className="p-6 border-t border-border-subtle bg-bg-panel">
        <button 
          onClick={() => setSelectedNode(null)}
          className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
        >
          Confirm Changes
        </button>
      </div>
    </div>
  );
};
