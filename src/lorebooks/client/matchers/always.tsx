'use client';
import { useTranslations } from 'next-intl';

import { Checkbox, Field, FieldContent, FieldLabel } from '@/components';
import { Lorebook } from '@/lorebooks';
import { Matcher } from '@/lorebooks/client';
import { PresetEntry } from '@/presets';
import { jsonUtils } from '@/utils';

export interface AlwaysMatchConfig {
  /**
   * 是否为最后一个
   */
  last: boolean;
}

function AlwaysMatcher({
  entry: {
    entryId,
    data: { expression },
  },
}: {
  entry: PresetEntry<Lorebook>;
}) {
  const t = useTranslations();
  const model: AlwaysMatchConfig = jsonUtils.merge({ last: false }, expression);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`lorebook-last-${entryId}`}>
          {t('lorebook.last_message')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name={'last'}
            id={`lorebook-last-${entryId}`}
            defaultChecked={model.last}
          />
        </FieldContent>
      </Field>
    </>
  );
}

export const alwaysMatcher: Matcher = {
  id: 'always',
  configComponent: AlwaysMatcher,
  async configureObject(data, lorebook: Lorebook<AlwaysMatchConfig>) {
    lorebook.expression = {
      last: !!data.get('last'),
    };
  },
  async match() {
    return Promise.resolve(true);
  },
};
