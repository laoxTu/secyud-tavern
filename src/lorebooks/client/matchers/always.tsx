'use client';
import { useTranslations } from 'next-intl';

import { Checkbox, Field, FieldContent, FieldLabel } from '@/components';
import { forms } from '@/global';
import { Lorebook } from '@/lorebooks';
import { Matcher } from '@/lorebooks/client';
import { PresetEntry } from '@/presets';
import { jsonUtils } from '@/utils';

export interface AlwaysMatchConfig {
  /**
   * 是否为最后一个
   */
  last: boolean;
  // 绑定同名宏，宏的状态会和世界书同步
  macro?: boolean;
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
      <Field>
        <FieldLabel htmlFor={`lorebook-macro-${entryId}`}>
          {t('lorebook.bind_macro')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name={'macro'}
            id={`lorebook-macro-${entryId}`}
            defaultChecked={model.macro}
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
      last: forms.bool(data, 'last'),
      macro: forms.bool(data, 'macro'),
    };
  },
  async match() {
    return Promise.resolve(true);
  },
};
