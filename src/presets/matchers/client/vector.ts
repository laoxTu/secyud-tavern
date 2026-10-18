import { utils } from '@/database';
import { lorebooks } from '@/presets/lorebooks/client';

import { Matcher } from '.';

export const vectorMatcher: Matcher = {
  id: 'vector',
  output: async (context, output, lorebook) => {
    if (!context.cache.rag) return false;
    const ids = utils.getProperty<Set<string | undefined>>(
      context,
      vectorMatcher.id,
      () => {
        const list = lorebooks.codes(output, false);
        if (!list) return new Set();
        return new Set(list.flat());
      },
    );
    console.debug('[lorebook](vector):', ids);

    return ids.has(lorebook.id);
  },
};
