import { insert } from '@orama/orama';
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

export const vectorMatcher: Matcher<VectorMatchConfig> = {
  id: 'vector',
  configComponent: MatcherComponent,
  async configureObject(data, lorebook) {
    lorebook.expression = {
      keywords: forms.str(data, 'keywords'),
    };
  },
  async initialize(realm, cache, entry) {
    if (!cache.rag) return;
    const keywords = entry.expression?.keywords?.trim();
    const text = keywords ? keywords : entry.content?.trim();
    if (!text) return;
    const { embed, database } = cache.rag;
    const embedding = await embed.generate({
      content: text,
    });
    await insert(database, {
      name: entry.id,
      title: entry.name,
      embedding,
    });
  },
  async output(context, output, lorebook) {
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
