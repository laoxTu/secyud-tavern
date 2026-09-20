import { ImportIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
/**
 * Secyud Tavern Importer 插件
 */
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { GlobalMenuItem, GlobalMenuLabel, globals } from '@/global/client';
import { useHandler } from '@/interceptors/client';

import { proxy } from './proxy';
import { forms } from '@/global';

function Content() {
  const t = useTranslations();
  const { success, handler } = useHandler();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center min-h-[60vh] gap-8 p-8">
      <p className="text-sm text-muted-foreground max-w-sm text-center leading-relaxed">
        {t('importer.description')}
      </p>

      <div className="flex flex-col items-center gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={() => setOpen(true)} render={<Button />}>
            {t(`silly_tavern.import`)}
          </DialogTrigger>
          <DialogContent
            render={
              <form
                action={handler(async (data) => {
                  await proxy.import(forms.file(data,'file'));
                  setOpen(false);
                  success(t('message.import.success'));
                })}
              />
            }
          >
            <DialogHeader>
              <DialogTitle>{t(`silly_tavern.import`)}</DialogTitle>
              <DialogDescription>{t('silly_tavern.import')}</DialogDescription>
            </DialogHeader>

            <Field>
              <FieldLabel htmlFor={`import-silly_tavern`}>
                {t('importer.file')}
              </FieldLabel>
              <Input
                id={`import-silly_tavern`}
                name="file"
                type="file"
                accept={'.json,.png'}
                required
              />
            </Field>

            <DialogFooter>
              <Button type="submit">{t('default.ensure')}</Button>
              <DialogClose render={<Button variant="outline" />}>
                {t('default.cancel')}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const menu: GlobalMenuItem = {
  id: 'importer',
  label: () => <GlobalMenuLabel name={'importer'} icon={<ImportIcon />} />,
  content: Content,
};

export default function () {
  globals.menus.register(menu);
}
