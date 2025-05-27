'use client';

import { useState, useRef, useEffect } from 'react';
import { InputResource, Agent, WorkflowStep } from '@/types';
import { mockAgents, executeAgent } from '@/data/mockData';
import { StoredResource } from '../../lib/database';
import InputResourceCard from '@/components/InputResourceCard';
import AgentCard from '@/components/AgentCard';
import WorkflowStepComponent from '@/components/WorkflowStep';
import { useRouter } from 'next/navigation';

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const router = useRouter();
  const [selectedResources, setSelectedResources] = useState<InputResource[]>([]);
  const [userInput, setUserInput] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [storedResources, setStoredResources] = useState<StoredResource[]>([]);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [filteredStoredResources, setFilteredStoredResources] = useState<StoredResource[]>([]);
  
  const workflowRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest workflow step
  useEffect(() => {
    if (workflowRef.current && workflowSteps.length > 0) {
      workflowRef.current.scrollTop = workflowRef.current.scrollHeight;
    }
  }, [workflowSteps]);

  // Fetch custom agents and resources on component mount
  useEffect(() => {
    fetchCustomAgents();
    fetchStoredResources();
  }, []);

  // Filter resources based on search query
  useEffect(() => {
    if (resourceSearchQuery.trim()) {
      const filtered = storedResources.filter(resource =>
        resource.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
        resource.parsedContent.toLowerCase().includes(resourceSearchQuery.toLowerCase())
      );
      setFilteredStoredResources(filtered);
    } else {
      setFilteredStoredResources(storedResources);
    }
  }, [resourceSearchQuery, storedResources]);



  const fetchCustomAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setCustomAgents(data);
      }
    } catch (error) {
      console.error('Error fetching custom agents:', error);
    }
  };

  const fetchStoredResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setStoredResources(data);
      }
    } catch (error) {
      console.error('Error fetching stored resources:', error);
    }
  };

  const handleResourceSelect = (resource: InputResource) => {
    setSelectedResources(prev => {
      const isSelected = prev.some(r => r.id === resource.id);
      if (isSelected) {
        return prev.filter(r => r.id !== resource.id);
      } else {
        return [...prev, resource];
      }
    });
  };

  const handleAgentSelect = (agent: Agent) => {
    if (isExecuting) return;
    setSelectedAgent(agent);
  };

  const getInputContent = () => {
    let content = userInput;
    if (selectedResources.length > 0) {
      const resourceContent = selectedResources.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
      content = content ? `${content}\n\nReference Resources:\n${resourceContent}` : resourceContent;
    }
    return content;
  };

  const canExecute = () => {
    return selectedAgent && (userInput.trim() || selectedResources.length > 0) && !isExecuting;
  };

  const executeCustomAgent = async (agentId: string, input: string): Promise<{ output: string; logs: string[] }> => {
    try {
      const response = await fetch(`/api/agents/${agentId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute agent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing custom agent:', error);
      throw error;
    }
  };

  const handleExecute = async () => {
    if (!canExecute() || !selectedAgent) return;

    setIsExecuting(true);
    const inputContent = getInputContent();
    
    // Create new workflow step
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      agent: selectedAgent,
      input: inputContent,
      status: 'running',
      logs: []
    };

    setWorkflowSteps(prev => [...prev, newStep]);
    setSelectedAgent(null);

    try {
      // Simulate log updates during execution
      const logInterval = setInterval(() => {
        setWorkflowSteps(prev => prev.map(step => {
          if (step.id === newStep.id && step.status === 'running') {
            const logs = [
              `Starting ${step.agent.name}...`,
              'Analyzing input content...',
              'Applying processing logic...',
              'Generating output results...'
            ];
            return { ...step, logs: logs.slice(0, Math.min(logs.length, (step.logs?.length || 0) + 1)) };
          }
          return step;
        }));
      }, 800);

      let result;
      
      // Check if it's a custom agent or mock agent
      const isCustomAgent = customAgents.some(agent => agent.id === selectedAgent.id);
      
      if (isCustomAgent) {
        // Execute custom agent via API
        result = await executeCustomAgent(selectedAgent.id, inputContent);
      } else {
        // Execute mock agent
        result = await executeAgent(selectedAgent.id, inputContent);
      }
      
      clearInterval(logInterval);

      // Update step status
      setWorkflowSteps(prev => prev.map(step => {
        if (step.id === newStep.id) {
          return {
            ...step,
            status: 'completed' as const,
            output: result.output,
            logs: result.logs
          };
        }
        return step;
      }));

      // Set output as next input
      setUserInput(result.output);
      
    } catch (error) {
      setWorkflowSteps(prev => prev.map(step => {
        if (step.id === newStep.id) {
          return { 
            ...step, 
            status: 'error' as const,
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
        return step;
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const clearWorkflow = () => {
    setWorkflowSteps([]);
    setUserInput('');
    setSelectedResources([]);
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Story Generator</h1>
            <p className="text-sm text-gray-600">AI Agent-based Intelligent Requirements Analysis and Story Generation Platform</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/agents')}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              🛠️ Agent Builder
            </button>
            <button
              onClick={clearWorkflow}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Workflow
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Input Resources */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Input Resources</h2>
              <button
                onClick={() => router.push('/resources')}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                📤 管理
              </button>
            </div>
            <p className="text-sm text-gray-600">Select relevant documents and templates as reference</p>
          </div>
          
          {/* Search Box */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索资源..."
                value={resourceSearchQuery}
                onChange={(e) => setResourceSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">🔍</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredStoredResources.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">📚</div>
                <p className="text-sm text-gray-500">
                  {resourceSearchQuery ? '未找到匹配的资源' : '暂无资源'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {resourceSearchQuery ? '试试其他搜索词' : '点击管理按钮上传文档'}
                </p>
              </div>
            ) : (
              filteredStoredResources.map(resource => {
                const inputResource: InputResource = {
                  id: resource.id,
                  title: resource.title,
                  type: resource.type === 'pdf' ? 'pdf' : resource.type === 'md' ? 'md' : 'text',
                  content: resource.parsedContent,
                  description: resource.description
                };
                return (
                  <InputResourceCard
                    key={resource.id}
                    resource={inputResource}
                    isSelected={selectedResources.some(r => r.id === resource.id)}
                    onSelect={handleResourceSelect}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Center - Main Workspace */}
        <div className="flex-1 flex flex-col">
          {/* Input Area */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Content
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Please enter your requirements description, questions or content to be processed..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            
            {/* Selected Resources Display */}
            {selectedResources.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Reference Resources ({selectedResources.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedResources.map(resource => (
                    <span
                      key={resource.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {resource.title}
                      <button
                        onClick={() => handleResourceSelect(resource)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Agent and Execute Button */}
            {selectedAgent && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg ${selectedAgent.color} flex items-center justify-center text-white text-sm`}>
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedAgent.name}</h3>
                    <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={!canExecute()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    canExecute()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </button>
              </div>
            )}
          </div>

          {/* Workflow Area */}
          <div className="flex-1 overflow-y-auto p-6" ref={workflowRef}>
            {workflowSteps.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-lg font-medium">Start Your AI Workflow</p>
                  <p className="text-sm">Select input resources and Agents, then click execute to start generation</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <WorkflowStepComponent
                    key={step.id}
                    step={step}
                    isLast={index === workflowSteps.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Agents */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
            <p className="text-sm text-gray-600">Select appropriate Agents to process your content</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Built-in Agents */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Built-in Agents</h3>
              {mockAgents.map(agent => (
                <div key={agent.id} className="mb-2">
                  <AgentCard
                    agent={agent}
                    onSelect={handleAgentSelect}
                    disabled={isExecuting}
                  />
                </div>
              ))}
            </div>

            {/* Custom Agents */}
            {customAgents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Agents</h3>
                {customAgents.map(agent => (
                  <div key={agent.id} className="mb-2">
                    <AgentCard
                      agent={{
                        id: agent.id,
                        name: agent.name,
                        description: agent.description,
                        icon: agent.icon,
                        category: agent.category as 'analysis' | 'validation' | 'generation' | 'optimization',
                        color: agent.color,
                      }}
                      onSelect={handleAgentSelect}
                      disabled={isExecuting}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
