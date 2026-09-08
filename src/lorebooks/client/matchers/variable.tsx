'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Field, FieldLabel, Input } from '@/components';
import { Lorebook } from '@/lorebooks';
import { lorebooks, Matcher } from '@/lorebooks/client';
import { PresetEntry } from '@/presets';
import { jsonUtils } from '@/utils';
import { extract } from '@/utils/json-patch';

export interface VariableMatchConfig {
  // 路径
  path: string;
  // 值
  value: string;
}

export const defaultValue: VariableMatchConfig = {
  path: '',
  value: '',
};

function MatcherComponent({
  entry: {
    entryId,
    data: { expression },
  },
}: {
  entry: PresetEntry<Lorebook>;
}) {
  const t = useTranslations();
  const config: VariableMatchConfig = jsonUtils.merge(defaultValue, expression);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`lorebook-path-${entryId}`}>
          {t('default.path')}
        </FieldLabel>
        <Input
          id={`lorebook-path-${entryId}`}
          name={`match_path`}
          defaultValue={config.path}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-value-${entryId}`}>
          {t('default.value')}
        </FieldLabel>
        <Input
          id={`lorebook-value-${entryId}`}
          name={`match_value`}
          defaultValue={config.value}
        />
      </Field>
    </>
  );
}

export const variableMatcher: Matcher = {
  id: 'variable',
  configComponent: MatcherComponent,
  async configureObject(data, lorebook: Lorebook<VariableMatchConfig>) {
    lorebook.expression = {
      path: data.get('match_path') as string,
      value: data.get('match_value') as string,
    };
  },
  match: async (context, lorebook) => {
    const variables = lorebooks.matchers.variables(context);
    const expression: VariableMatchConfig = lorebook.expression;
    const { exists, current } = extract(variables, expression.path);
    return exists && String(current) === expression.value;
  },
} as const;
