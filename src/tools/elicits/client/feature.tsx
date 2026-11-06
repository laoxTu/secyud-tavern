import { CircleAlertIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  GridField,
  IconTooltip,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  spanFull,
} from '@/components';
import { forms } from '@/global';
import { handler } from '@/interceptors/client';
import { Feature } from '@/stories/client';

import { useElicitState } from './states';

function Component() {
  const { item, render } = useElicitState();
  const t = useTranslations();
  return (
    <Dialog open={!!item}>
      <DialogContent
        className="flex flex-col overflow-hidden"
        showCloseButton={false}
        style={{ height: '86%', minWidth: '86%' }}
        render={
          <form
            action={handler(async (data: FormData) => {
              const { item, pop } = useElicitState.getState();
              if (!item) return;
              const answers: string[] = [];
              const options = item.options.map((t) => t.title);
              if (item.single) {
                const select = forms.str(data, 'elicit');
                const value =
                  select === 'custom'
                    ? forms.str(data, 'custom')
                    : options[Number(select)] || '';
                answers.push(value);
              } else {
                for (let i = 0; i < item.options.length; i++) {
                  if (forms.bool(data, `option-${i}`)) {
                    answers.push(options[i]);
                  }
                }
                if (item.custom && forms.bool(data, 'custom-enabled')) {
                  const customAnswer = forms.str(data, 'custom');
                  if (customAnswer) {
                    answers.push(customAnswer);
                  }
                }
              }
              await item.reply(answers);
              await pop(item);
            })}
          />
        }
      >
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{t('elicit.title')}</DialogTitle>
              <DialogDescription>{item.question}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {item.single ? (
                <RadioGroup
                  key={render}
                  name="elicit"
                  defaultValue={0}
                  className="w-fit"
                >
                  {item.options.map((t, i) => {
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <RadioGroupItem value={i} id={`elicit-${i}`} />
                        <Label htmlFor={`elicit-${i}`}>
                          {t.title}
                          <IconTooltip
                            label={
                              <div
                                className={
                                  'overflow-auto max-h-96 scrollbar-none'
                                }
                              >
                                <pre className="wrap-break-word whitespace-pre-wrap">
                                  {t.detail}
                                </pre>
                              </div>
                            }
                          >
                            <CircleAlertIcon />
                          </IconTooltip>
                        </Label>
                      </div>
                    );
                  })}
                  {item.custom && (
                    <div key="custom" className="flex items-center gap-3">
                      <RadioGroupItem value="custom" />
                      <Input
                        name="custom"
                        placeholder={t('elicit.custom.placeholder')}
                      />
                    </div>
                  )}
                </RadioGroup>
              ) : (
                <GridField>
                  {item.options.map((t, i) => {
                    return (
                      <Field key={i} orientation="horizontal">
                        <Checkbox name={`option-${i}`} />
                        <FieldLabel htmlFor={`elicit-${i}`}>
                          {t.title}
                          <IconTooltip
                            label={
                              <div
                                className={
                                  'overflow-auto max-h-96 scrollbar-none'
                                }
                              >
                                <pre className="wrap-break-word whitespace-pre-wrap">
                                  {t.detail}
                                </pre>
                              </div>
                            }
                          >
                            <CircleAlertIcon />
                          </IconTooltip>
                        </FieldLabel>
                      </Field>
                    );
                  })}
                  {item.custom && (
                    <Field className={spanFull} orientation="horizontal">
                      <Checkbox name="custom-enabled" />
                      <Input
                        name="custom"
                        placeholder={t('elicit.custom.placeholder')}
                      />
                    </Field>
                  )}
                </GridField>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{t('default.ensure')}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 这个feature是一个弹窗组件，接受用户回答工具提出的问题。
export const feature: Feature = {
  id: 'elicit',
  component: Component,
};
