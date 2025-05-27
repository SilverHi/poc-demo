export interface InputResource {
  id: string;
  title: string;
  type: 'text' | 'document' | 'template' | 'reference' | 'pdf' | 'md';
  content: string;
  description?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'validation' | 'generation' | 'optimization';
  color: string;
}

export interface WorkflowStep {
  id: string;
  agent: Agent;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  logs?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

// 新增对话链相关类型
export interface ConversationNode {
  id: string;
  type: 'input' | 'output' | 'bubble';
  content: string;
  resources?: InputResource[];
  agent?: Agent;
  status?: 'pending' | 'running' | 'completed' | 'error';
  logs?: string[];
  timestamp: Date;
  // 新增编辑状态
  isEditable?: boolean; // 是否可编辑（当前输入状态）
  isCurrentInput?: boolean; // 是否为当前输入
}

export interface ConversationChain {
  id: string;
  nodes: ConversationNode[];
  createdAt: Date;
  updatedAt: Date;
} 