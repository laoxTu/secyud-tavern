'use client';
import { FilesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { create } from 'zustand';

import {
  AspectRatio,
  AutoMedia,
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
  size: 10,
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

function ContentItem({ file }: { file: FileModel }) {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch } = useFileState();

  return (
    <Item
      variant={'outline'}
      className={'min-w-1/5 w-64 overflow-hidden relative sc-dc'}
    >
      <ItemHeader>
        <AspectRatio className={'w-full'} ratio={1}>
          <AutoMedia
            filename={file.id}
            type={file.type}
            className={'object-cover aspect-square'}
          />
        </AspectRatio>
      </ItemHeader>
      <ItemActions
        className={`absolute top-4 right-4 rounded bg-white/70 sc-dc-flex`}
      >
        {file.id && <LinkTooltip href={file.id} />}
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
