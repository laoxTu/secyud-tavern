import { env, pipeline } from '@huggingface/transformers';
import { useTranslations } from 'next-intl';

import { Field, FieldLabel, Selector } from '@/components';

import { Embed, Embedder, useRagState } from './rag';

const name = 'transformer';

interface Transformer {
  model: ModelKey;
}

const modelKeys = ['all-MiniLM-L6-v2', 'bge-small-zh-v1.5'] as const;
type ModelKey = (typeof modelKeys)[number];

interface ModelInfo {
  dimension: number;
  model: ModelKey;
}

const models: Record<ModelKey, ModelInfo> = {
  'all-MiniLM-L6-v2': {
    model: 'all-MiniLM-L6-v2',
    dimension: 384,
  },
  'bge-small-zh-v1.5': {
    model: 'bge-small-zh-v1.5',
    dimension: 512,
  },
};

function Editor() {
  const t = useTranslations();
  const {
    embedder: { config },
  } = useRagState();
  const { model } = config as Transformer;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="transformers-model">
          {t('rag.embedding_generator_model')}
        </FieldLabel>
        <Selector
          name={'model'}
          id={`transformers-model`}
          value={model ?? models['all-MiniLM-L6-v2'].model}
          items={[...modelKeys]}
        />
      </Field>
    </>
  );
}

const embedder: Embedder = {
  id: name,
  component: Editor,
  configure(data: FormData): Transformer {
    return {
      model: data.get('model') as ModelKey,
    };
  },
  async embed(): Promise<Embed> {
    const {
      embedder: { config },
    } = useRagState.getState();
    const { model: type } = config as Transformer;
    env.allowLocalModels = true;
    env.localModelPath = '/models/';
    env.allowRemoteModels = false;
    const { dimension, model } = models[type] ?? models['all-MiniLM-L6-v2'];
    console.debug('[transformer](info): ', { dimension, model });
    const extractor = await pipeline('feature-extraction', model, {
      // device: "auto" auto 会导致下载onnx_data, 但是没有这个文件，先用wasm
    });
    return {
      dimension,
      async generate(ctx) {
        const result = await extractor(ctx.content ?? '', {
          pooling: 'mean',
          normalize: true,
        });
        return result.tolist()[0];
      },
    };
  },
};

export const transformers = {
  name,
  embedder,
};
