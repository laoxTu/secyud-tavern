'use client';
import {
  ClipboardCopyIcon,
  CopyIcon,
  SearchIcon,
  SquarePlusIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import {
  DeleteDialog,
  dialogs,
  Field,
  FieldLabel,
  IconTooltip,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  PagedItemList,
  TooltipDialog,
} from '@/components';
import { EntryCollapsiable } from '@/components/collapsible';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { StoryEntry, StoryEntryClipboard } from '@/stories';

import { StoryEntryState } from './factory';
import { useStoryState } from './state';

import { stories } from '.';

interface StoryEntryUpdateProps<TData> {
  state: () => StoryEntryState<TData>;
  entry: StoryEntry<TData>;
  children: React.ReactNode;
}

export function StoryEntryUpdate<TData>({
  children,
  state,
  entry,
}: StoryEntryUpdateProps<TData>) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { name, refresh } = state();
  const { masterId, entryType, entryId } = entry;

  return (
    <EntryCollapsiable
      title={entry.name}
      tools={
        <>
          <IconTooltip
            text={'message.copy.tooltip'}
            onClick={handler(async () => {
              const { masterId, entryType, entryId } = entry;
              const json: StoryEntryClipboard = {
                type: 'story_entry',
                // master id
                id: masterId,
                entryId,
                entryType,
                entry,
              };
              await navigator.clipboard.writeText(JSON.stringify(json));
              success(t('message.copy.success'));
            })}
          >
            <ClipboardCopyIcon />
          </IconTooltip>
          <TooltipDialog
            tooltip={<CopyIcon />}
            onSubmit={handler(async (data: FormData) => {
              await stories.proxy.entry.clone<TData>(
                masterId,
                entryType,
                entryId,
                {
                  masterId,
                  name: data.get('name') as string,
                },
              );
              success(t('message.clone.success'));
              await refresh();
            })}
            info={dialogs.info(t, 'clone', `${name}.id`)}
          >
            <Field>
              <FieldLabel htmlFor={`story-${name}-clone-name`}>
                {t('default.name') + '*'}
              </FieldLabel>
              <Input name={'name'} required id={`story-${name}-clone-name`} />
            </Field>
          </TooltipDialog>
          <DeleteDialog
            onDelete={handler(async () => {
              await stories.proxy.entry.del(masterId, entryType, entryId);
              await refresh();
            })}
            itemName={`${name}.id`}
          />
        </>
      }
    >
      {children}
    </EntryCollapsiable>
  );
}

interface StoryEntryListProps<TData> {
  state: () => StoryEntryState<TData>;
  className?: string;
  children: (entry: StoryEntry<TData>) => React.ReactNode;
}

export function StoryEntryList<TData>({
  children,
  state,
  className,
}: StoryEntryListProps<TData>) {
  const t = useTranslations();
  const { item } = useStoryState();
  const { handler } = useHandler();
  const { refresh, name, defaultData } = state();
  const [filter, setFilter] = useState('');

  if (!item) return null;

  return (
    <div className={'flex-1 flex flex-col'}>
      <div className="flex flex-wrap">
        <form
          action={async (data: FormData) => {
            setFilter(data.get('filter') as string);
            await refresh();
          }}
          className={'flex-1'}
        >
          <InputGroup>
            <InputGroupInput
              name="filter"
              id={`story-entry-filter`}
              placeholder={t('default.search')}
              value={filter}
            />
            <InputGroupAddon align={'inline-end'}>
              <InputGroupButton
                onClick={async () => {
                  setFilter('');
                  await refresh();
                }}
              >
                <XIcon />
              </InputGroupButton>
              <InputGroupButton type="submit">
                <SearchIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
        <TooltipDialog
          tooltip={<SquarePlusIcon />}
          onSubmit={handler(async (data: FormData) => {
            await stories.proxy.entry.add<TData>(item.id, name, {
              name: data.get('name') as string,
              data: defaultData,
            });
            await refresh();
          })}
          info={dialogs.info(t, 'create', `${name}.id`)}
        >
          <Field>
            <FieldLabel htmlFor={`story-${name}-create-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input name={'name'} required id={`story-${name}-create-name`} />
          </Field>
        </TooltipDialog>
      </div>

      <div className={cn('flex-1 flex flex-col', className)}>
        <PagedItemList
          custom
          id={item.id}
          entryName={`${name}.id`}
          itemKey={(item) => item.entryId}
          className={'flex'}
          usePager={state}
        >
          {children}
        </PagedItemList>
      </div>
    </div>
  );
}
