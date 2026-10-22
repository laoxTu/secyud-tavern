import { useTranslations } from 'next-intl';

import { Field, FieldLabel, Input } from '@/components';
import { utils } from '@/database';
import { forms } from '@/global';
import { PresetEntry } from '@/presets';
import { Lorebook } from '@/presets/lorebooks';
import { lorebooks } from '@/presets/lorebooks/client';
import { jsonUtils } from '@/utils';

import { Matcher } from '.';

export interface VectorMatchConfig {
  keywords?: string;
}
export const defaultValue: VectorMatchConfig = {};

function MatcherComponent({
  entry: {
    entryId,
    data: { expression },
  },
}: {
  entry: PresetEntry<Lorebook>;
}) {
  const t = useTranslations();
  const config: VectorMatchConfig = jsonUtils.merge(defaultValue, expression);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`lorebook-keywords-${entryId}`}>
          {t('default.keywords')}
        </FieldLabel>
        <Input
          id={`lorebook-keywords-${entryId}`}
          name={`keywords`}
          defaultValue={config.keywords}
        />
      </Field>
    </>
  );
}

export const vectorMatcher: Matcher = {
  id: 'vector',
  configComponent: MatcherComponent,
  async configureObject(data, lorebook: Lorebook<VectorMatchConfig>) {
    lorebook.expression = {
      keywords: forms.str(data, 'keywords'),
    };
  },
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
