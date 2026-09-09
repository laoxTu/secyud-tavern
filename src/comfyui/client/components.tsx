'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { ComfyUIModel } from '@/comfyui';
import { comfyuis } from '@/comfyui/client';
import {
  Badge,
  Field,
  FieldContent,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Orientation,
  RemoteSearchCombobox,
} from '@/components';
import { DataRequest, NameValue, utils } from '@/database';
import { files } from '@/files/client';
import { useHandler } from '@/interceptors/client';

interface ComfyUIModelHoverableItemProps {
  id: string;
  path: string;
  setItem?: (item: ComfyUIModel) => void;
  children?: (item: ComfyUIModel) => React.ReactNode;
}

export function ComfyUIModelHoverableItem({
  id,
  path,
  setItem: changeItem,
  children,
}: ComfyUIModelHoverableItemProps) {
  const [item, setItem] = useState<ComfyUIModel | null>(null);
  const { handler } = useHandler();
  useEffect(() => {
    handler(async () => {
      const model = await comfyuis.proxy.model.cache(id);
      setItem(model);
      changeItem?.(model);
    })();
  }, []);

  if (!item)
    return (
      <HoverCard>
        <HoverCardTrigger>{path}</HoverCardTrigger>
        <HoverCardContent className={'bg-card w-full'}>
          <div>{path}</div>
        </HoverCardContent>
      </HoverCard>
    );

  const source = files.proxy.url(item.cover);
  return (
    <HoverCard>
      <HoverCardTrigger className={'w-full'}>
        {children?.(item) ?? `${item.path}(${item.model}-${item.name})`}
      </HoverCardTrigger>
      <HoverCardContent
        className={
          'bg-card relative overflow-auto w-96 max-h-96 [&_a]:text-blue-600 wrap-break-word'
        }
      >
        {source &&
          (source.endsWith('mp4') ? (
            <video
              src={source}
              controls
              preload="metadata"
              className="object-contain w-full"
            />
          ) : (
            <img
              src={source}
              alt={item.name}
              className="object-contain w-full"
            />
          ))}
        <div>{item.code}</div>
        <div>{item.name}</div>
        {item.url && <Link href={item.url}>{item.url}</Link>}
        {item.html && (
          <div
            className={'max-w-96'}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        )}

        <div className={'absolute top-4 left-3.5 flex flex-col gap-2'}>
          <Badge variant="secondary">{item.type}</Badge>
          <Badge variant="secondary">{item.model}</Badge>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function ComfyUIModelSelector({
  types,
  defaultValue,
  id,
  name,
}: {
  types: string[];
  name: string;
  id?: string;
  defaultValue?: NameValue;
}) {
  const { handler } = useHandler();
  return (
    <>
      <RemoteSearchCombobox
        name={name}
        id={id}
        value={defaultValue}
        itemRender={(u) => (
          <ComfyUIModelHoverableItem path={u.name} id={u.value} />
        )}
        fetcher={handler(
          async (request: DataRequest, search?: string | null) => {
            const data = await comfyuis.proxy.model.list({
              ...request,
              search: {
                fuzzy: search ?? undefined,
                types,
              },
            });
            return utils.mapData(data, comfyuis.model.toNameValue);
          },
        )}
      />
    </>
  );
}

interface ComfyUIWorkflowNameValueFieldProps {
  value?: NameValue | null;
  onValueChange?: (value: NameValue | null) => void;
  name?: string;
  className?: string;
  orientation?: Orientation;
}

export function ComfyUIWorkflowNameValueField({
  name,
  className,
  orientation,
  value: defaultValue,
  onValueChange,
}: ComfyUIWorkflowNameValueFieldProps) {
  const t = useTranslations();
  const { handler } = useHandler();
  return (
    <Field orientation={orientation} className={className}>
      <FieldLabel style={{ flex: 0 }} htmlFor={`${name}-workflow`}>
        {t('comfyui.workflow.id')}
      </FieldLabel>
      <FieldContent className="flex-1">
        <RemoteSearchCombobox
          name={name}
          id={`${name}-workflow`}
          onValueChange={onValueChange}
          value={defaultValue}
          fetcher={handler(async (request, search) => {
            const data = await comfyuis.proxy.workflow.list({
              ...request,
              search: { fuzzy: search },
            });
            return utils.mapData(data, comfyuis.workflow.toNameValue);
          })}
        />
      </FieldContent>
    </Field>
  );
}
