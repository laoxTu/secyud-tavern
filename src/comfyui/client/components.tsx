import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { ComfyUIModel } from '@/comfyui';
import { comfyuis } from '@/comfyui/client';
import {
  AspectRatio,
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

export function ComfyUIModelHoverableItem({
  id,
  path,
  children,
}: {
  id: string;
  path: string;
  children?: (item: ComfyUIModel) => React.ReactNode;
}) {
  const [item, setItem] = useState<ComfyUIModel | null>(null);
  const { handler } = useHandler();
  useEffect(() => {
    handler(async () => {
      const model = await comfyuis.proxy.model.cache(id);
      setItem(model);
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
      <HoverCardTrigger>
        {children?.(item) ?? `${item.path}(${item.model}-${item.name})`}
      </HoverCardTrigger>
      <HoverCardContent className={'bg-card w-full'}>
        <div>{`${item.path}(${item.model}-${item.name})`}</div>
        {source && (
          <AspectRatio ratio={1}>
            {source.endsWith('mp4') ? (
              <video
                src={source}
                controls
                preload="metadata"
                className="object-cover rounded-sm aspect-square"
              />
            ) : (
              <Image
                src={source}
                alt={item.name}
                fill
                unoptimized
                className="object-cover rounded-sm"
              />
            )}
          </AspectRatio>
        )}
        {item.html && <div dangerouslySetInnerHTML={{ __html: item.html }} />}
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
        defaultValue={defaultValue}
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
  defaultValue?: NameValue | null;
  name?: string;
  className?: string;
  orientation?: Orientation;
}

export function ComfyUIWorkflowNameValueField({
  name,
  className,
  orientation,
  defaultValue,
  value,
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
          defaultValue={defaultValue}
          value={value}
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
