import { ListIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Checkbox,
  dialogs,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
  Separator,
  TextTooltip,
  TooltipDialog,
  useRefresh,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { PresetItem } from '@/presets';
import { Macro, macros as main } from '@/presets/macros';
import { macros } from '@/presets/macros/client';
import { MacroCacheItem } from '@/presets/macros/client/realm';
import { Feature, stories } from '@/stories/client';
import { realms } from '@/stories/client/realms';
import { arrUtils } from '@/utils';

function Component() {
  const t = useTranslations();
  const { handler } = useHandler();
  const { key, refreshKey } = useRefresh();
  const realm = realms.realm.realm;
  const { checkItems, selections } = macros.property(realm);
  const changeOpen = handler(async (open: boolean) => {
    if (!open) {
      await stories.proxy.update(realm.id, {
        properties: realm.properties,
      });
    }
  });
  const changeSelection = handler(
    async (item: MacroCacheItem, name: string) => {
      const entry = item.singles[name];
      selections[item.key] = entry.name;
      item.select = name;
      refreshKey();
    },
  );
  const changeCheckItem = handler(
    async (entry: PresetItem<Macro>, checked: boolean) => {
      entry.disabled = !checked;
      checkItems[entry.name] = checked;
      refreshKey();
    },
  );

  return (
    <TooltipDialog
      tooltip={<ListIcon />}
      onOpen={changeOpen}
      className={'flex flex-col overflow-hidden h-5/6'}
      style={{ height: '86%' }}
      info={dialogs.info(t, 'macro.selector')}
    >
      <div className={'overflow-auto p-1 flex-1'}>
        {Object.values(macros.cache(realm).macros)
          .filter((u) => !u.hidden)
          .map((item, i) => (
            <FieldSet key={item.key ?? i} className="border p-1">
              <FieldLegend className="text-sm font-semibold">
                {item.key}
              </FieldLegend>
              <RadioGroup
                value={item.select}
                onValueChange={(id) => changeSelection(item, id)}
                className="flex flex-col"
              >
                {arrUtils.intersperse(
                  Object.values(item.singles),
                  (_, i) => (
                    <Separator key={`s-${i}`} />
                  ),
                  (t, i) => (
                    <Field key={i}>
                      <FieldContent key={key} className="flex-row">
                        <RadioGroupItem
                          id={`macro-r-${item.key}-${i}`}
                          value={t.name}
                        />
                        <FieldLabel
                          htmlFor={`macro-r-${item.key}-${i}`}
                          className="m-auto flex-1"
                        >
                          {t.name}
                        </FieldLabel>
                      </FieldContent>
                      <FieldDescription>
                        <TextTooltip text={t.value} />
                      </FieldDescription>
                    </Field>
                  ),
                )}
              </RadioGroup>
              {arrUtils.intersperse(
                item.multiples,
                (_, i) => (
                  <Separator key={`s-${i}`} />
                ),
                (t, i) => (
                  <Field key={i}>
                    <FieldContent
                      key={key}
                      className="flex-row hover:bg-primary-foreground"
                    >
                      <Checkbox
                        id={`macro-c-${item.key}-${i}`}
                        checked={!t.disabled}
                        onCheckedChange={(b) => changeCheckItem(t, b)}
                      />
                      <FieldLabel
                        htmlFor={`macro-c-${item.key}-${i}`}
                        className="m-auto flex-1"
                      >
                        {t.name}
                      </FieldLabel>
                    </FieldContent>
                    <FieldDescription>
                      <TextTooltip text={t.value} />
                    </FieldDescription>
                  </Field>
                ),
              )}
            </FieldSet>
          ))}
      </div>
    </TooltipDialog>
  );
}

export const feature: Feature = {
  id: main.name,
  component: Component,
};
