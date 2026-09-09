'use client';
import {
  ClipboardCopyIcon,
  CopyIcon,
  PlayIcon,
  PlayOffIcon,
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
  RemoteSearchCombobox,
  spanHalf,
  TooltipDialog,
} from '@/components';
import { EntryCollapsiable } from '@/components/collapsible';
import { DataRequest, NameValue, utils } from '@/database';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { PresetEntry, PresetEntryClipboard } from '@/presets';
import { usePresetState } from '@/presets/client';

import { PresetEntryState } from './factory';

import { presets } from '.';

interface PresetNameValuesFieldProps {
  value?: NameValue[];
  name: string;
}

export function PresetNameValuesField({
  value: defaultValue,
  name,
}: PresetNameValuesFieldProps) {
  const t = useTranslations();
  const { handler } = useHandler();
  return (
    <Field className={spanHalf}>
      <FieldLabel htmlFor={`${name}-presets`}>
        {t('default.requires')}
      </FieldLabel>
      <RemoteSearchCombobox
        multiple
        value={defaultValue}
        name={name}
        id={`${name}-presets`}
        fetcher={handler(
          async (request: DataRequest, fuzzy?: string | null) => {
            const data = await presets.proxy.list({
              ...request,
              search: { fuzzy },
            });
            return utils.mapData(data, presets.toNameValue);
          },
        )}
      />
    </Field>
  );
}

interface PresetEntryUpdateProps<TData> {
  entry: PresetEntry<TData>;
  children: React.ReactNode;
  state: () => PresetEntryState<TData>;
}

export function PresetEntryUpdate<TData>({
  children,
  state,
  entry,
}: PresetEntryUpdateProps<TData>) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { name, refresh } = state();

  const { masterId, entryType, entryId, disabled } = entry;
  return (
    <EntryCollapsiable
      title={entry.name}
      tools={
        <>
          <IconTooltip
            text={disabled ? 'default.disable_item' : 'default.enable_item'}
            onClick={handler(async () => {
              await presets.proxy.entry.set<TData>(
                entry.masterId,
                entry.entryType,
                entry.entryId,
                {
                  disabled: !disabled,
                },
              );
              success(
                t(disabled ? 'default.enable_item' : 'default.disable_item'),
              );
              await refresh();
            })}
          >
            {disabled ? (
              <PlayOffIcon color={'red'} />
            ) : (
              <PlayIcon color={'green'} />
            )}
          </IconTooltip>
          <IconTooltip
            text={'message.copy.tooltip'}
            onClick={handler(async () => {
              const json: PresetEntryClipboard = {
                type: 'preset_entry',
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
              const { masterId, entryType, entryId } = entry;
              await presets.proxy.entry.clone<TData>(
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
              <FieldLabel htmlFor={`preset-${name}-clone-name`}>
                {t('default.name') + '*'}
              </FieldLabel>
              <Input name={'name'} required id={`preset-${name}-clone-name`} />
            </Field>
          </TooltipDialog>
          <DeleteDialog
            onDelete={handler(async () => {
              const { masterId, entryType, entryId } = entry;
              await presets.proxy.entry.del(masterId, entryType, entryId);
              success(t('message.delete.success'));
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

interface PresetEntryListProps<TData> {
  state: () => PresetEntryState<TData>;
  className?: string;
  children: (entry: PresetEntry<TData>) => React.ReactNode;
}

export function PresetEntryList<TData>({
  state,
  children,
  className,
}: PresetEntryListProps<TData>) {
  const t = useTranslations();
  const { item } = usePresetState();
  const { refresh, name, defaultData } = state();
  const { handler } = useHandler();
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
              id={`preset-entry-filter`}
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
            await presets.proxy.entry.add<TData>(item.id, name, {
              name: data.get('name') as string,
              disabled: false,
              data: defaultData,
            });
            await refresh();
          })}
          info={dialogs.info(t, 'create', `${name}.id`)}
        >
          <Field>
            <FieldLabel htmlFor={`preset-${name}-create-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input name={'name'} required id={`preset-${name}-create-name`} />
          </Field>
        </TooltipDialog>
      </div>
      <div className={cn('flex-1 flex flex-col', className)}>
        <PagedItemList
          custom
          id={item.id}
          entryName={`${name}.id`}
          className={'flex'}
          itemKey={(item) => item.entryId}
          usePager={state}
        >
          {children}
        </PagedItemList>
      </div>
    </div>
  );
}
