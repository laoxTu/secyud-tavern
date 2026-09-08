export interface AnthropicConfig {
  extras: string;
  url: string;
}

export interface AnthropicOptions {
  model: string;
  max_tokens: number;
  temperature: number; // [0,2]
  top_p: number; // [0,1]
}

const config: AnthropicConfig = {
  extras: '{}',
  url: 'https://api.anthropic.com/v1',
};

const options: AnthropicOptions = {
  model: '',
  temperature: 1,
  top_p: 1,
  max_tokens: 8192,
};

export const anthropics = {
  name: 'anthropic',
  default: {
    options,
    config,
  },
};
