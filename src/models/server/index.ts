import { models as main } from '@/models';
import { anthropics } from '@/models/anthropic/server';
import { deepseeks } from '@/models/deepseek/server';
import { openais } from '@/models/openai/server';

import { engines } from './engine';
import { repository } from './repository';

export type * from './engine';
export const models = {
  ...main,
  repository,
  engines,
};

export default async function () {
  models.engines.registry.register(
    openais.engine,
    deepseeks.engine,
    anthropics.engine,
  );
}
