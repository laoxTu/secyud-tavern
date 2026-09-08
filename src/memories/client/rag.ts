import { create as createSchema, Orama } from '@orama/orama';
import React from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dbStorage } from '@/database/client';
import { getRegistry, Registerable } from '@/plugins';

export interface EmbedContext {
  content: string;
}

export interface Embed {
  dimension: number;
  generate: (ctx: EmbedContext) => Promise<number[]>;
}

export interface Embedder extends Registerable {
  component: React.ComponentType;
  configure: (data: FormData) => Record<string, any>;
  embed: () => Promise<Embed>;
}

const registry = getRegistry<Embedder>('embedder');

export interface RagState {
  embedder: {
    type: string;
    config: Record<string, any>;
  };
  disabled: boolean;
}

const defaultEmbedder = {
  type: 'transformers',
  config: {},
};

export const useRagState = create<RagState>()(
  persist<RagState>(
    () => ({
      embedder: {
        type: 'transformers',
        config: {},
      },
      disabled: false,
    }),
    {
      name: 'rag',
      storage: createJSONStorage(() => dbStorage),
      partialize: (state) => ({
        disabled: state.disabled,
        embedder: state.embedder,
      }),
    },
  ),
);

export interface Rag<TSchema> {
  embed: Embed;
  database: Orama<TSchema>;
}

export const rags = {
  name: 'rag',
  registry,
  default: defaultEmbedder,
  async create<TSchema>(schema: TSchema): Promise<Rag<TSchema> | null> {
    const {
      embedder: { type },
      disabled,
    } = useRagState.getState();
    const embedder = registry.record(type);
    if (disabled || !embedder) {
      return null;
    }
    const embed = await embedder.embed();
    return {
      embed,
      database: createSchema({
        schema: {
          ...schema,
          embedding: `vector[${embed.dimension}]`,
        },
        sort: {
          enabled: true,
        },
      }),
    };
  },
};
