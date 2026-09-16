'use client';
import { useTranslations } from 'next-intl';

import { getBaseUrl } from '@/client';
import { ComfyUIParam } from '@/comfyui';
import { ComfyUIParamProps, ParamConfigurator } from '@/comfyui/client';
import { Field, FieldLabel, forms, Input } from '@/components';
import { realms } from '@/stories/client/realms';
import { images } from '@/stories/images';
import { jsonUtils } from '@/utils';

import { ImageCallbackConfig, callbacks as main } from '..';

function EditorComponent({
  param: { config, sequence },
}: ComfyUIParamProps<ImageCallbackConfig>) {
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
      <Field>
        <FieldLabel htmlFor={`callback-title-${sequence}`}>
          {t('comfyui.param.title_node')}
        </FieldLabel>
        <Input
          name={'title'}
          defaultValue={config?.title}
          id={`callback-title-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`callback-title_key-${sequence}`}>
          {t('comfyui.param.title_key')}
        </FieldLabel>
        <Input
          name={'title_key'}
          defaultValue={config?.key}
          id={`callback-title_key-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`callback-title_value-${sequence}`}>
          {t('comfyui.param.title_value')}
        </FieldLabel>
        <Input
          name={'title_value'}
          defaultValue={config?.value}
          id={`callback-title_value-${sequence}`}
        />
      </Field>
    </>
  );
}

function InputComponent({
  param: {
    name,
    sequence,
    config: { title },
  },
}: ComfyUIParamProps<ImageCallbackConfig>) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-title-${sequence}`}>{name}</FieldLabel>
        <Input
          id={`param-title-${sequence}`}
          name={`title_${sequence}`}
          defaultValue={title}
        />
      </Field>
    </>
  );
}

const configurator: ParamConfigurator<ImageCallbackConfig> = {
  id: main.name,
  configComponent: EditorComponent,
  async configureObject(data, param: ComfyUIParam<ImageCallbackConfig>) {
    param.config = {
      node: forms.str(data, 'node'),
      title: forms.str(data, 'title'),
      key: forms.str(data, 'title_key'),
      value: forms.str(data, 'title_value'),
    };
  },
  inputComponent: InputComponent,
  async configureInput(
    data,
    { config: { node, title, key }, sequence },
    input,
  ) {
    const inputs = input[node]?.inputs;
    if (inputs) {
      const { realm } = realms;
      const base = getBaseUrl();
      const url = `${base}/api/stories/${realm.id}/${images.name}`;
      inputs['target_url'] = url;
      console.info(`ComfyUI callback url: ${url}`);
    }
    const titleNode = input[title]?.inputs;
    if (titleNode) {
      titleNode[key] = forms.str(data, `title_${sequence}`);
    }
  },
  async configureSchema(_, paint, schema) {
    schema.properties![paint.code] = {
      type: 'string',
      description: paint.description,
    };
  },
  async generateCalling({ config }, paint, input, args) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      const { realm } = realms;
      const base = getBaseUrl();
      const url = `${base}/api/stories/${realm.id}/${images.name}`;
      inputs['target_url'] = url;
      console.info(`ComfyUI callback url: ${url}`);
    }
    const titleNode = input[config.title]?.inputs;
    if (titleNode) {
      titleNode[config.key] = args[paint.code] ?? config.value;
    }
  },
};

export const callbacks = {
  ...main,
  configurator,
};
