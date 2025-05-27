import { WorkflowStep as WorkflowStepType } from '@/types';
import { useState } from 'react';

interface WorkflowStepProps {
  step: WorkflowStepType;
  isLast: boolean;
}

export default function WorkflowStep({ step, isLast }: WorkflowStepProps) {
  const [showLogs, setShowLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Agent Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${step.agent.color} flex items-center justify-center text-white text-sm`}>
            {step.agent.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{step.agent.name}</h3>
            <p className="text-sm text-gray-600">{step.agent.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${getStatusColor(step.status)}`}>
              {getStatusIcon(step.status)}
            </span>
            <span className={`text-sm font-medium ${getStatusColor(step.status)}`}>
              {getStatusText(step.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Input</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{step.input}</pre>
        </div>
      </div>

      {/* Logs (if running) */}
      {step.status === 'running' && step.logs && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Execution Logs</h4>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showLogs ? 'Hide' : 'Show'}
            </button>
          </div>
          {showLogs && (
            <div className="bg-black rounded-lg p-3 text-green-400 font-mono text-xs">
              {step.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Output */}
      {step.output && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Output Results</h4>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{step.output}</pre>
          </div>
        </div>
      )}

      {/* Connection line to next step */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-px h-6 bg-gray-300"></div>
        </div>
      )}
    </div>
  );
} 