import { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  disabled?: boolean;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'analysis': return 'Analysis';
    case 'validation': return 'Validation';
    case 'generation': return 'Generation';
    case 'optimization': return 'Optimization';
    default: return category;
  }
};

export default function AgentCard({ agent, onSelect, disabled = false }: AgentCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={() => !disabled && onSelect(agent)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center text-white text-lg`}>
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{agent.name}</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
              {getCategoryLabel(agent.category)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{agent.description}</p>
        </div>
      </div>
    </div>
  );
} 