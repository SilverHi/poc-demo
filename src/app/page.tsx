'use client';

import { useState, useRef, useEffect } from 'react';
import { InputResource, Agent, WorkflowStep } from '@/types';
import { mockAgents, executeAgent } from '@/data/mockData';
import { StoredResource } from '../../lib/database';
import InputResourceCard from '@/components/InputResourceCard';
import AgentCard from '@/components/AgentCard';
import WorkflowStepComponent from '@/components/WorkflowStep';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Typography, 
  Button, 
  Input, 
  Card, 
  Space, 
  Tag, 
  Empty,
  Avatar
} from 'antd';
import { 
  ToolOutlined, 
  ClearOutlined, 
  UploadOutlined, 
  SearchOutlined,
  RocketOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

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
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div>
          <Title level={2} className="mb-0 text-gray-900">User Story Generator</Title>
          <Text type="secondary" className="text-sm">
            AI Agent-based Intelligent Requirements Analysis and Story Generation Platform
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<ToolOutlined />}
            onClick={() => router.push('/agents')}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Agent Builder
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={clearWorkflow}
          >
            Clear Workflow
          </Button>
        </Space>
      </Header>

      <Layout className="h-[calc(100vh-80px)]">
        {/* Left Sidebar - Input Resources */}
        <Sider width={320} className="bg-white border-r border-gray-200 flex flex-col" theme="light">
          <div className="p-4 border-b border-gray-200">
            <Space className="w-full justify-between mb-2">
              <Title level={4} className="mb-0 text-gray-900">Input Resources</Title>
              <Button
                type="primary"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => router.push('/resources')}
              >
                管理
              </Button>
            </Space>
            <Text type="secondary" className="text-sm">
              Select relevant documents and templates as reference
            </Text>
          </div>
          
          {/* Search Box */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="搜索资源..."
              value={resourceSearchQuery}
              onChange={(e) => setResourceSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredStoredResources.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary">
                      {resourceSearchQuery ? '未找到匹配的资源' : '暂无资源'}
                    </Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {resourceSearchQuery ? '试试其他搜索词' : '点击管理按钮上传文档'}
                    </Text>
                  </div>
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredStoredResources.map(resource => {
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
                })}
              </div>
            )}
          </div>
        </Sider>

        {/* Center - Main Workspace */}
        <Content className="flex flex-col">
          {/* Input Area */}
          <Card className="border-b border-gray-200 rounded-none">
            <div className="mb-4">
              <Text strong className="text-sm text-gray-700 mb-2 block">
                Input Content
              </Text>
              <TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Please enter your requirements description, questions or content to be processed..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            {/* Selected Resources Display */}
            {selectedResources.length > 0 && (
              <div className="mb-4">
                <Text strong className="text-sm text-gray-700 mb-2 block">
                  Selected Reference Resources ({selectedResources.length})
                </Text>
                <Space wrap>
                  {selectedResources.map(resource => (
                    <Tag
                      key={resource.id}
                      closable
                      onClose={() => handleResourceSelect(resource)}
                      color="blue"
                    >
                      {resource.title}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Selected Agent and Execute Button */}
            {selectedAgent && (
              <Card className="bg-blue-50 border-blue-200">
                <Space className="w-full justify-between" align="center">
                  <Space align="center">
                    <Avatar 
                      className={selectedAgent.color}
                      size="large"
                      style={{ 
                        backgroundColor: selectedAgent.color.includes('bg-') ? undefined : selectedAgent.color,
                        color: 'white'
                      }}
                    >
                      {selectedAgent.icon}
                    </Avatar>
                    <div>
                      <Text strong className="text-gray-900">{selectedAgent.name}</Text>
                      <div className="text-sm text-gray-600">{selectedAgent.description}</div>
                    </div>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleExecute}
                    disabled={!canExecute()}
                    loading={isExecuting}
                  >
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </Button>
                </Space>
              </Card>
            )}
          </Card>

          {/* Workflow Area */}
          <div className="flex-1 overflow-y-auto p-6" ref={workflowRef}>
            {workflowSteps.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Empty
                  image={<RocketOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                  description={
                    <div>
                      <Text strong className="text-lg">Start Your AI Workflow</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        Select input resources and Agents, then click execute to start generation
                      </Text>
                    </div>
                  }
                />
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
        </Content>

        {/* Right Sidebar - Agents */}
        <Sider width={320} className="bg-white border-l border-gray-200 flex flex-col" theme="light">
          <div className="p-4 border-b border-gray-200">
            <Title level={4} className="mb-0 text-gray-900">AI Agents</Title>
            <Text type="secondary" className="text-sm">
              Select appropriate Agents to process your content
            </Text>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Built-in Agents */}
            <div className="mb-4">
              <Text strong className="text-sm text-gray-700 mb-2 block">Built-in Agents</Text>
              <div className="space-y-2">
                {mockAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={handleAgentSelect}
                    disabled={isExecuting}
                  />
                ))}
              </div>
            </div>

            {/* Custom Agents */}
            {customAgents.length > 0 && (
              <div>
                <Text strong className="text-sm text-gray-700 mb-2 block">Custom Agents</Text>
                <div className="space-y-2">
                  {customAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}
