'use client';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { TagBox } from '@/components';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Lorebook } from '@/lorebooks';
import { lorebooks, MatchContext, Matcher } from '@/lorebooks/client';
import { PresetEntry } from '@/presets';
import { jsonUtils } from '@/utils';

export interface NormalMatchConfig {
  // 关键词
  keywords: string[][];
  // 关键词组数量
  keywordsLength: number;
  // 需要符合的最小数量
  fitCount: number;
}

export const defaultValue: NormalMatchConfig = {
  fitCount: 1,
  keywords: [[]],
  keywordsLength: 1,
};

export function NormalMatcher({
  entry: {
    entryId,
    data: { expression },
  },
}: {
  entry: PresetEntry<Lorebook>;
}) {
  const t = useTranslations();
  const config: NormalMatchConfig = jsonUtils.merge(defaultValue, expression);
  const [keywordsLength, setKeywordsLength] = useState(config.keywordsLength);
  const maxLength = 4;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`lorebook-fit_count-${entryId}`}>
          {t('lorebook.fit_count')}
        </FieldLabel>
        <Input
          id={`lorebook-fit_count-${entryId}`}
          type={'number'}
          min={1}
          max={Math.max(keywordsLength, 1)}
          step={1}
          defaultValue={config.fitCount}
          name={'fitCount'}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-keywords_length-${entryId}`}>
          {t('lorebook.keywords_groups_length')}
        </FieldLabel>
        <Input
          id={`lorebook-keywords_length-${entryId}`}
          type={'number'}
          min={1}
          max={maxLength}
          step={1}
          value={keywordsLength}
          onChange={(e) =>
            setKeywordsLength(clamp(parseInt(e.target.value), 1, maxLength))
          }
          name={'keywordsLength'}
        />
      </Field>
      {Array.from({ length: keywordsLength }).map((_, index) => (
        <Field key={index}>
          <FieldLabel htmlFor={`lorebook-keywords-${entryId}-${index}`}>
            {`${t('lorebook.include_any_word')} ${index + 1}`}
          </FieldLabel>
          <TagBox
            id={`lorebook-keywords-${entryId}-${index}`}
            name={`keywords-${index}`}
            defaultValue={
              config.keywords.length > index ? config.keywords[index] : []
            }
          />
        </Field>
      ))}
    </>
  );
}

export function normalConfig(data: FormData): NormalMatchConfig {
  const keywordsLength = parseInt(data.get('keywordsLength') as string);
  const keywords: string[][] = [];
  for (let i = 0; i < keywordsLength; i++) {
    keywords.push(data.getAll(`keywords-${i}`) as string[]);
  }
  return {
    keywords,
    keywordsLength,
    fitCount: Math.min(
      parseInt(data.get('fitCount') as string),
      keywords.length,
    ),
  };
}

export function normalMatch(
  context: MatchContext,
  expression?: NormalMatchConfig,
) {
  if (!expression?.keywordsLength) return false;
  const content = lorebooks.matchers.content(context);
  let fitCount = 0;
  for (const keywords of expression.keywords) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      fitCount++;
    }
    if (fitCount >= expression.fitCount) return true;
  }
  return false;
}

export const normalMatcher: Matcher = {
  id: 'normal',
  configComponent: NormalMatcher,
  async configureObject(data, lorebook: Lorebook<NormalMatchConfig>) {
    lorebook.expression = normalConfig(data);
  },
  match: async (ctx, lorebook) => {
    return normalMatch(ctx, lorebook.expression);
  },
} as const;
