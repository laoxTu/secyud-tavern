export interface OpenAIConfig {
  extras: string;
  url: string;
  format: 'chat' | 'responses';
}

export interface OpenAIOptions {
  model: string;
  presence_penalty: number; // [-2, 2]
  frequency_penalty: number; // [-2, 2]
  temperature: number; // [0,2]
  top_p: number; // [0,1]
  max_output_tokens?: number; // [16, max]
}

const config: OpenAIConfig = {
  extras: '{}',
  format: 'chat',
  url: 'https://api.openai.com/v1',
};

const options: OpenAIOptions = {
  model: '',
  temperature: 1,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
};

export const openais = {
  name: 'openai',
  formats: ['chat', 'responses'],
  default: {
    options,
    config,
  },
};
