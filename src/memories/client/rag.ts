import { create as createSchema, Orama } from '@orama/orama';
import { IDBPDatabase, openDB } from 'idb';
import React from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dbStorage } from '@/database/client';
import { getRegistry, Registerable } from '@/plugins';
import { strUtils } from '@/utils';

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
  // 返回条数限制 5
  limit: number;
  // 相似度限制 0.75
  similarity: number;
  // 最大缓存条数限制 20万 大概 1GB
  cacheLimit: number;
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
      limit: 5,
      similarity: 0.75,
      cacheLimit: 200000,
      disabled: false,
    }),
    {
      name: 'rag',
      storage: createJSONStorage(() => dbStorage),
      partialize: (state) => ({
        limit: state.limit,
        similarity: state.similarity,
        disabled: state.disabled,
        cacheLimit: state.cacheLimit,
        embedder: state.embedder,
      }),
    },
  ),
);

export interface Rag<TSchema> {
  embed: Embed;
  database: Orama<TSchema>;
}
interface VectorItem {
  vector: Float32Array;
  model: string;
  time: number;
}

let vectorDb: Promise<IDBPDatabase> | null = null;

function getVectorDb() {
  return (vectorDb ??= openDB('VectorCache', 1, {
    upgrade(db) {
      if (db.objectStoreNames.contains('vectors')) {
        db.deleteObjectStore('vectors');
      }
      const store = db.createObjectStore('vectors');
      store.createIndex('i_time', 'time');
    },
    async blocking() {
      if (vectorDb) {
        const tmp = vectorDb;
        vectorDb = null;
        const db = await tmp;
        db.close();
      }
    },
  }));
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
  async cache(
    input: string,
    model: string,
    factory: () => Promise<Float32Array>,
  ) {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      strUtils.toBuffer(input),
    );
    const db = await getVectorDb();
    const item: VectorItem = (await db.get('vectors', hashBuffer)) ?? {};

    if (model !== item.model) {
      const vector = await factory();
      item.vector = vector;
      item.model = model;
    }
    item.time = Date.now();
    await db.put('vectors', item, hashBuffer);
    const limit = useRagState.getState().cacheLimit;

    const count = await db.count('vectors');
    if (count > limit) {
      let remain = 100;
      const tx = db.transaction('vectors', 'readwrite');
      const index = tx.store.index('i_time');
      let cursor = await index.openCursor(); // 升序，最旧在前

      while (cursor && remain > 0) {
        cursor.delete();
        remain--;
        cursor = await cursor.continue();
      }

      await tx.done;
    }
    return item;
  },
};
