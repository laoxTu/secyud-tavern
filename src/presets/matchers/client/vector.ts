import { utils } from '@/database';
import { lorebooks } from '@/presets/lorebooks/client';

import { Matcher } from '.';

export const vectorMatcher: Matcher = {
  id: 'vector',
  output: async (context, output, lorebook) => {
    if (!context.cache.rag) return false;
    let ids = utils.getProperty<Set<string | undefined>>(
      context,
      vectorMatcher.id,
      () => {
        const list = lorebooks.codes(output);
        if (!list) return new Set();

        return new Set(list.flat());
      },
    );

    return ids.has(lorebook.id);
  },
};
