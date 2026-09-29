'use client';

import { CircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleIcon />
        </EmptyMedia>
        <EmptyTitle>{t('error.not_catch')}</EmptyTitle>
        <EmptyDescription>{error.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <pre>{error.digest ?? ''}</pre>
        <Button onClick={reset}>{t('default.reset')}</Button>
      </EmptyContent>
    </Empty>
  );
}
