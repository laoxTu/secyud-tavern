import { useTranslations } from 'next-intl';

import { getBaseUrl } from '@/client';
import { ComfyUIParam } from '@/comfyui';
import { ComfyUIParamProps, ParamConfigurator } from '@/comfyui/client';
import { Field, FieldLabel, Input } from '@/components';
import { realms } from '@/stories/client/realms';
import { images } from '@/stories/images';
import { jsonUtils } from '@/utils';

import { CallbackConfig, callbacks as main } from '..';

function EditorComponent({
  param: { config, sequence },
}: ComfyUIParamProps<CallbackConfig>) {
  const t = useTranslations();
  config = jsonUtils.merge(main.default, config);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`callback-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config?.node}
          id={`callback-node-${sequence}`}
        />
      </Field>
    </>
  );
}

const configurator: ParamConfigurator<CallbackConfig> = {
  id: main.name,
  configComponent: EditorComponent,
  async configureObject(data, param: ComfyUIParam<CallbackConfig>) {
    param.config = {
      node: data.get('node') as string,
    };
  },
  async configureInput(_, { config: { node } }, input) {
    const inputs = input[node]?.inputs;
    if (inputs) {
      const { realm } = realms;
      const base = getBaseUrl();
      const url = `${base}/api/stories/${realm.id}/entries/${images.name}`;
      inputs['target_url'] = url;
      console.info(`ComfyUI callback url: ${url}`);
    }
  },
};

export const callbacks = {
  ...main,
  configurator,
};
