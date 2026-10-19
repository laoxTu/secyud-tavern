'use client';
import { useTranslations } from 'next-intl';

import { Field, FieldLabel } from '@/components';
import { PresetEntry } from '@/presets';
import { Lorebook } from '@/presets/lorebooks';
import { jsonUtils } from '@/utils';

import { DateEditor, EventDate, getDate } from './date-editor';
import {
  normalConfig,
  normalMatch,
  NormalMatchConfig,
  NormalMatcher,
} from './normal';

import { Matcher } from '.';

export interface EventMatchConfig extends NormalMatchConfig {
  maxDate: EventDate;
  minDate: EventDate;
}

export const defaultValue: EventMatchConfig = {
  maxDate: {
    year: 0,
    day: 1,
    month: 1,
  },
  minDate: {
    year: 0,
    day: 1,
    month: 1,
  },
  fitCount: 1,
  keywords: [[]],
  keywordsLength: 1,
};

export function MacherComponent({ entry }: { entry: PresetEntry<Lorebook> }) {
  const {
    entryId,
    data: { expression },
  } = entry;
  const t = useTranslations();
  const model: EventMatchConfig = jsonUtils.merge(defaultValue, expression);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`lorebook-min-date-${entryId}`}>
          {t('lorebook.min_date')}
        </FieldLabel>
        <DateEditor
          id={`lorebook-min-date-${entryId}`}
          defaultValue={model.minDate}
          name={`min-date`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-max-date-${entryId}`}>
          {t('lorebook.max_date')}
        </FieldLabel>
        <DateEditor
          id={`lorebook-max-date-${entryId}`}
          defaultValue={model.maxDate}
          name={`max-date`}
        />
      </Field>
      <NormalMatcher entry={entry} />
    </>
  );
}

export function getDateNumber(date: EventDate) {
  return date.day + date.month * 31 + date.year * 31 * 12 - 32;
}

export function eventMatch(
  content: string,
  variables: Record<string, any>,
  expression: EventMatchConfig,
) {
  const relatedDates = variables.related_dates as EventDate[];
  if (!relatedDates) return false;
  const maxDate = getDateNumber(expression.maxDate);
  const minDate = getDateNumber(expression.minDate);
  if (
    !relatedDates.some((u) => {
      const date = getDateNumber(u);
      return minDate <= date && maxDate >= date;
    })
  )
    return false;
  return normalMatch(content, expression);
}

export const eventMatcher: Matcher = {
  id: 'event',
  configComponent: MacherComponent,
  async configureObject(data, lorebook: Lorebook<EventMatchConfig>) {
    lorebook.expression = {
      ...normalConfig(data),
      maxDate: getDate(data, 'max-date'),
      minDate: getDate(data, 'min-date'),
    };
  },
  prompt: async (ctx, lorebook) => {
    return eventMatch(
      ctx.history.content,
      ctx.history.variables,
      lorebook.expression,
    );
  },
  output: async (ctx, output, lorebook) => {
    return eventMatch(
      output.content,
      ctx.history.variables,
      lorebook.expression,
    );
  },
} as const;
