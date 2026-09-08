import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Field,
  FieldLabel,
  Input,
  MonacoEditor,
  rowFull,
  Selector,
  spanHalf,
  UpdateForm,
  useFormRef,
} from '@/components';
import { checker } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { PresetEntry } from '@/presets';
import {
  PresetEntryList,
  PresetEntryUpdate,
  presets,
  usePresetState,
} from '@/presets/client';
import { createPresetEntryState } from '@/presets/client/factory';

import { styles as main, Style } from '..';

const types = ['link', 'text/css'];

function mapToLanguage(type: string | null) {
  switch (type) {
    case 'link':
      return 'plaintext';
    default:
      return 'css';
  }
}

const state = createPresetEntryState<Style>(main.name, main.default);

function Editor({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { content, code, type, priority },
  },
}: {
  entry: PresetEntry<Style>;
}) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { refresh } = state();
  const form = useFormRef();
  const [language, setLanguage] = useState<string>(mapToLanguage(type));

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data: FormData) => {
        await presets.proxy.entry.set<Style>(masterId, entryType, entryId, {
          data: {
            type: data.get('type') as string,
            code: data.get('code') as string,
            content: data.get('content') as string,
            priority: parseInt(data.get('priority') as string),
          },
          name: data.get('name') as string,
        });
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field className={cn(spanHalf, rowFull)}>
        <FieldLabel>{t('default.content')}</FieldLabel>
        <MonacoEditor
          name={'content'}
          defaultValue={content}
          language={language}
          formRef={form}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`style-code-${entryId}`}>
          {t('default.code')}
        </FieldLabel>
        <Input
          name="code"
          pattern={checker.code}
          id={`style-code-${entryId}`}
          defaultValue={code}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`style-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`style-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`style-priority-${entryId}`}>
          {t('default.priority')}
        </FieldLabel>
        <Input
          name="priority"
          type={'number'}
          id={`style-priority-${entryId}`}
          defaultValue={priority}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`style-type-${entryId}`}>
          {t('default.type')}
        </FieldLabel>
        <Selector
          name={'type'}
          id={`style-type-${entryId}`}
          defaultValue={type}
          onValueChange={(v) => {
            setLanguage(mapToLanguage(v));
          }}
          items={types}
        />
      </Field>
    </UpdateForm>
  );
}

export function Content() {
  const { item } = usePresetState();
  if (!item) return null;

  return (
    <PresetEntryList<Style> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}
