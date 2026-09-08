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

import { scripts as main, Script } from '..';

const types = ['link', 'application/javascript', 'module', 'importmap'];

function mapToLanguage(type: string | null) {
  switch (type) {
    case 'link':
      return 'plaintext';
    case 'importmap':
      return 'json';
    default:
      return 'javascript';
  }
}
const state = createPresetEntryState<Script>(main.name, main.default);

function Editor({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { content, code, type, priority },
  },
}: {
  entry: PresetEntry<Script>;
}) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const form = useFormRef();
  const { refresh } = state();
  const [language, setLanguage] = useState<string>(mapToLanguage(type));

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data: FormData) => {
        await presets.proxy.entry.set<Script>(masterId, entryType, entryId, {
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
          value={content}
          language={language}
          formRef={form}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`script-code-${entryId}`}>
          {t('default.code')}
        </FieldLabel>
        <Input
          name="code"
          pattern={checker.code}
          id={`script-code-${entryId}`}
          defaultValue={code}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`script-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`script-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`script-priority-${entryId}`}>
          {t('default.priority')}
        </FieldLabel>
        <Input
          name="priority"
          type={'number'}
          id={`script-priority-${entryId}`}
          defaultValue={priority}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`script-type-${entryId}`}>
          {t('default.type')}
        </FieldLabel>
        <Selector
          name={'type'}
          id={`script-type-${entryId}`}
          value={type}
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
    <PresetEntryList<Script> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}
