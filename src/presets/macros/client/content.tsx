import { useTranslations } from 'next-intl';

import {
  Checkbox,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  rowHalf,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
  UpdateForm,
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

import { Macro, macros as main } from '..';

const state = createPresetEntryState<Macro>(main.name, main.default);

function Editor({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { key, multiple, hidden, value, code },
  },
}: {
  entry: PresetEntry<Macro>;
}) {
  const t = useTranslations();
  const { refresh } = state();
  const { handler, success } = useHandler();

  return (
    <UpdateForm
      onSubmit={handler(async (data: FormData) => {
        await presets.proxy.entry.set<Macro>(masterId, entryType, entryId, {
          data: {
            key: data.get('key') as string,
            code: data.get('code') as string,
            value: data.get('value') as string,
            multiple: !!data.get('multiple'),
            hidden: !!data.get('hidden'),
          },
          name: data.get('name') as string,
        });
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor={`macro-code-${entryId}`}>
          {t('default.code')}
        </FieldLabel>
        <Input
          name="code"
          pattern={checker.code}
          id={`macro-code-${entryId}`}
          defaultValue={code}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`macro-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`macro-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field className={cn(spanHalf, rowHalf)}>
        <FieldLabel htmlFor={`macro-value-${entryId}`}>
          {t('macro.value')}
        </FieldLabel>
        <Textarea
          name="value"
          id={`macro-value-${entryId}`}
          defaultValue={value}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`macro-key-${entryId}`}>
          {t('macro.key')}
        </FieldLabel>
        <Input
          name="key"
          pattern={checker.code}
          id={`macro-key-${entryId}`}
          defaultValue={key}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`macro-multiple-${entryId}`}>
          {t('macro.multiple')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name="multiple"
            id={`macro-multiple-${entryId}`}
            defaultChecked={multiple}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`macro-hidden-${entryId}`}>
          {t('default.hidden')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name="hidden"
            id={`macro-hidden-${entryId}`}
            defaultChecked={hidden ?? false}
          />
        </FieldContent>
      </Field>
    </UpdateForm>
  );
}

export function Content() {
  const { item } = usePresetState();
  if (!item) return null;

  return (
    <PresetEntryList<Macro> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}
