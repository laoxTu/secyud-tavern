import { FileTextIcon, FolderOpenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '.';

export function EmptySelectContent({ module }: { module: string }) {
  const t = useTranslations();
  return (
    <div className={'flex h-full pb-24'}>
      <Empty className={'m-auto'}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>
            {t('message.empty_select.title', { target: t(module) })}
          </EmptyTitle>
          <EmptyDescription>
            {t('message.empty_select.desc', { target: t(module) })}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

export function EmptyEntries({ module }: { module: string }) {
  const t = useTranslations();

  return (
    <Empty className={'m-auto'}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>
          {t('message.empty.title', { target: t(module) })}
        </EmptyTitle>
        <EmptyDescription>
          {t('message.empty.desc', { target: t(module) })}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
