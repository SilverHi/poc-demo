'use client';

import { useState, useEffect } from 'react';
import { ExecutionStep as ExecutionStepType } from '@/types';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface ExecutionStepProps {
  step: ExecutionStepType;
  isLatest?: boolean;
}

export default function ExecutionStep({ step, isLatest = false }: ExecutionStepProps) {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    setFormattedTime(step.timestamp.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  }, [step.timestamp]);
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };



  return (
    <div className={`execution-step ${isLatest ? 'latest' : ''} ${
      step.status === 'running' ? 'status-running' :
      step.status === 'completed' ? 'status-completed' :
      step.status === 'error' ? 'status-error' : ''
    }`}>
      {/* 步骤头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <h3 className="font-bold text-white text-lg">{step.agentName}</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">
          {formattedTime}
        </span>
      </div>

      {/* 输入内容 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>输入内容</span>
        </h4>
        <div className="bg-gray-800 bg-opacity-60 p-4 rounded-xl border border-gray-700 text-sm text-gray-300 leading-relaxed">
          {step.input.length > 250 ? `${step.input.substring(0, 250)}...` : step.input}
        </div>
      </div>

      {/* 执行日志 */}
      {step.status === 'running' && step.logs && step.logs.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>执行日志</span>
          </h4>
          <div className="code-block max-h-32 overflow-y-auto custom-scrollbar">
            {step.logs.map((log, index) => (
              <div key={index} className="text-green-400">
                <span className="text-gray-500">[{index + 1}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 输出结果 */}
      {step.output && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>处理结果</span>
          </h4>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-xl border border-gray-700 text-sm text-gray-200 leading-relaxed markdown-content">
            {step.output.length > 400 ? `${step.output.substring(0, 400)}...` : step.output}
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {step.status === 'error' && (
        <div className="mt-4">
          <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>执行失败，请检查输入内容或重试</span>
          </div>
        </div>
      )}
    </div>
  );
} 