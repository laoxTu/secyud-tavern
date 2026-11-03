'use client';
import { utils } from '@/database';
import { BusinessError } from '@/interceptors';
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
    description:
      'ask user for answer, return titles and custom answer if allowed',
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
          items: {
            type: 'object',
            properties: { title: { type: 'string' }, text: { type: 'string' } },
          },
          description: 'user can select one of them',
        },
        custom: {
          type: 'boolean',
          description: 'whether allow custom answer, true for default',
        },
        single: {
          type: 'boolean',
          description: 'whether allow single answer, true for default',
        },
      },
    },
    invoke({ args: item }) {
      return new Promise<string>((resolve, reject) => {
        const state = useElicitState.getState();
        const timer = setTimeout(async () => {
          state.timeout(item);
          reject(new BusinessError('User did not answer in time'));
        }, 900000);
        try {
          const reply = async (answer: string[]) => {
            resolve(answer.join(';'));
            clear();
          };
          item = { ...item, reply, id: utils.uuid() };
          state.push(item);
        } catch (e) {
          reject(e);
          clear();
        }

        function clear() {
          clearTimeout(timer);
        }
      });
    },
  };
}
