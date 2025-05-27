'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Play, ChevronUp, ChevronDown } from 'lucide-react';
import { Resource, Agent, ExecutionStep, WorkflowState } from '@/types';
import { mockResources, mockAgents } from '@/data/mockData';
import ResourceCard from '@/components/ResourceCard';
import AgentCard from '@/components/AgentCard';
import ExecutionStepComponent from '@/components/ExecutionStep';

export default function Home() {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentInput: '',
    selectedResource: undefined,
    selectedAgent: undefined,
    executionSteps: [],
    isRunning: false
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 选择资源
  const handleResourceSelect = (resource: Resource) => {
    setWorkflowState(prev => ({
      ...prev,
      selectedResource: prev.selectedResource?.id === resource.id ? undefined : resource,
      currentInput: prev.selectedResource?.id === resource.id ? '' : resource.content
    }));
  };

  // 选择Agent
  const handleAgentSelect = (agent: Agent) => {
    setWorkflowState(prev => ({
      ...prev,
      selectedAgent: prev.selectedAgent?.id === agent.id ? undefined : agent
    }));
  };

  // 输入变化
  const handleInputChange = (value: string) => {
    setWorkflowState(prev => ({
      ...prev,
      currentInput: value
    }));
  };

  // 模拟AI执行
  const simulateExecution = async (step: ExecutionStep) => {
    const logs = [
      '正在初始化AI模型...',
      '解析输入内容...',
      '调用AI服务...',
      '处理返回结果...',
      '格式化输出内容...'
    ];

    // 更新步骤状态为运行中
    setWorkflowState(prev => ({
      ...prev,
      executionSteps: prev.executionSteps.map(s => 
        s.id === step.id ? { ...s, status: 'running' as const, logs: [] } : s
      )
    }));

    // 模拟逐步执行日志
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setWorkflowState(prev => ({
        ...prev,
        executionSteps: prev.executionSteps.map(s => 
          s.id === step.id ? { 
            ...s, 
            logs: [...(s.logs || []), logs[i]]
          } : s
        )
      }));
    }

    // 模拟生成结果
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockOutputs: Record<string, string> = {
      'analysis': `## 需求分析结果

**核心功能点:**
- 商品管理：添加、修改、删除商品
- 数量控制：支持数量调整和批量操作
- 价格计算：实时计算总价和优惠

**用户角色:**
- 主要用户：在线购物的消费者
- 使用场景：浏览商品时临时存储，结算前确认

**业务价值:**
- 提升用户购物体验
- 减少订单放弃率
- 增加平均订单价值`,

      'persona': `## 用户画像

**主要用户角色:**
- **姓名:** 李小美
- **年龄:** 28岁
- **职业:** 白领上班族
- **技能水平:** 熟练使用移动设备和网购

**用户特征:**
- 注重购物效率和便利性
- 习惯对比价格和商品
- 偏好简洁直观的操作界面

**使用场景:**
- 工作间隙浏览商品
- 周末集中购物时间
- 节假日促销活动期间`,

      'story': `## User Stories

**Story 1: 添加商品到购物车**
As a 在线购物用户
I want to 将感兴趣的商品添加到购物车
So that 我可以稍后统一结算和比较

**Story 2: 修改商品数量**
As a 购物车用户
I want to 调整已添加商品的数量
So that 我可以根据需要购买合适的数量

**Story 3: 删除不需要的商品**
As a 购物车用户
I want to 删除不再需要的商品
So that 我的购物车只包含真正想要的商品`,

      'acceptance': `## 验收条件

**Story 1 验收条件:**
- Given 用户在商品详情页
- When 用户点击"加入购物车"按钮
- Then 商品应该被添加到购物车
- And 购物车图标显示商品数量更新

**Story 2 验收条件:**
- Given 用户在购物车页面
- When 用户修改商品数量
- Then 总价应该实时更新
- And 库存不足时显示提示信息

**Story 3 验收条件:**
- Given 用户在购物车页面
- When 用户点击删除按钮
- Then 商品应该从购物车中移除
- And 总价和数量应该重新计算`,

      'priority': `## 优先级评估

**Story 1: 添加商品到购物车**
- 优先级: 高 (P0)
- 复杂度: 中等 (5 story points)
- 业务价值: 核心功能，必须实现

**Story 2: 修改商品数量**
- 优先级: 高 (P0)
- 复杂度: 中等 (3 story points)
- 业务价值: 用户体验关键功能

**Story 3: 删除商品**
- 优先级: 中 (P1)
- 复杂度: 低 (2 story points)
- 业务价值: 基础功能，提升用户体验`,

      'quality': `## 质量检查报告

**整体质量评分: 85/100**

**检查结果:**
✅ User Story格式标准
✅ 验收条件完整
✅ 优先级评估合理
⚠️ 建议补充异常场景处理
⚠️ 建议增加性能要求说明

**改进建议:**
1. 补充网络异常时的处理逻辑
2. 明确大量商品时的性能要求
3. 增加无障碍访问相关需求`
    };

    const output = mockOutputs[step.agentId.split('-')[1]] || '处理完成，生成了相应的输出内容。';

    // 完成执行
    setWorkflowState(prev => ({
      ...prev,
      executionSteps: prev.executionSteps.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: 'completed' as const,
          output
        } : s
      ),
      isRunning: false,
      currentInput: output // 将输出作为下一次的输入
    }));
  };

  // 执行工作流
  const handleExecute = async () => {
    if (!workflowState.selectedAgent || !workflowState.currentInput.trim()) {
      return;
    }

    const newStep: ExecutionStep = {
      id: uuidv4(),
      agentId: workflowState.selectedAgent.id,
      agentName: workflowState.selectedAgent.name,
      input: workflowState.currentInput,
      status: 'pending',
      timestamp: new Date(),
      logs: []
    };

    setWorkflowState(prev => ({
      ...prev,
      executionSteps: [...prev.executionSteps, newStep],
      isRunning: true,
      selectedAgent: undefined // 清除选中的Agent
    }));

    setCurrentStepIndex(workflowState.executionSteps.length);

    // 开始执行
    await simulateExecution(newStep);
  };

  // 滚动到指定步骤
  const scrollToStep = (index: number) => {
    setCurrentStepIndex(index);
    if (scrollContainerRef.current) {
      const stepElements = scrollContainerRef.current.children;
      if (stepElements[index]) {
        stepElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // 检查是否可以执行
  const canExecute = workflowState.selectedAgent && 
                    workflowState.currentInput.trim() && 
                    !workflowState.isRunning;

  return (
    <div className="h-full flex bg-gray-950">
      {/* 左侧资源面板 */}
      <div className="w-80 bg-gray-900 bg-opacity-50 backdrop-blur-xl border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">资源库</h2>
          </div>
          <p className="text-sm text-gray-400">选择预设资源快速开始</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {mockResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isSelected={workflowState.selectedResource?.id === resource.id}
              onSelect={handleResourceSelect}
            />
          ))}
        </div>
      </div>

      {/* 中央工作区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部输入区 */}
        <div className="bg-gray-900 bg-opacity-30 backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">输入内容</h2>
              </div>
              {canExecute && (
                <button
                  onClick={handleExecute}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>开始处理</span>
                </button>
              )}
            </div>
            <textarea
              value={workflowState.currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请输入您的需求内容，或从左侧选择预设资源快速开始..."
              className="modern-input w-full h-32 text-base"
            />
          </div>
        </div>

        {/* 中央执行区域 */}
        <div className="flex-1 flex flex-col">
          {workflowState.executionSteps.length > 0 && (
            <>
              {/* 步骤导航 */}
              <div className="bg-gray-900 bg-opacity-20 backdrop-blur-xl border-b border-gray-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      执行步骤 ({workflowState.executionSteps.length})
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => scrollToStep(Math.max(0, currentStepIndex - 1))}
                      disabled={currentStepIndex === 0}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:bg-gray-800 disabled:hover:text-gray-400 transition-all"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400 font-medium px-3 py-1.5 bg-gray-800 rounded-lg">
                      {currentStepIndex + 1} / {workflowState.executionSteps.length}
                    </span>
                    <button
                      onClick={() => scrollToStep(Math.min(workflowState.executionSteps.length - 1, currentStepIndex + 1))}
                      disabled={currentStepIndex === workflowState.executionSteps.length - 1}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:bg-gray-800 disabled:hover:text-gray-400 transition-all"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 执行步骤列表 */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {workflowState.executionSteps.map((step, index) => (
                    <div key={step.id} className="animate-fade-in-up">
                      <ExecutionStepComponent
                        step={step}
                        isLatest={index === workflowState.executionSteps.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {workflowState.executionSteps.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">准备开始AI工作流</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  从左侧选择资源，右侧选择Agent，然后点击&quot;开始处理&quot;按钮启动智能分析流程
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>选择资源</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>选择Agent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>开始处理</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧Agent面板 */}
      <div className="w-80 bg-gray-900 bg-opacity-50 backdrop-blur-xl border-l border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">AI Agents</h2>
          </div>
          <p className="text-sm text-gray-400">选择智能处理模块</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {mockAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={workflowState.selectedAgent?.id === agent.id}
              onSelect={handleAgentSelect}
              disabled={workflowState.isRunning}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
