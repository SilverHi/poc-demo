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