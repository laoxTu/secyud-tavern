import { useTranslations } from 'next-intl';

import {
  Field,
  FieldLabel,
  Input,
  rowHalf,
  Selector,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
  UpdateForm,
} from '@/components';
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

import { regexes as main, Regex } from '..';

const targets = ['both', 'input', 'output'];

const state = createPresetEntryState<Regex>(main.name, main.default);
function Editor({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { target, pattern, replacement },
  },
}: {
  entry: PresetEntry<Regex>;
}) {
  const t = useTranslations();
  const { refresh } = state();
  const { handler, success } = useHandler();

  return (
    <UpdateForm
      onSubmit={handler(async (data: FormData) => {
        await presets.proxy.entry.set<Regex>(masterId, entryType, entryId, {
          data: {
            target: data.get('target') as string,
            pattern: data.get('pattern') as string,
            replacement: data.get('replacement') as string,
          },
          name: data.get('name') as string,
        });
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor={`regex-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`regex-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`regex-target-${entryId}`}>
          {t('regex.target')}
        </FieldLabel>
        <Selector
          name={'target'}
          id={`regex-target-${entryId}`}
          defaultValue={target}
          items={targets}
          labelAccessor={(e) => t(`regex.target_${e}`)}
        />
      </Field>
      <Field className={cn(spanHalf, rowHalf)}>
        <FieldLabel htmlFor={`regex-replacement-${entryId}`}>
          {t('regex.replacement')}
        </FieldLabel>
        <Textarea
          name="replacement"
          id={`regex-replacement-${entryId}`}
          defaultValue={replacement}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`regex-pattern-${entryId}`}>
          {t('regex.pattern')}
        </FieldLabel>
        <Input
          name="pattern"
          id={`regex-pattern-${entryId}`}
          defaultValue={pattern}
        />
      </Field>
    </UpdateForm>
  );
}

export function Content() {
  const { item } = usePresetState();
  if (!item) return null;

  return (
    <PresetEntryList<Regex> state={state}>
      {(entry) => (
        <PresetEntryUpdate entry={entry} state={state}>
          <Editor entry={entry} />
        </PresetEntryUpdate>
      )}
    </PresetEntryList>
  );
}
