import { AgentConfig } from '@/tools/agents';
import { agents } from '@/tools/agents/client';

export interface TextConfig {
  // 节点
  node: string;
  // 节点下的属性
  key: string;
  // 默认的提示词
  prompt: string;
}

const defaultTextConfig: TextConfig = {
  node: '',
  key: 'text',
  prompt: '',
};

/**
 * 使用Agent生成文字的配置
 * 这里用了工具下的agent工具
 */
export interface AgentTextConfig extends TextConfig, AgentConfig {}

const defaultAgentTextConfig: AgentTextConfig = {
  ...agents.default,
  ...defaultTextConfig,
};

export interface NumberConfig {
  // 节点
  node: string;
  // 节点下的属性
  key: string;
  // 值
  value: number;
}

const defaultNumberConfig: NumberConfig = {
  key: '',
  node: '',
  value: 0,
};

export const editors = {
  agentText: {
    default: defaultAgentTextConfig,
    name: 'agent_text',
  },
  text: {
    name: 'text',
    default: defaultTextConfig,
  },
  number: {
    name: 'number',
    default: defaultNumberConfig,
  },
};
