'use client';
import { FilesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { create } from 'zustand';

import {
  DeleteDialog,
  Item,
  ItemActions,
  ItemHeader,
  LinkTooltip,
  PagedItemList,
} from '@/components';
import { FetchState } from '@/database/client';
import { states } from '@/database/client/factory';
import { FileModel, FileRequestParam, files as main } from '@/files';
import { files } from '@/files/client';
import { GlobalMenuItem, GlobalMenuLabel } from '@/global/client';
import { useHandler } from '@/interceptors/client';

interface FileState extends FetchState<FileModel, FileRequestParam> {}

const useFileState = create<FileState>((set, get) => ({
  cur: 0,
  loading: false,
  size: 7,
  max: 0,
  fetch: states.createFetch<FileModel, FileRequestParam>(
    set,
    get,
    async (request) => {
      return await files.proxy.list(request);
    },
  ),
  refresh: (options) => get().fetch(options),
}));

function ContentHeader({ file: { id, type } }: { file: FileModel }) {
  const source = files.proxy.url(id);
  if (type.startsWith('image')) {
    return (
      <Image
        src={source}
        alt={id}
        width={100}
        height={100}
        className="w-full h-auto"
      />
    );
  } else if (type.startsWith('video')) {
    return (
      <video
        src={source}
        controls
        preload="metadata"
        className="object-cover rounded-sm aspect-square"
      />
    );
  }

  return (
    <Image
      src={'favicon.svg'}
      alt={id}
      width={100}
      height={100}
      className="w-full h-auto rounded-sm"
    />
  );
}

function ContentItem({ file }: { file: FileModel }) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch } = useFileState();
  const source = files.proxy.url(file.id);

  return (
    <div className={'min-w-1/4 w-96 h-auto p-2'}>
      <Item className={'relative sc-dc'} variant={'outline'}>
        <ItemHeader>
          <ContentHeader file={file} />
        </ItemHeader>
        <ItemActions
          className={`absolute top-4 right-4 rounded bg-white/70 sc-dc-flex`}
        >
          {source && <LinkTooltip href={source} />}
          <DeleteDialog
            onDelete={handler(async () => {
              await files.proxy.delete(file.id);
              success(t('message.delete.success'));
              await fetch();
            })}
            itemName={`file.id`}
          />
        </ItemActions>
      </Item>
    </div>
  );
}

export function Content() {
  return (
    <div className={'h-full overflow-hidden flex flex-col'}>
      <PagedItemList<FileModel>
        custom
        entryName={'file.id'}
        className={'flex flex-wrap items-start'}
        usePager={useFileState}
      >
        {(item) => <ContentItem file={item} />}
      </PagedItemList>
    </div>
  );
}

export const menu: GlobalMenuItem = {
  id: main.name,
  sequence: 999,
  label: () => <GlobalMenuLabel name={main.name} icon={<FilesIcon />} />,
  content: Content,
};
