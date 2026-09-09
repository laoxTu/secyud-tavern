'use client';
import { ToolboxIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  element,
  Field,
  FieldLabel,
  Input,
  Selector,
  UpdateForm,
  useFormRef,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { PresetEntry } from '@/presets';
import {
  PresetEntryList,
  PresetEntryUpdate,
  presets,
  PresetTab,
  usePresetState,
} from '@/presets/client';
import { createPresetEntryState } from '@/presets/client/factory';

import { tools as main, Tool } from '..';

import { tools } from '.';

const state = createPresetEntryState<Tool>(main.name, main.default);

function Editor({ entry }: { entry: PresetEntry<Tool> }) {
  const {
    masterId,
    entryType,
    entryId,
    name,
    data: { type },
  } = entry;
  const t = useTranslations();
  const { refresh } = state();
  const { handler, success } = useHandler();
  const [editor, setEditor] = useState(tools.providers.registry.record(type));
  const form = useFormRef();

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data: FormData) => {
        if (!editor) return;
        const entry: Partial<PresetEntry<Tool>> = {
          data: {
            type: editor.id,
            config: {},
          },
          name: data.get('name') as string,
        };
        await editor.configureObject?.(data, entry.data!);
        await presets.proxy.entry.set<Tool>(
          masterId,
          entryType,
          entryId,
          entry,
        );
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor={`macro-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`macro-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-tool_provider-${entry.entryId}`}>
          {t('tool.provider_type')}
        </FieldLabel>
        <Selector
          id={`model-tool_provider-${entry.entryId}`}
          items={tools.providers.registry.sorted()}
          name={'provider'}
          value={editor}
          onValueChange={setEditor}
          valueAccessor={(u) => u.id}
          labelAccessor={(u) => t(`tool.provider.${u.id}`)}
        />
      </Field>
      {element(editor?.configComponent, { entry, formRef: form })}
    </UpdateForm>
  );
}

function Content() {
  const { item } = usePresetState();
  if (!item) return null;

  return (
    <PresetEntryList<Tool> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor key={`${entry.masterId}-${entry.entryId}`} entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}

export const tab: PresetTab = {
  id: main.name,
  hidable: true,
  icon: () => <ToolboxIcon />,
  label: `tool.id`,
  content: Content,
};
