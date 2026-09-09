import { PaletteIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { comfyuis as main } from '@/comfyui';
import { useComfyUIModelSettingState } from '@/comfyui/client/state';
import { Field, FieldLabel, Input, UpdateForm } from '@/components';
import { SettingTab } from '@/global/client';
import { useHandler } from '@/interceptors/client';

function Content() {
  const t = useTranslations();
  const { url, client, directory } = useComfyUIModelSettingState();
  const { handler, success } = useHandler();

  return (
    <UpdateForm
      id={`comfyui`}
      onSubmit={handler(async (data: FormData) => {
        useComfyUIModelSettingState.setState({
          url: data.get('base_url') as string,
          client: data.get('client_id') as string,
          directory: data.get('directory') as string,
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
