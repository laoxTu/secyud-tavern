import { checker } from '@/interceptors';
import { Model } from '@/models';
import { getRegistry, Registerable } from '@/plugins';
import { hasher } from '@/utils/server';

export interface ModelGenerateContext {
  signal: AbortSignal;
  model: Model;
  apiKey: string;
  input: any;
}

export interface ModelEngine extends Registerable {
  generate(
    context: ModelGenerateContext,
  ): Promise<AsyncIterable<any> | Record<string, any>>;
}

const registry = getRegistry<ModelEngine>('model-engine');

async function generate(model: Model, input: any, signal: AbortSignal) {
  const name = checker.notNullOrWhitespace('engine', model.engine, 'model');
  const engine = registry.records[name];
  checker.notNullEntity(name, engine, 'model.engine');

  const apiKey =
    model.key && model.iv ? hasher.decrypt(model.key, model.iv) : '';

  return await engine.generate({ model, apiKey, signal, input });
}

export const engines = {
  registry,
  generate,
};
