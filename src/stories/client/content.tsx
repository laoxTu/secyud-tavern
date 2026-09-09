'use client';
import {
  BookOpenIcon,
  ClipboardPasteIcon,
  CornerDownLeftIcon,
  FileIcon,
  SearchIcon,
  SquarePlusIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import {
  Button,
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
  FieldLabel,
  IconTooltip,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  ItemContent,
  ItemDescription,
  ItemTitle,
  MainResizeable,
  PagedItemList,
  Tabs,
  TabsList,
  TabsTrigger,
  TooltipDialog,
  UpdateForm,
  useFormRef,
  useTabs,
} from '@/components';
import { GlobalMenuItem, GlobalMenuLabel } from '@/global/client';
import { BusinessError } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { ModelNameValueField } from '@/models/client';
import { getRegistry, Registerable } from '@/plugins';
import { PresetNameValuesField } from '@/presets/client';
import { stories as main, Story, StoryEntryClipboard } from '@/stories';
import { jsonUtils } from '@/utils';

import { useStoryState } from './state';

import { stories } from '.';

export interface StoryTab extends Registerable {
  icon: React.ComponentType;
  label: string;
  content: React.ComponentType;
  hidable?: boolean;
}

export const tabs = getRegistry<StoryTab>('story-tabs');

function PropertyTab() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { item, setItem } = useStoryState();
  const form = useFormRef();

  if (!item) return null;

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data: FormData) => {
        const { id } = await stories.proxy.update(item.id, {
          name: data.get('name') as string,
          presets: combobox.getAll(data, 'preset'),
          model: combobox.get(data, 'model'),
        });
        success(t('message.update.success'));
        await setItem(id);
      })}
    >
      <Field>
        <FieldLabel htmlFor={`story-name`}>{t('default.name')}</FieldLabel>
        <Input name="name" id={`story-name`} defaultValue={item.name} />
      </Field>
      <ModelNameValueField value={item.model} name={'model'} />
      <PresetNameValuesField value={item.presets} name={'preset'} />
    </UpdateForm>
  );
}

function TabContent() {
  const t = useTranslations();
  const { success, handler } = useHandler();
  const { item, setItem, fetch, tab, setTab } = useStoryState();
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
          tooltip={<ClipboardPasteIcon />}
          onSubmit={handler(async () => {
            const text = await navigator.clipboard.readText();
            const {
              id,
              type,
              entryType,
              entryId,
              entry: { masterId, name },
            }: StoryEntryClipboard = jsonUtils.parse(text);
            if (type !== 'story_entry') {
              throw new BusinessError(
                '[clone] (story entry): data is not fit',
                'error.clipboard_not_fit',
              ).withValue('target', 'story.entry');
            }
            await stories.proxy.entry.clone(id, entryType, entryId, {
              masterId,
              name,
            });
            setTab(entryType);
            await setItem(masterId);
            success(t('message.paste.success'));
          })}
          info={dialogs.info(t, 'paste', 'story.entry')}
        />
        <DeleteDialog
          itemName={`story.id`}
          onDelete={handler(async () => {
            await stories.proxy.delete(item.id);
            await fetch();
            await setItem(useStoryState.getState().items?.at(0)?.id);
            success(t('message.delete.success'));
          })}
        />
        <Button className={'opacity-0'} />
      </div>
      {element(tabs.record(tab)?.content, { key: tab })}
    </>
  );
}

function Content() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch, item, items, setItem } = useStoryState();
  const [fuzzy, setFuzzy] = useState('');
  const router = useRouter();

  const applySearch = handler(async () => {
    await fetch({
      search: () => ({
        fuzzy,
      }),
    });
  });

  const resetSearch = handler(async () => {
    setFuzzy('');
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
              <InputGroup className={'overflow-hidden'}>
                <InputGroupInput
                  name="search"
                  id={`story-search`}
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
                  const { id } = await stories.proxy.create({
                    name: data.get('name') as string,
                    presets: [],
                  });
                  await setItem(id);
                  await fetch();
                  success(t('message.create.success'));
                })}
                info={dialogs.info(t, `create`, `story.id`)}
              >
                <Field>
                  <FieldLabel htmlFor={`story-name`}>
                    {t('default.name') + '*'}
                  </FieldLabel>
                  <Input id={`story-name`} name="name" required />
                </Field>
              </TooltipDialog>
            </div>
          </div>
          <PagedItemList<Story>
            entryName={'story.id'}
            active={(u) => u.id === item?.id}
            itemKey={(u) => u.id}
            onClick={(item) => setItem(item.id)}
            usePager={useStoryState}
          >
            {(item) => (
              <>
                <ItemContent>
                  <ItemTitle className="truncate">
                    {item.name}{' '}
                    <span className="text-muted-foreground">
                      {item.model?.name && ` - ${item.model?.name}`}
                    </span>
                  </ItemTitle>
                  <ItemDescription className={'overflow-hidden'}>
                    {item.id}
                  </ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center">
                  <IconTooltip
                    text={'story.enter'}
                    onClick={handler(async () => {
                      router.push(`/${item.id}`);
                    })}
                  >
                    <CornerDownLeftIcon />
                  </IconTooltip>
                </ItemContent>
              </>
            )}
          </PagedItemList>
        </>
      }
    >
      {item ? (
        <TabContent key={item.id} />
      ) : (
        <EmptySelectContent module={'story.id'} />
      )}
    </MainResizeable>
  );
}

export const property: StoryTab = {
  id: 'property',
  sequence: -1,
  content: PropertyTab,
  icon: FileIcon,
  label: 'default.property',
};

export const menu: GlobalMenuItem = {
  id: main.name,
  sequence: -1,
  content: Content,
  label: () => <GlobalMenuLabel name={stories.name} icon={<BookOpenIcon />} />,
};
