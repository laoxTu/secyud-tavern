'use client';
import { ToolItem, ToolProvider } from '@/tools/client';

import { elicits as main } from '..';

import { ElicitItem, useElicitState } from './states';

export const tool: ToolProvider = {
  ...main,
  id: main.name,
  async create() {
    return [elicit()];
  },
};

function elicit(): ToolItem<ElicitItem> {
  return {
    name: 'ask_user',
    description: 'ask user for answer',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['question', 'examples', 'custom'],
      properties: {
        question: {
          type: 'string',
          description: 'question to ask',
        },
        examples: {
          type: 'array',
          items: { type: 'string' },
          description: 'user can select one of them',
        },
        custom: {
          type: 'boolean',
          description: 'whether allow custom answer, true for default',
        },
      },
    },
    invoke({ args: item }) {
      return new Promise<string>((resolve, reject) => {
        try {
          const state = useElicitState.getState();
          const reply = async (answer: string) => {
            resolve(answer);
          };
          state.push({ ...item, reply });
        } catch (e) {
          reject(e);
        }
      });
    },
  };
}
