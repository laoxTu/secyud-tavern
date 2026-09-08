'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button, Field, FieldGroup, GridField } from '.';

interface UpdateFormProps {
  form?: React.RefObject<HTMLFormElement | null>;
  onSubmit: (data: FormData) => Promise<void>;
  children: React.ReactNode;
}

export function UpdateForm({ form, children, onSubmit }: UpdateFormProps) {
  const t = useTranslations();
  return (
    <form
      ref={form}
      action={onSubmit}
      className={'flex flex-col flex-1 overflow-hidden p-1 gap-1'}
    >
      <FieldGroup className={'flex flex-col flex-1 overflow-auto'}>
        <GridField>{children}</GridField>
      </FieldGroup>
      <Field orientation="horizontal">
        <Button variant={'outline'} type="submit">
          {t('default.save')}
        </Button>
      </Field>
    </form>
  );
}
