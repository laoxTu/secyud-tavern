import { CircleAlertIcon, ListIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import {
  Checkbox,
  dialogs,
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
  GridField,
  IconTooltip,
  RadioGroup,
  RadioGroupItem,
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

function Component() {
  const t = useTranslations();
  const { handler } = useHandler();
  const { key, refreshKey } = useRefresh();
  const { realm } = realms;

  const { selections } = macros.property(realm);
  const cache = macros.cache(realm);
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
      refreshKey();
    },
  );

  return (
    <TooltipDialog
      tooltip={<ListIcon />}
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
      info={dialogs.info(t, 'macro.selector')}
    >
      <div className={'overflow-auto flex-1'}>
        {Object.values(cache.macros)
          .filter((u) => !u.hidden)
          .map((item, i) => {
            const singles = Object.values(item.singles);
            return (
              <FieldSet
                key={item.key ?? i}
                className="border px-1"
                style={{ gap: 0 }}
              >
                <FieldLegend className="font-semibold m-0">
                  {item.key}
                </FieldLegend>
                {!!singles.length && (
                  <RadioGroup
                    value={item.select}
                    onValueChange={(id) => changeSelection(item, id)}
                  >
                    <GridField>
                      {Object.values(item.singles).map((t, i) => {
                        return (
                          <Field
                            key={i}
                            orientation={'horizontal'}
                            className="hover:bg-primary-foreground"
                          >
                            <RadioGroupItem
                              className={'m-auto'}
                              id={`macro-r-${item.key}-${i}`}
                              value={t.code}
                              key={key}
                            />
                            <FieldLabel htmlFor={`macro-r-${item.key}-${i}`}>
                              {t.name}
                              <IconTooltip
                                label={
                                  <pre className="wrap-break-word">
                                    {t.value}
                                  </pre>
                                }
                              >
                                <CircleAlertIcon />
                              </IconTooltip>
                            </FieldLabel>
                          </Field>
                        );
                      })}
                    </GridField>
                  </RadioGroup>
                )}
                <GridField>
                  {item.multiples
                    .filter((t) => !t.hidden)
                    .map((t, i) => {
                      const list = cache.multiples[t.code];
                      return (
                        <Field
                          key={i}
                          orientation={'horizontal'}
                          className="hover:bg-primary-foreground"
                        >
                          <Checkbox
                            key={key}
                            className={'m-auto'}
                            id={`macro-c-${item.key}-${i}`}
                            checked={!t.disabled}
                            onCheckedChange={(b) => changeCheckItem(t, b)}
                          />
                          <FieldLabel htmlFor={`macro-c-${item.key}-${i}`}>
                            {t.name}
                            <IconTooltip
                              label={
                                <div
                                  className={
                                    'overflow-auto max-h-96 scrollbar-none'
                                  }
                                >
                                  {list.map((t, i) => (
                                    <React.Fragment key={i}>
                                      <p>{t.name}</p>
                                      <br />
                                      <pre className="wrap-break-word whitespace-pre-wrap">
                                        {t.value}
                                      </pre>
                                      <br />
                                    </React.Fragment>
                                  ))}
                                </div>
                              }
                            >
                              <CircleAlertIcon />
                            </IconTooltip>
                          </FieldLabel>
                        </Field>
                      );
                    })}
                </GridField>
              </FieldSet>
            );
          })}
      </div>
    </TooltipDialog>
  );
}

export const feature: Feature = {
  id: main.name,
  component: Component,
  sequence: 100,
};
