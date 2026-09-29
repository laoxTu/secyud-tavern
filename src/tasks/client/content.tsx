'use client';
import {
  ListChecksIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  dialogs,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  PagedItemList,
  Progress,
  TooltipAlertDialog,
} from '@/components';
import { GlobalMenuItem, GlobalMenuLabel } from '@/global/client';
import { useHandler } from '@/interceptors/client';
import { stories as main } from '@/stories';

import { Task } from '..';

import { useTaskState } from './state';

import { tasks } from '.';

function Content() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch } = useTaskState();
  const [fuzzy, setFuzzy] = useState('');

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
  // TODO 任务进度推送

  return (
    <>
      <form action={applySearch} className={'flex'}>
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
      <PagedItemList<Task>
        entryName={'task.id'}
        itemKey={(u) => u.id}
        usePager={useTaskState}
      >
        {(item) => (
          <>
            <ItemContent>
              <ItemTitle className="truncate">{item.name} </ItemTitle>
              <ItemDescription>
                <Progress
                  value={
                    // TODO item.progress ??
                    0
                  }
                  className="w-[60%]"
                />
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <TooltipAlertDialog
                info={dialogs.info(t, 'delete', 'task.id')}
                onSubmit={handler(async () => {
                  await tasks.proxy.delete(item.id);
                  success(t('message.delete.success'));
                })}
              >
                <Trash2Icon />
              </TooltipAlertDialog>
              <TooltipAlertDialog
                info={dialogs.info(t, 'restart', 'task.id')}
                onSubmit={handler(async () => {
                  await tasks.proxy.restart(item.id);
                  success(t('message.restart.success'));
                })}
              >
                <RotateCcwIcon />
              </TooltipAlertDialog>
            </ItemActions>
          </>
        )}
      </PagedItemList>
    </>
  );
}

export const menu: GlobalMenuItem = {
  id: main.name,
  sequence: -1,
  content: Content,
  label: () => <GlobalMenuLabel name={tasks.name} icon={<ListChecksIcon />} />,
};
