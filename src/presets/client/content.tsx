'use client';
import {
  ClipboardPasteIcon,
  CopyIcon,
  FileDownIcon,
  FileIcon,
  FileSlidersIcon,
  FileUpIcon,
  SearchIcon,
  SquareArrowRightEnterIcon,
  SquarePlusIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import {
  Button,
  Checkbox,
  combobox,
  DeleteDialog,
  dialogs,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  element,
  EmptySelectContent,
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  IconTooltip,
  ImageUploader,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  MainResizeable,
  MonacoEditor,
  PagedItemList,
  rowHalf,
  rowQuat,
  spanHalf,
  submitTargetFormOnKey,
  Tabs,
  TabsList,
  TabsTrigger,
  TagBox,
  Textarea,
  TextTooltip,
  TooltipDialog,
  UpdateForm,
  useFormRef,
  useImageUploaderState,
  useTabs,
} from '@/components';
import { NameValue } from '@/database';
import { files } from '@/files/client';
import { GlobalMenuItem, GlobalMenuLabel } from '@/global/client';
import { BusinessError, checker } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { useModelSettingState } from '@/models/client';
import { getRegistry, Registerable } from '@/plugins';
import { Preset, PresetEntryClipboard } from '@/presets';
import {
  PresetNameValuesField,
  presets,
  usePresetState,
} from '@/presets/client';
import { stories } from '@/stories/client';
import { jsonUtils } from '@/utils';

export interface PresetTab extends Registerable {
  icon: React.ComponentType;
  label: string;
  content: React.ComponentType;
  hidable?: boolean;
}

export const tabs = getRegistry<PresetTab>('preset-tabs');

function ImportDialog() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const [imports, setImports] = useState<NameValue[]>([]);
  const [actives, setActives] = useState<Record<string, boolean>>({});
  const sessionIdRef = useRef<string>('');
  const { fetch, setItem } = usePresetState();

  const handleDialog = async () => {
    setImports([]);
    setActives({});
  };

  const handlePrepare = handler(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { sessionId, nameValues } =
        await presets.proxy.import.prepare(file);
      setImports(nameValues);
      setActives(Object.fromEntries(nameValues.map((u) => [u.value, true])));
      sessionIdRef.current = sessionId;
    }
  });

  const handleConfirm = handler(async () => {
    const { id } = await presets.proxy.import.confirm(
      sessionIdRef.current,
      Object.entries(actives)
        .filter((u) => u[1])
        .map((u) => u[0]),
    );
    await setItem(id);
    await fetch();
    success(t('message.import.success'));
  });

  return (
    <TooltipDialog
      tooltip={<FileDownIcon />}
      info={dialogs.info(t, `import`, `preset.id`)}
      onOpen={handleDialog}
      onSubmit={handleConfirm}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`preset-filename`}>
            {t('default.name')}
          </FieldLabel>
          <Input
            id={`preset-filename`}
            name="filename"
            type="file"
            accept={'.json,.png'}
            onChange={handlePrepare}
            required
          />
        </Field>
      </FieldGroup>
      {!!imports.length && (
        <Field>
          {imports.map((u) => (
            <FieldContent key={u.value} className="flex-row">
              <Checkbox
                checked={actives[u.value]}
                onCheckedChange={(b) =>
                  setActives({
                    ...actives,
                    [u.value]: b,
                  })
                }
                id={`preset-import-${u.value}`}
              />
              <FieldLabel htmlFor={`preset-import-${u.value}`}>
                {u.name}
              </FieldLabel>
            </FieldContent>
          ))}
        </Field>
      )}
    </TooltipDialog>
  );
}

function TabContent() {
  const t = useTranslations();
  const { success, handler } = useHandler();
  const { item, setItem, fetch, tab, setTab } = usePresetState();
  const router = useRouter();
  const { showTabs, hideTabs } = useTabs(tabs, item);
  if (!item) return null;

  return (
    <>
      <div className={'flex flex-wrap'}>
        <Tabs
          value={tab}
          onValueChange={setTab}
          className={'flex-1 overflow-x-auto scrollbar-none'}
        >
          <TabsList className="justify-normal">
            {showTabs.map((tab) => {
              return (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {element(tab.icon)} {t(tab.label)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        {!!hideTabs?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline">{t('default.more')}</Button>}
            />
            <DropdownMenuContent>
              {hideTabs.map((tab) => {
                return (
                  <DropdownMenuItem key={tab.id} onClick={() => setTab(tab.id)}>
                    {element(tab.icon)} {t(tab.label)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <TooltipDialog
          tooltip={<SquareArrowRightEnterIcon />}
          onSubmit={handler(async () => {
            const model = useModelSettingState.getState().model;
            if (!model) {
              throw new BusinessError(
                'default llmapi is not set.',
                'error.model.default_required',
              );
            }
            const { id } = await stories.proxy.create({
              name: item.name,
              presets: [presets.toNameValue(item)],
              model,
            });
            router.push(`/${id}`);
          })}
          info={dialogs.info(t, 'story_enter', 'preset.id')}
        />
        <IconTooltip
          onClick={handler(async () => {
            await presets.proxy.export(item.id);
          })}
          text={'message.export.tooltip'}
        >
          <FileUpIcon />
        </IconTooltip>
        <TooltipDialog
          tooltip={<CopyIcon />}
          onSubmit={handler(async (data: FormData) => {
            const { id } = await presets.proxy.clone(item.id, {
              name: data.get('name') as string,
              id: data.get('code') as string,
            });
            await setItem(id);
            await fetch();
            success(t('message.clone.success'));
          })}
          info={dialogs.info(t, 'clone', 'preset.id')}
        >
          <Field>
            <FieldLabel htmlFor={`preset-clone-code`}>
              {t('default.code') + '*'}
            </FieldLabel>
            <Input
              id={`preset-clone-code`}
              defaultValue={item.id}
              name="code"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`preset-clone-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input
              id={`preset-clone-name`}
              defaultValue={item.name}
              name="name"
              required
            />
          </Field>
        </TooltipDialog>
        <TooltipDialog
          tooltip={<ClipboardPasteIcon />}
          onSubmit={handler(async () => {
            const text = await navigator.clipboard.readText();
            const {
              id,
              type,
              entryType,
              entryId,
              entry: { masterId, name },
            }: PresetEntryClipboard = jsonUtils.parse(text);
            if (type !== 'preset_entry') {
              throw new BusinessError(
                '[clone] (preset entry): data is not fit',
                'error.clipboard_not_fit',
              ).withValue('target', 'preset.entry');
            }
            await presets.proxy.entry.clone(id, entryType, entryId, {
              masterId,
              name,
            });
            setTab(entryType);
            await setItem(masterId);
            success(t('message.paste.success'));
          })}
          info={dialogs.info(t, 'paste', 'preset.entry')}
        />
        <DeleteDialog
          itemName={`preset.id`}
          onDelete={handler(async () => {
            await presets.proxy.delete(item.id);
            await fetch();
            await setItem(usePresetState.getState().items?.at(0)?.id);
            success(t('message.delete.success'));
          })}
        />
        <Button className={'opacity-0'} />
      </div>
      {element(tabs.record(tab)?.content, { key: tab })}
    </>
  );
}

export function MenuContent() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch, item, items, setItem } = usePresetState();
  const [fuzzy, setFuzzy] = useState('');
  const [tags, setTags] = useState<string[] | null>(null);

  const applySearch = handler(async () => {
    await fetch({
      search: () => ({
        fuzzy,
        tags,
      }),
    });
  });

  const resetSearch = handler(async () => {
    setFuzzy('');
    setTags(null);
    await fetch({
      search: () => ({}),
    });
  });

  useEffect(() => {
    if (!item) {
      handler(async () => {
        await setItem(items?.at(0)?.id);
      })();
    }
  }, [items]);

  return (
    <MainResizeable
      side={
        <>
          <div className="flex">
            <form
              action={applySearch}
              className={'flex flex-col flex-1 overflow-x-auto scrollbar-none'}
            >
              <TagBox
                value={tags}
                onValueChange={setTags}
                name={'tag'}
                placeholder={t('default.tags')}
                items={presets.tags}
              />
              <InputGroup className={'overflow-hidden'}>
                <InputGroupInput
                  name="search"
                  id={`preset-search`}
                  placeholder={t('default.search')}
                  value={fuzzy}
                  onChange={(e) => setFuzzy(e.target.value)}
                ></InputGroupInput>
                <InputGroupAddon align={'inline-end'}>
                  <InputGroupButton onClick={resetSearch}>
                    <XIcon />
                  </InputGroupButton>
                  <InputGroupButton type="submit">
                    <SearchIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
            <div className={'flex flex-col'}>
              <TooltipDialog
                tooltip={<SquarePlusIcon />}
                onSubmit={handler(async (data: FormData) => {
                  const { id } = await presets.proxy.create({
                    version: '1.0.0',
                    id: data.get('code') as string,
                    name: data.get('name') as string,
                    requires: [],
                    tags: [],
                  });
                  await setItem(id);
                  await fetch();
                  success(t('message.create.success'));
                })}
                info={dialogs.info(t, `create`, `preset.id`)}
              >
                <Field>
                  <FieldLabel htmlFor={`preset-code`}>
                    {t('default.code') + '*'}
                  </FieldLabel>
                  <Input id={`preset-code`} name="code" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`preset-name`}>
                    {t('default.name') + '*'}
                  </FieldLabel>
                  <Input id={`preset-name`} name="name" required />
                </Field>
              </TooltipDialog>
              <ImportDialog />
            </div>
          </div>
          <PagedItemList<Preset>
            entryName={'preset.id'}
            active={(u) => u.id === item?.id}
            itemKey={(u) => u.id}
            onClick={(item) => setItem(item.id)}
            usePager={usePresetState}
          >
            {(item) => {
              const cover = files.proxy.url(item.cover);
              return (
                <>
                  <ItemMedia variant={'image'}>
                    <Image
                      src={cover ? cover : 'favicon.svg'}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">
                      {item.name} -{' '}
                      <span className="text-muted-foreground">{item.id}</span>
                    </ItemTitle>
                    <ItemDescription>
                      <TextTooltip text={item.description} len={10} />
                    </ItemDescription>
                  </ItemContent>
                  <ItemContent className="flex-none text-center">
                    <ItemDescription>{item.version}</ItemDescription>
                  </ItemContent>
                </>
              );
            }}
          </PagedItemList>
        </>
      }
    >
      {item ? (
        <TabContent key={item.id} />
      ) : (
        <EmptySelectContent module={'preset.id'} />
      )}
    </MainResizeable>
  );
}

function PropertyTab() {
  const t = useTranslations();
  const { onFileChange, getImageFileId } = useImageUploaderState('cover');
  const { handler, success } = useHandler();
  const { item, setItem, refresh } = usePresetState();
  const form = useFormRef();

  if (!item) return null;

  return (
    <UpdateForm
      id={item.id}
      form={form}
      onSubmit={handler(async (data: FormData) => {
        const coverId = await getImageFileId(data);
        const cover = coverId ? coverId : (data.get('cover_src') as string);
        const { id } = await presets.proxy.update(item.id, {
          id: data.get('code') as string,
          name: data.get('name') as string,
          cover,
          version: data.get('version') as string,
          description: data.get('description') as string,
          opening: data.get('opening') as string,
          variables: checker.validJsonOrEmpty(
            (data.get('variables') as string)?.trim(),
          ),
          requires: combobox.getAll(data, 'require'),
          tags: data.getAll('tag') as string[],
        });
        success(t('message.update.success'));
        await setItem(id);
        await refresh();
      })}
    >
      <Field className={rowHalf}>
        <FieldLabel htmlFor={`preset-cover-image`}>
          {t('default.cover')}
        </FieldLabel>
        <ImageUploader
          id={`preset-cover-image`}
          name="cover-image`"
          className={'pr-2'}
          accept={'image/png'}
          value={files.proxy.url(item.cover)}
          onChange={onFileChange}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`preset-code`}>{t('default.code')}</FieldLabel>
        <Input
          name="code"
          id={`preset-code`}
          pattern={checker.code}
          defaultValue={item.id}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`preset-name`}>{t('default.name')}</FieldLabel>
        <Input name="name" id={`preset-name`} defaultValue={item.name} />
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`preset-description`}>
          {t('default.description')}
        </FieldLabel>
        <Textarea
          name="description"
          id={`preset-description`}
          defaultValue={item.description}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <PresetNameValuesField name={'require'} value={item?.requires} />
      <Field>
        <FieldLabel htmlFor={`preset-version`}>
          {t('default.version')}
        </FieldLabel>
        <Input
          name="version"
          id={`preset-version`}
          defaultValue={item.version}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`preset-cover_src`}>
          {t('default.cover_src')}
        </FieldLabel>
        <Input
          name="cover_src"
          id={`preset-cover_src`}
          defaultValue={item.cover}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`preset-tags`}>{t('default.tags')}</FieldLabel>
        <TagBox
          id={`preset-tags`}
          name={'tag'}
          value={item.tags}
          items={presets.tags}
        />
      </Field>
      <Field className={spanHalf}>
        <FieldLabel>{t('default.variables')}</FieldLabel>
        <MonacoEditor
          name={'variables'}
          value={item.variables}
          language={'json'}
          formRef={form}
        />
      </Field>
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`preset-opening`}>
          {t('preset.opening')}
        </FieldLabel>
        <Textarea
          name="opening"
          id={`preset-opening`}
          defaultValue={item.opening}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
    </UpdateForm>
  );
}

export const property: PresetTab = {
  id: 'property',
  sequence: -1,
  content: PropertyTab,
  icon: FileIcon,
  label: 'default.property',
};
export const menu: GlobalMenuItem = {
  id: 'preset',
  content: MenuContent,
  label: () => (
    <GlobalMenuLabel name={presets.name} icon={<FileSlidersIcon />} />
  ),
};
