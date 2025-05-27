'use client';

import { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  disabled?: boolean;
}

export default function AgentCard({ agent, isSelected, onSelect, disabled = false }: AgentCardProps) {
  const getAgentGradient = (type: string) => {
    switch (type) {
      case 'analysis': return 'from-blue-500 to-blue-600';
      case 'persona': return 'from-green-500 to-green-600';
      case 'story': return 'from-purple-500 to-purple-600';
      case 'acceptance': return 'from-orange-500 to-orange-600';
      case 'priority': return 'from-yellow-500 to-yellow-600';
      case 'quality': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div
      className={`agent-card ${isSelected ? 'selected' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(agent)}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAgentGradient(agent.type)} flex items-center justify-center text-white text-lg shadow-lg`}>
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-2">
            {agent.name}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {agent.description}
          </p>
          <div className="mt-3">
            <span className="modern-badge badge-accent">
              {agent.type}
            </span>
          </div>
        </div>
      </div>
      
      {/* 输入输出类型指示 */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start space-x-2">
          <span className="font-medium text-gray-400 min-w-0">输入:</span>
          <div className="flex flex-wrap gap-1">
            {agent.inputType.map((type, index) => (
              <span key={index} className="px-2 py-1 bg-green-900 bg-opacity-40 text-green-300 rounded border border-green-500 border-opacity-30">
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-400">输出:</span>
                      <span className="px-2 py-1 bg-blue-900 bg-opacity-40 text-blue-300 rounded border border-blue-500 border-opacity-30">
            {agent.outputType}
          </span>
        </div>
      </div>
    </div>
  );
} 