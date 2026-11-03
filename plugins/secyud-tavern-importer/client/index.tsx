import { ImportIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
/**
 * Secyud Tavern Importer 插件
 */

import { Field, FieldLabel, Input } from '@/components';
import { dialogs, TooltipDialog } from '@/components/dialog';
import { forms } from '@/global';
import { globals } from '@/global/client';
import { handler, success } from '@/interceptors/client';

import { proxy } from './proxy';

function Content() {
  const t = useTranslations();

  return (
    <TooltipDialog
      tooltip={<ImportIcon />}
      onSubmit={handler(async (data) => {
        await proxy.import(forms.file(data, 'file'));
        success(t('message.import.success'));
      })}
      info={dialogs.info(t, 'silly_tavern.importer')}
    >
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
    </TooltipDialog>
  );
}

export default function () {
  globals.uis.register({
    id: 'preset.main_button.st_importer',
    slot: 'preset.main_button',
    component: Content,
  });
}
