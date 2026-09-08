import { ToolboxIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Checkbox,
  dialogs,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  TextTooltip,
  TooltipDialog,
  useRefresh,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { PresetItem } from '@/presets';
import { Macro } from '@/presets/macros';
import { Feature, stories } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { tools as main } from '@/tools';
import { tools } from '@/tools/client';

function Component() {
  const t = useTranslations();
  const { handler } = useHandler();
  const { key, refreshKey } = useRefresh();

  const { realm } = realms;
  const { items } = tools.property(realm);
  const changeCheckItem = handler(
    async (entry: PresetItem<Macro>, checked: boolean) => {
      entry.disabled = !checked;
      items[entry.name] = checked;
      refreshKey();
    },
  );

  return (
    <TooltipDialog
      tooltip={<ToolboxIcon />}
      onOpen={handler(async (open: boolean) => {
        if (!open) {
          await stories.proxy.update(realm.id, {
            properties: realm.properties,
          });
        }
      })}
      className={'flex flex-col overflow-hidden h-5/6'}
      style={{ height: '86%' }}
      info={dialogs.info(t, 'tool.selector')}
    >
      <FieldGroup className={'overflow-auto p-2 flex-1'}>
        {Object.values(tools.cache(realm).tools).map((u, i) => (
          <Field key={u.name ?? i}>
            <FieldContent className={'flex-row'}>
              <Checkbox
                key={key}
                id={`tool-${u.name}`}
                checked={!u.disabled}
                onCheckedChange={(b) => changeCheckItem(u, b)}
              />
              <FieldLabel
                htmlFor={`tool-${u.name}`}
                className="m-auto ml-2 flex-1"
              >
                {u.name}
              </FieldLabel>
            </FieldContent>
            <FieldDescription>
              <TextTooltip text={u.description} />
            </FieldDescription>
          </Field>
        ))}
      </FieldGroup>
    </TooltipDialog>
  );
}

export const feature: Feature = {
  id: main.name,
  component: Component,
};
