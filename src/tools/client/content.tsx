'use client';
import { ToolboxIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  element,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  UpdateForm,
  useFormRef,
} from '@/components';
import { forms } from '@/global';
import { handler, success } from '@/interceptors/client';
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
    data: { type, macro },
  } = entry;
  const t = useTranslations();
  const { refresh } = state();

  const [editor, setEditor] = useState(tools.providers.registry.record(type));
  const form = useFormRef();

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data) => {
        if (!editor) return;
        const entry: Partial<PresetEntry<Tool>> = {
          data: {
            macro: forms.str(data, 'macro'),
            type: editor.id,
            config: {},
          },
          name: forms.str(data, 'name'),
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
        <FieldLabel htmlFor={`tool-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`tool-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`tool-macro-${entryId}`}>
          {t('tool.bind_macro')}
        </FieldLabel>
        <FieldContent>
          <Input
            name="macro"
            id={`tool-macro-${entryId}`}
            defaultValue={macro}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-tool_provider-${entry.entryId}`}>
          {t('tool.provider_type')}
        </FieldLabel>
        <Combobox
          id={`model-tool_provider-${entry.entryId}`}
          items={tools.providers.registry.sorted()}
          isItemEqualToValue={(l, r) => l.id === r.id}
          itemToStringLabel={(u) => t(`tool.provider.${u.id}`)}
          value={editor}
          onValueChange={setEditor}
        >
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxEmpty>{t('default.empty_items')}</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item}>
                  {t(`tool.provider.${item.id}`)}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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
