import { PaletteIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { comfyuis as main } from '@/comfyui';
import { useComfyUIModelSettingState } from '@/comfyui/client/state';
import { Field, FieldLabel, Input, UpdateForm } from '@/components';
import { forms } from '@/global';
import { SettingTab } from '@/global/client';
import { useHandler } from '@/interceptors/client';

function Content() {
  const t = useTranslations();
  const { url, client, directory } = useComfyUIModelSettingState();
  const { handler, success } = useHandler();

  return (
    <UpdateForm
      onSubmit={handler(async (data) => {
        useComfyUIModelSettingState.setState({
          url: forms.str(data, 'base_url'),
          client: forms.str(data, 'client_id'),
          directory: forms.str(data, 'directory'),
        });
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor="setting-comfyui-base_url">
          {t('default.base_url')}
        </FieldLabel>
        <Input
          id="setting-comfyui-base_url"
          name={'base_url'}
          defaultValue={url}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-comfyui-client_id">
          {t('comfyui.client_id')}
        </FieldLabel>
        <Input
          id="setting-comfyui-client_id"
          name={'client_id'}
          defaultValue={client}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-comfyui-directory">
          {t('comfyui.directory')}
        </FieldLabel>
        <Input
          id="setting-comfyui-directory"
          name={'directory'}
          defaultValue={directory}
        />
      </Field>
    </UpdateForm>
  );
}

export const setting: SettingTab = {
  id: main.name,
  icon: PaletteIcon,
  label: 'comfyui.id',
  content: Content,
};
