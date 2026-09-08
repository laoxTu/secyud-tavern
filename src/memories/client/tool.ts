import { insert, search } from '@orama/orama';

import { Memory } from '@/memories';
import { memories } from '@/memories/client';
import { Realm } from '@/stories';
import { stories } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { ToolItem, ToolProvider } from '@/tools/client';

export const provider: ToolProvider = {
  id: 'memory',
  async create(_, realm) {
    return [get(realm), set(realm)];
  },
};

function get(realm: Realm): ToolItem<{
  content: string;
  types?: string[];
  tags?: string[];
  limit?: number;
  min_relevance?: number;
}> {
  return {
    name: 'get_memory',
    description:
      'prepare for get the memory. memory will return by knowledge tool.',
    parameters: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          description: 'the question or tag to search',
        },
        types: {
          type: 'array',
          description: 'the memory type to search. all if empty.',
          items: {
            type: 'string',
            enum: memories.types,
          },
        },
        tags: {
          type: 'array',
          description: 'the tags to filter. (max 3)',
          items: {
            type: 'string',
          },
        },
        limit: {
          type: 'integer',
          description: 'the memory item count to recall',
          minimum: 1,
          maximum: 5,
          default: 3,
        },
        min_relevance: {
          type: 'number',
          description: 'the min relevance to filter.',
          minimum: 0,
          maximum: 1,
          default: 0.3,
        },
      },
      additionalProperties: false,
    },
    async invoke({
      content,
      types = [],
      tags = [],
      limit = 3,
      min_relevance = 0.3,
    }) {
      const outputs = realms.outputs(
        await realms.history.get(undefined, realm),
      );
      const output = outputs?.at(-1);

      if (!output) {
        return 'error: output not found';
      }

      const cache = memories.cache(realm);
      if (!cache.rag) {
        return 'warn: RAG is not enabled';
      }
      const { embed, database } = cache.rag;

      // 生成查询向量
      const embedding = await embed.generate({ content });

      // 构建搜索过滤器
      const filter: any[][] = [];
      if (types?.length) {
        filter.push(['type', types]);
      }
      if (tags && tags.length > 0) {
        filter.push(['tags', tags]);
      }

      // 执行向量搜索
      const results = await search(database, {
        mode: 'vector',
        vector: {
          value: embedding, // 用于向量匹配
          property: 'embedding', // 指定要匹配的向量字段
        },
        similarity: min_relevance,
        limit: limit * 3,
        where: filter.length ? Object.fromEntries(filter) : undefined,
      });

      const codes = memories.codes(output)!;
      const ids = results.hits
        .map((hit) => {
          const score =
            hit.score +
            ((hit.document.importance / 10) * hit.document.sequence) /
              (realm.histories.length + 1);
          return {
            id: hit.document.entryId,
            score,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((u) => u.id);
      codes.push(ids);

      return ids.length ? `success` : 'success: no items.';
    },
  };
}

function set(realm: Realm): ToolItem<{
  content: string;
  title: string;
  type?: string;
  importance?: number;
  tags?: string[];
}> {
  return {
    name: 'set_memory',
    description: 'vectorize content and save.',
    parameters: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          description: 'the content to vectorize',
        },
        title: {
          type: 'string',
          description: 'the memory title. (< 12 words)',
        },
        importance: {
          type: 'integer',
          description: 'the importance',
          minimum: 1,
          maximum: 10,
          default: 5,
        },
        type: {
          type: 'string',
          description: 'the memory type',
          enum: memories.types,
        },
        tags: {
          type: 'array',
          description: 'tags to help search',
          items: {
            type: 'string',
          },
        },
      },
      additionalProperties: false,
    },
    async invoke({
      content,
      title,
      type = 'event',
      tags = [],
      importance = 5,
    }) {
      const cache = memories.cache(realm);

      if (!cache.rag) return 'warn: RAG is not enabled';
      const { embed, database } = cache.rag;
      const embedding = await embed.generate({ content });

      const sequence = realm.histories.length;

      const memory: Memory = {
        importance,
        sequence,
        text: content,
        tags,
        type,
      };

      const { entryId } = await stories.proxy.entry.add<Memory>(
        realm.id,
        memories.name,
        {
          name: title,
          data: memory,
        },
      );

      cache.memories[entryId] = {
        name: title,
        entryId,
        ...memory,
      };
      await insert(database, {
        entryId,
        tags,
        type,
        importance,
        sequence,
        embedding,
      });
      return 'success';
    },
  };
}
