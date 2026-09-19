'use client';
import { useTranslations } from 'next-intl';

import { InputGroup, InputGroupInput, InputGroupText } from '@/components';
import { forms } from '@/global';

export interface EventDate {
  year: number;
  month: number;
  day: number;
}

export function DateEditor({
  defaultValue,
  name,
  id,
}: {
  defaultValue: EventDate;
  name: string;
  id: string;
}) {
  const t = useTranslations();
  return (
    <>
      <InputGroup className="w-full px-2" id={id}>
        <InputGroupText>{t('default.year')} :</InputGroupText>
        <InputGroupInput
          id={`${id}-year`}
          type={'number'}
          min={0}
          step={1}
          name={`${name}-year`}
          defaultValue={defaultValue.year}
        />
        <InputGroupText>{t('default.month')} :</InputGroupText>
        <InputGroupInput
          id={`${id}-month`}
          type={'number'}
          min={1}
          max={12}
          step={1}
          name={`${name}-month`}
          defaultValue={defaultValue.month}
        />
        <InputGroupText>{t('default.day')} :</InputGroupText>
        <InputGroupInput
          id={`${id}-day`}
          type={'number'}
          min={1}
          max={31}
          step={1}
          name={`${name}-day`}
          defaultValue={defaultValue.day}
        />
      </InputGroup>
    </>
  );
}

export function getDate(data: FormData, name: string): EventDate {
  return {
    year: forms.int(data, `${name}-year`),
    month: forms.int(data, `${name}-month`),
    day: forms.int(data, `${name}-day`),
  };
}
