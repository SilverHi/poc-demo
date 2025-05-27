import { Resource, Agent } from '@/types';

// 模拟资源数据
export const mockResources: Resource[] = [
  {
    id: '1',
    type: 'text',
    title: '电商购物车需求',
    content: '我需要一个购物车功能，用户可以添加商品、修改数量、删除商品，支持批量操作和价格计算',
    description: '电商平台核心功能需求',
    icon: '🛒'
  },
  {
    id: '2',
    type: 'document',
    title: '在线教育平台PRD',
    content: '学生需要能够在线观看课程视频，支持暂停、快进、做笔记，老师可以上传课件和作业',
    description: '教育平台产品需求文档',
    icon: '📚'
  },
  {
    id: '3',
    type: 'template',
    title: '金融支付流程',
    content: '用户发起支付请求，系统验证账户余额，调用第三方支付接口，返回支付结果并更新订单状态',
    description: '标准支付流程模板',
    icon: '💳'
  },
  {
    id: '4',
    type: 'url',
    title: '竞品分析报告',
    content: '基于市场调研的竞品功能对比分析，包含用户体验评估和功能差异化建议',
    description: '外部链接资源',
    icon: '🔗'
  }
];

// 模拟Agent数据
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: '需求分析Agent',
    description: '智能解析原始需求，提取关键信息和业务要素',
    type: 'analysis',
    icon: '🔍',
    inputType: ['text', 'document'],
    outputType: 'structured_requirements',
    color: 'bg-blue-500'
  },
  {
    id: 'agent-2',
    name: '用户画像Agent',
    description: '基于需求生成详细的用户角色和使用场景',
    type: 'persona',
    icon: '👤',
    inputType: ['structured_requirements', 'text'],
    outputType: 'user_persona',
    color: 'bg-green-500'
  },
  {
    id: 'agent-3',
    name: 'User Story生成Agent',
    description: '生成标准格式的User Story和功能描述',
    type: 'story',
    icon: '📝',
    inputType: ['user_persona', 'structured_requirements'],
    outputType: 'user_stories',
    color: 'bg-purple-500'
  },
  {
    id: 'agent-4',
    name: '验收条件Agent',
    description: '为User Story生成详细的验收条件和测试场景',
    type: 'acceptance',
    icon: '✅',
    inputType: ['user_stories'],
    outputType: 'acceptance_criteria',
    color: 'bg-orange-500'
  },
  {
    id: 'agent-5',
    name: '优先级评估Agent',
    description: '评估Story优先级和开发复杂度',
    type: 'priority',
    icon: '⭐',
    inputType: ['user_stories', 'acceptance_criteria'],
    outputType: 'priority_assessment',
    color: 'bg-yellow-500'
  },
  {
    id: 'agent-6',
    name: '质量检查Agent',
    description: '检查User Story质量和完整性',
    type: 'quality',
    icon: '🎯',
    inputType: ['user_stories', 'acceptance_criteria'],
    outputType: 'quality_report',
    color: 'bg-red-500'
  }
]; 