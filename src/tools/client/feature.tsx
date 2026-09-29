import { CircleAlertIcon, ToolboxIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Checkbox,
  dialogs,
  Field,
  FieldGroup,
  FieldLabel,
  GridField,
  IconTooltip,
  TooltipDialog,
  useRefresh,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { Feature, stories } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { tools as main } from '@/tools';
import { tools } from '@/tools/client';

import { ToolCacheItem } from './realm';

function Component() {
  const t = useTranslations();
  const { handler } = useHandler();
  const { key, refreshKey } = useRefresh();

  const { realm } = realms;
  const changeCheckItem = handler(
    async (entry: ToolCacheItem, checked: boolean) => {
      entry.disabled = !checked;
      refreshKey();
    },
  );

  return (
    <TooltipDialog
      tooltip={<ToolboxIcon />}
      onOpen={handler(async (open) => {
        if (open) {
          refreshKey();
        } else {
          await stories.proxy.update(realm.id, {
            properties: realm.properties,
          });
        }
      })}
      className={'flex flex-col overflow-hidden h-5/6'}
      style={{ height: '86%', minWidth: '86%' }}
      info={dialogs.info(t, 'tool.selector')}
    >
      <FieldGroup className={'overflow-auto p-2 flex-1'}>
        <GridField className={'gap-2'}>
          {Object.values(tools.cache(realm).tools).map((u, i) => (
            <Field
              key={u.name ?? i}
              orientation={'horizontal'}
              className="hover:bg-primary-foreground"
            >
              <Checkbox
                className={'m-auto'}
                key={key}
                id={`tool-${u.name}`}
                checked={!u.disabled}
                onCheckedChange={(b) => changeCheckItem(u, b)}
              />
              <FieldLabel htmlFor={`tool-${u.name}`}>
                {u.name}
                <IconTooltip
                  label={
                    <div className={'overflow-auto max-h-96 scrollbar-none'}>
                      <pre className="wrap-break-word whitespace-pre-wrap">
                        {u.description}
                      </pre>
                    </div>
                  }
                >
                  <CircleAlertIcon />
                </IconTooltip>
              </FieldLabel>
            </Field>
          ))}
        </GridField>
      </FieldGroup>
    </TooltipDialog>
  );
}

export const feature: Feature = {
  id: main.name,
  component: Component,
  sequence: 100,
};
