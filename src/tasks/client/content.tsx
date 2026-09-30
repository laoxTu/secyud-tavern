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
  TooltipDialog,
} from '@/components';
import { GlobalMenuItem, GlobalMenuLabel } from '@/global/client';
import { handler, success } from '@/interceptors/client';
import { useSse } from '@/signal/client';

import { tasks as main, Task, TaskProgress } from '..';

import { useTaskState } from './state';

import { tasks } from '.';

function Content() {
  const t = useTranslations();

  const { fetch } = useTaskState();
  const [fuzzy, setFuzzy] = useState('');
  const [progresses, setPregresses] = useState<Record<string, number>>({});

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

  useSse<TaskProgress>('task_progress', (target, data) => {
    setPregresses((u) => ({ ...u, [target]: data.progress }));
  });

  return (
    <div className="flex flex-col h-full">
      <form action={applySearch} className={'flex'}>
        <InputGroup>
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
        {(item) => {
          const progress = progresses[item.id];
          return (
            <>
              <ItemContent>
                <ItemTitle className="truncate">{item.name} </ItemTitle>
                <ItemDescription>
                  {progress === undefined || item.status !== 'running' ? (
                    t(`task.${item.status}`)
                  ) : (
                    <Progress value={progress} className="w-[60%]" />
                  )}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <TooltipAlertDialog
                  info={dialogs.info(t, 'delete', 'task.id')}
                  onSubmit={handler(async () => {
                    await tasks.proxy.delete(item.id);
                    success(t('message.delete.success'));
                    await fetch();
                  })}
                >
                  <Trash2Icon />
                </TooltipAlertDialog>
                <TooltipDialog
                  tooltip={<RotateCcwIcon />}
                  info={dialogs.info(t, 'restart', 'task.id')}
                  onSubmit={handler(async () => {
                    await tasks.proxy.restart(item.id);
                    success(t('message.restart.success'));
                    await fetch();
                  })}
                />
              </ItemActions>
            </>
          );
        }}
      </PagedItemList>
    </div>
  );
}

export const menu: GlobalMenuItem = {
  id: main.name,
  sequence: 1000,
  content: Content,
  label: () => <GlobalMenuLabel name={tasks.name} icon={<ListChecksIcon />} />,
};
