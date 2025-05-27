// 资源类型
export interface Resource {
  id: string;
  type: 'text' | 'document' | 'url' | 'template';
  title: string;
  content: string;
  description?: string;
  icon?: string;
}

// Agent类型
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'analysis' | 'persona' | 'story' | 'acceptance' | 'priority' | 'quality';
  icon: string;
  inputType: string[];
  outputType: string;
  color: string;
}

// 执行步骤
export interface ExecutionStep {
  id: string;
  agentId: string;
  agentName: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
  logs?: string[];
}

// 工作流状态
export interface WorkflowState {
  currentInput: string;
  selectedResource?: Resource;
  selectedAgent?: Agent;
  executionSteps: ExecutionStep[];
  isRunning: boolean;
} 