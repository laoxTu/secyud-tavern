'use client';
import { BrainIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Field,
  FieldLabel,
  Input,
  rowHalf,
  Selector,
  spanHalf,
  submitTargetFormOnKey,
  TagBox,
  Textarea,
  UpdateForm,
} from '@/components';
import { forms } from '@/global';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { StoryEntry } from '@/stories';
import { stories, StoryEntryList, StoryEntryUpdate } from '@/stories/client';
import { StoryTab } from '@/stories/client/content';
import { createStoryEntryState } from '@/stories/client/factory';
import { useStoryState } from '@/stories/client/state';

import { memories as main, Memory } from '..';

const state = createStoryEntryState<Memory>(main.name, main.default);

function Editor({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { text, sequence, type, importance, tags },
  },
}: {
  entry: StoryEntry<Memory>;
}) {
  const t = useTranslations();
  const { refresh } = state();
  const { handler, success } = useHandler();

  return (
    <UpdateForm
      onSubmit={handler(async (data) => {
        await stories.proxy.entry.set<Memory>(masterId, entryType, entryId, {
          data: {
            text: forms.str(data, 'text'),
            sequence: forms.int(data, 'sequence'),
            importance: forms.int(data, 'importance'),
            type: forms.str(data, 'type'),
            tags: forms.strs(data, 'tag'),
          },
          name: forms.str(data, 'name'),
        });
        await refresh();
        success(t('message.update.success'));
      })}
    >
      <Field className={cn(spanHalf, rowHalf)}>
        <FieldLabel htmlFor={`memory-text-${entryId}`}>
          {t('memory.text')}
        </FieldLabel>
        <Textarea
          name="text"
          id={`memory-text-${entryId}`}
          defaultValue={text}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`memory-name-${entryId}`}>
          {t('default.name')}
        </FieldLabel>
        <Input name="name" id={`memory-name-${entryId}`} defaultValue={name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`memory-sequence-${entryId}`}>
          {t('memory.sequence')}
        </FieldLabel>
        <Input
          name="sequence"
          type={'number'}
          min={0}
          step={1}
          id={`memory-sequence-${entryId}`}
          defaultValue={sequence}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`memory-importance-${entryId}`}>
          {t('memory.importance')}
        </FieldLabel>
        <Input
          name="importance"
          type={'number'}
          min={1}
          step={1}
          max={10}
          id={`memory-importance-${entryId}`}
          defaultValue={importance}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`memory-type-${entryId}`}>
          {t('default.type')}
        </FieldLabel>
        <Selector
          id={`memory-type-${entryId}`}
          items={main.types}
          name={'type'}
          value={type}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`memory-tag-${entryId}`}>
          {t('default.tags')}
        </FieldLabel>
        <TagBox id={`memory-tag-${entryId}`} name={'tag'} value={tags} />
      </Field>
    </UpdateForm>
  );
}

function Content() {
  const { item } = useStoryState();
  if (!item) return null;

  return (
    <StoryEntryList<Memory> state={state}>
      {(entry) => (
        <StoryEntryUpdate entry={entry} state={state}>
          <Editor key={`${entry.masterId}-${entry.entryId}`} entry={entry} />
        </StoryEntryUpdate>
      )}
    </StoryEntryList>
  );
}

export const storyTab: StoryTab = {
  id: main.name,
  hidable: true,
  icon: BrainIcon,
  label: 'memory.id',
  content: Content,
};
