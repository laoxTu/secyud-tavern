import { lorebooks, Matcher } from '@/lorebooks/client';

export const vectorMatcher: Matcher = {
  id: 'vector',
  match: async (context, lorebook) => {
    if (!context.cache.rag || !context.output) return false;
    const { properties } = context;
    let ids: Set<string | undefined> = properties[vectorMatcher.id];
    if (!ids) {
      ids = new Set();
      const list = lorebooks.codes(context.message);
      if (list) {
        for (const vectors of list) {
          for (const vector of vectors) {
            ids.add(vector);
          }
        }
      }

      properties[vectorMatcher.id] = ids;
    }

    return ids.has(lorebook.id);
  },
};
