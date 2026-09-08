import { search } from '@orama/orama';

import { lorebooks, Matcher } from '@/lorebooks/client';

export const vectorMatcher: Matcher = {
  id: 'vector',
  match: async (context, lorebook) => {
    if (!context.cache.rag) return false;
    const { properties } = context;
    let ids: Set<string | undefined> = properties[vectorMatcher.id];
    if (!ids) {
      const content = lorebooks.matchers.content(context);
      const { embed, database } = context.cache.rag;
      const embedding = await embed.generate({ content });
      const results = await search(database, {
        mode: 'vector', // 核心：结合全文和向量搜索
        vector: {
          value: embedding, // 用于向量匹配
          property: 'embedding', // 指定要匹配的向量字段
        },
        // 可选：限制返回数量
        limit: 5,
        // 可选：设定相似度阈值，低于此分数的不返回
        similarity: 0.75,
      });
      console.debug('[lorebook](results): ', results);
      ids = new Set(results.hits.map((u) => u.document.name));
      properties[vectorMatcher.id] = ids;
    }

    return ids.has(lorebook.id);
  },
};
