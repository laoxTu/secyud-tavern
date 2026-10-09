import { useTranslations } from 'next-intl';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
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
        showCloseButton={false}
        style={{ height: '86%', minWidth: '86%' }}
        render={
          <form
            action={handler(async (data: FormData) => {
              const { item, pop } = useElicitState.getState();
              const select = forms.str(data, 'elicit');
              const value =
                select === 'custom'
                  ? forms.str(data, 'custom')
                  : item?.examples[Number(select)] || '';
              void item?.reply(value);
              pop();
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
            <RadioGroup
              key={render}
              name="elicit"
              defaultValue={0}
              className="w-fit"
            >
              {item.examples.map((t, i) => {
                return (
                  <div key={i} className="flex items-center gap-3">
                    <RadioGroupItem value={i} id={`elicit-${i}`} />
                    <Label htmlFor={`elicit-${i}`}>{t}</Label>
                  </div>
                );
              })}
              {item.custom && (
                <div key="custom" className="flex items-center gap-3">
                  <RadioGroupItem value="custom" id="elicit-custom" />
                  <Input
                    name="custom"
                    placeholder={t('elicit.custom.placeholder')}
                  />
                </div>
              )}
            </RadioGroup>
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
