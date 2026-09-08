import { FileCode2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  element,
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
  PresetTab,
  usePresetState,
} from '@/presets/client';
import { createPresetEntryState } from '@/presets/client/factory';

import { Lorebook, lorebooks as main } from '..';

import { lorebooks } from '.';

const roles = ['system', 'user', 'assistant', 'knowledge'];
const contentTypes = ['json', 'plaintext', 'markdown', 'yaml', 'xml'];

const state = createPresetEntryState<Lorebook>(main.name, main.default);

function Editor({ entry }: { entry: PresetEntry<Lorebook> }) {
  const {
    masterId,
    entryType,
    entryId,
    name,
    data: { type, content, code, match, priority, layer, role },
  } = entry;
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { refresh } = state();
  const form = useFormRef();
  const [language, setLanguage] = useState<string | null>(type);
  const [editor, setEditor] = useState(
    lorebooks.matchers.registry.record(match),
  );

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data: FormData) => {
        if (!editor) return;
        const content = data.get('content') as string;
        const type = data.get('type') as string;
        if (type === 'json') {
          checker.validJsonOrEmpty(content, 'preset.lorebook');
        }
        const entry: Partial<PresetEntry<Lorebook>> = {
          data: {
            match: editor.id,
            content,
            type,
            expression: {},
            role: data.get('role') as any,
            code: data.get('code') as string,
            priority: parseInt(data.get('priority') as string),
            layer: parseInt(data.get('layer') as string),
          },
          name: data.get('name') as string,
        };
        await editor.configureObject?.(data, entry.data!);

        await presets.proxy.entry.set<Lorebook>(
          masterId,
          entryType,
          entryId,
          entry,
        );
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field className={cn(spanHalf, rowFull)}>
        <FieldLabel>{t('default.content')}</FieldLabel>
        <MonacoEditor
          name={'content'}
          value={content}
          language={language ?? 'plaintext'}
          formRef={form}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-code-${entryId}`}>
          {t('default.code')}
        </FieldLabel>
        <Input
          name="code"
          id={`lorebook-code-${entryId}`}
          defaultValue={code}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input
          name="name"
          id={`lorebook-name-${entryId}`}
          defaultValue={name}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-priority-${entryId}`}>
          {t('default.priority')}
        </FieldLabel>
        <Input
          name="priority"
          type={'number'}
          min={0}
          max={9999}
          id={`lorebook-priority-${entryId}`}
          defaultValue={priority}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-layer-${entryId}`}>
          {t('default.layer')}
        </FieldLabel>
        <Input
          name="layer"
          type={'number'}
          id={`lorebook-layer-${entryId}`}
          defaultValue={layer}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-role-${entryId}`}>
          {t('lorebook.role')}
        </FieldLabel>
        <Selector
          name={'role'}
          id={`lorebook-role-${entryId}`}
          value={role}
          items={roles}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lorebook-type-${entryId}`}>
          {t('default.type')}
        </FieldLabel>
        <Selector
          name={'type'}
          id={`lorebook-type-${entryId}`}
          value={language}
          onValueChange={setLanguage}
          items={contentTypes}
        />
      </Field>
      <Field>
        <FieldLabel id={`lorebook-match_type-${entryId}`}>
          {t('lorebook.match_type')}
        </FieldLabel>
        <Selector
          id={`lorebook-match_type-${entryId}`}
          items={lorebooks.matchers.registry.sorted()}
          name={'matchType'}
          value={editor}
          onValueChange={setEditor}
          valueAccessor={(u) => u.id}
          labelAccessor={(u) => t(`lorebook.match_type_${u.id}`)}
        />
      </Field>
      {element(editor?.configComponent, { entry })}
    </UpdateForm>
  );
}

export function Content() {
  const { item } = usePresetState();
  if (!item) return null;

  return (
    <PresetEntryList<Lorebook> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}

export const tab: PresetTab = {
  id: main.name,
  hidable: true,
  icon: () => <FileCode2Icon />,
  label: `lorebook.id`,
  content: Content,
};
