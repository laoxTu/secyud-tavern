export interface DeepseekConfig {}

export interface DeepseekOptions {
  model: string;
  thinking: {
    type: 'enabled' | 'disabled';
  };
  // 思考强度控制
  reasoning_effort: string; // high/max
  temperature: number; // [0,2]
  top_p: number; // [0,1]
  max_tokens: number; // [0, ...]
  logprobs: boolean;
  top_logprobs: number; // [0,20]
}

const config: DeepseekConfig = {};

const options: DeepseekOptions = {
  model: 'deepseek-v4-flash',
  thinking: {
    type: 'enabled',
  },
  reasoning_effort: 'high',
  temperature: 1,
  top_p: 1,
  logprobs: false,
  top_logprobs: 10,
  max_tokens: 0,
};

export const deepseeks = {
  name: 'deepseek',
  models: [
    'deepseek-v4-flash',
    'deepseek-v4-pro',
    'deepseek-v4.1-flash-expires-on-0910',
  ],
  reasoningEfforts: ['high', 'max'],
  default: {
    options,
    config,
  },
};
