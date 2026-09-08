import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import {
  ComfyUIModelSelector,
  ComfyUIParamProps,
  comfyuis,
  ParamConfigurator,
} from '@/comfyui/client';
import {
  selects as main,
  ModelSelectConfig,
  PowerLoraSelectConfig,
  SelectConfig,
} from '@/comfyui/select';
import {
  Checkbox,
  combobox,
  Field,
  FieldLabel,
  Input,
  Selector,
  spanHalf,
} from '@/components';
import { jsonUtils } from '@/utils';

function SelectConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<SelectConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.select.default, param.config);
  const { sequence } = param;
  const [items, setItems] = useState<string[]>(config.items || []);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-key-${sequence}`}>
          {t('comfyui.param.key')}
        </FieldLabel>
        <Input
          name={'key'}
          defaultValue={config.key}
          id={`param-key-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-count-${sequence}`}>
          {t('comfyui.value_count')}
        </FieldLabel>
        <Input
          name={`value_count`}
          type={'number'}
          defaultValue={config.items.length}
          onChange={(u) => {
            const count = parseInt(u.target.value);
            setItems((u) => {
              return u.length >= count
                ? u.slice(0, count)
                : [...u, ...Array(count - u.length).fill(null)];
            });
          }}
          min={1}
          step={1}
          id={`param-count-${sequence}`}
        />
      </Field>
      {items.map((value, i) => {
        return (
          <Field key={i}>
            <FieldLabel
              htmlFor={`param-item-${sequence}-${i}`}
            >{`${t('comfyui.value')} ${i + 1}`}</FieldLabel>
            <Input
              name={`item`}
              value={value}
              onChange={(u) =>
                setItems((v) => {
                  v[i] = u.target.value;
                  return [...v];
                })
              }
              id={`param-item-${sequence}-${i}`}
            />
          </Field>
        );
      })}
      <SelectInputComponent
        param={{
          ...param,
          config: {
            ...param.config,
            items,
          },
        }}
        formRef={formRef}
      />
    </>
  );
}

function SelectInputComponent({
  param: {
    name,
    sequence,
    config: { value, items },
  },
}: ComfyUIParamProps<SelectConfig>) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-value-${sequence}`}>{name}</FieldLabel>
        <Selector
          name={`value_${sequence}`}
          id={`param-value-${sequence}`}
          defaultValue={value}
          items={items}
        />
      </Field>
    </>
  );
}

const select: ParamConfigurator<SelectConfig> = {
  id: main.select.name,
  configComponent: SelectConfigComponent,
  async configureObject(data, param) {
    param.config = {
      node: data.get('node') as string,
      key: data.get('key') as string,
      value: data.get(`value_${param.sequence}`) as string,
      items: data.getAll('item') as string[],
    };
  },
  inputComponent: SelectInputComponent,
  configureInput(data, { config, sequence }, input): void {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = data.get(`value_${sequence}`);
    }
  },
};

function ModelSelectConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<ModelSelectConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.modelSelect.default, param.config);
  const { sequence } = param;
  const [type, setType] = useState<string | null | undefined>(config.type);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-key-${sequence}`}>
          {t('comfyui.param.key')}
        </FieldLabel>
        <Input
          name={'key'}
          defaultValue={config.key}
          id={`param-key-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-model_type-${sequence}`}>
          {t('comfyui.param.model_type')}
        </FieldLabel>
        <Selector
          name={'type'}
          id={`param-model_type-${sequence}`}
          value={type}
          onValueChange={setType}
          items={comfyuis.model.types}
        />
      </Field>
      <ModelSelectInputComponent
        param={{
          ...param,
          config: {
            ...config,
            type,
          },
        }}
        formRef={formRef}
      />
    </>
  );
}

function ModelSelectInputComponent({
  param: {
    name,
    sequence,
    config: { type, value },
  },
}: ComfyUIParamProps<ModelSelectConfig>) {
  return (
    <>
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`param-model-${sequence}`}>{name}</FieldLabel>
        <ComfyUIModelSelector
          types={type ? [type] : []}
          defaultValue={value ?? undefined}
          id={`param-model-${sequence}`}
          name={`model_${sequence}`}
        />
      </Field>
    </>
  );
}

const modelSelect: ParamConfigurator<ModelSelectConfig> = {
  id: main.modelSelect.name,
  configComponent: ModelSelectConfigComponent,
  async configureObject(data, param) {
    param.config = {
      node: data.get('node') as string,
      key: data.get('key') as string,
      type: data.get('type') as string,
      value: combobox.get(data, `value_${param.sequence}`),
    };
  },
  inputComponent: ModelSelectInputComponent,
  configureInput(data, { config, sequence }, input): void {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = data.get(`value_${sequence}`);
    }
  },
};

function PowerLoraSelectConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<PowerLoraSelectConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.select.default, param.config);
  const { sequence } = param;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <PowerLoraSelectInputComponent param={param} formRef={formRef} />
    </>
  );
}

function PowerLoraSelectInputComponent({
  param: {
    name,
    sequence,
    config: { value },
  },
}: ComfyUIParamProps<PowerLoraSelectConfig>) {
  const t = useTranslations();
  const [count, setCount] = useState(value.length);
  return (
    <>
      <Field className={spanHalf}>
        <FieldLabel
          htmlFor={`param-count-${sequence}`}
        >{`${name} ${t('comfyui.lora_count')}`}</FieldLabel>
        <Input
          name={`count_${sequence}`}
          type={'number'}
          value={count}
          onChange={(u) => setCount(parseInt(u.target.value))}
          min={0}
          max={10}
          step={1}
          id={`param-count-${sequence}`}
        />
      </Field>

      {Array.from({ length: count }, (_, i) => {
        const cfg = value.length > i ? value[i] : null;
        const lora = cfg?.lora;
        return (
          <React.Fragment key={i}>
            <Field key={`${i}-lora`}>
              <FieldLabel htmlFor={`param-lora-${sequence}-${i}`}>
                {`${name} ${t('comfyui.lora')} ${i + 1}`}
                <Checkbox
                  name={`lora_on_${sequence}_${i}`}
                  defaultChecked={cfg?.on ?? true}
                />
              </FieldLabel>
              <ComfyUIModelSelector
                types={['lora']}
                defaultValue={lora}
                id={`param-lora-${sequence}-${i}`}
                name={`lora_${sequence}_${i}`}
              />
            </Field>
            <Field key={`${i}-strength`}>
              <FieldLabel htmlFor={`param-lora_strength-${sequence}-${i}`}>
                {`${t('comfyui.strength')} ${i + 1}`}
              </FieldLabel>
              <Input
                name={`lora_strength_${sequence}_${i}`}
                type={'number'}
                defaultValue={cfg?.strength ?? 1}
                min={-10}
                max={10}
                step={0.05}
                id={`param-lora_strength-${sequence}-${i}`}
              />
            </Field>
          </React.Fragment>
        );
      })}
    </>
  );
}

const powerLoraSelect: ParamConfigurator<PowerLoraSelectConfig> = {
  id: main.powerLoraSelect.name,
  configComponent: PowerLoraSelectConfigComponent,
  async configureObject(data, param) {
    const sequence = param.sequence;
    param.config = {
      node: data.get('node') as string,
      value: Array.from(
        { length: parseInt(data.get(`count_${sequence}`) as string) },
        () => ({
          lora: combobox.get(data, `lora_${sequence}`),
          strength: parseFloat(data.get(`lora_strength_${sequence}`) as string),
          on: !!data.get(`lora_on_${sequence}`),
        }),
      ),
    };
  },
  inputComponent: PowerLoraSelectInputComponent,
  configureInput(data, { config, sequence }, input): void {
    const inputs = input[config.node]?.inputs;
    if (!inputs) return;
    const count = parseInt(data.get(`count_${sequence}`) as string);
    for (let i = 0; i < 10; i++) {
      if (i < count) {
        inputs[`lora_${i + 1}`] = {
          // value 是 id， name才是path
          lora: combobox.get(data, `lora_${sequence}`).name,
          strength: parseFloat(data.get(`lora_strength_${sequence}`) as string),
          on: !!data.get(`lora_on_${sequence}`),
        };
      } else {
        delete inputs[`lora_${i + 1}`];
      }
    }
  },
};

export const selects = {
  ...main,
  configurator: {
    select,
    modelSelect,
    powerLoraSelect,
  },
};
