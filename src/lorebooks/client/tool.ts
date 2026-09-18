import { search } from '@orama/orama';

import { lorebooks as main } from '@/lorebooks';
import { useRagState } from '@/memories/client';
import { Realm } from '@/stories';
import { realms } from '@/stories/client/realms';
import { ToolItem, ToolProvider } from '@/tools/client';

import { lorebooks } from '.';

export const provider: ToolProvider = {
  id: main.name,
  async create(_, realm) {
    return [get(realm)];
  },
};

function get(realm: Realm): ToolItem<{
  content: string;
  types?: string[];
  tags?: string[];
  limit?: number;
  min_relevance?: number;
}> {
  const { limit, similarity } = useRagState.getState();
  return {
    name: 'get_lorebook',
    description: 'get the titles of lorebook. lorebook is injected in context.',
    parameters: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          description: 'the question or tag to search',
        },
        limit: {
          type: 'integer',
          description: 'the memory item count to recall',
          minimum: 1,
          maximum: 5,
          default: limit,
        },
        min_relevance: {
          type: 'number',
          description: 'the min relevance to filter.',
          minimum: 0,
          maximum: 1,
          default: similarity,
        },
      },
      additionalProperties: false,
    },
    async invoke({ content, limit = 3, min_relevance = 0.3 }) {
      const outputs = realms.outputs(await realms.history.get(null, realm));
      const output = outputs?.at(-1);

      if (!output) {
        return 'error: output not found';
      }

      const cache = lorebooks.cache(realm);
      if (!cache.rag) {
        return 'warn: RAG is not enabled';
      }
      const { embed, database } = cache.rag;

      // 生成查询向量
      const embedding = await embed.generate({ content });

      // 构建搜索过滤器
      const filter: any[][] = [];

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

      const codes = lorebooks.codes(output)!;
      const data = results.hits
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      codes.push(data.map((u) => u.document.name));

      return JSON.stringify(data.map((u) => u.document.title));
    },
  };
}
