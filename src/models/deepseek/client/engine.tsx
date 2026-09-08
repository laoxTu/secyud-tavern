import { useTranslations } from 'next-intl';
import React from 'react';

import {
  Checkbox,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  Selector,
} from '@/components';
import { utils } from '@/database';
import { BusinessError } from '@/interceptors';
import { ModelEngine, models, useModelState } from '@/models/client';
import { DeepseekConfig, DeepseekOptions, deepseeks } from '@/models/deepseek';
import { openais } from '@/models/openai/client';

function Content() {
  const t = useTranslations();
  const { item } = useModelState();
  if (!item) {
    throw new BusinessError('item is null. page should not be rendered.');
  }
  const options = utils.getProperty<DeepseekOptions>(
    item,
    models.names.options,
    () => deepseeks.default.options,
  );
  const [thinking, setThinking] = React.useState<boolean>(
    options.thinking?.type === 'enabled',
  );
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`model-model`}>{t(`model.model`)}</FieldLabel>
        <Selector
          name={'model'}
          id={`model-model`}
          value={options.model}
          items={deepseeks.models}
          labelAccessor={(e) => e && t(`deepseek.${e}`)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-thinking`}>
          {t(`model.thinking`)}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={`model-thinking`}
            name={'thinking'}
            checked={thinking}
            onCheckedChange={(e) => setThinking(e)}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-max_tokens`}>
          {t(`model.max_tokens`)}
        </FieldLabel>
        <Input
          id={`model-max_tokens`}
          name={'max_tokens'}
          type={'number'}
          min={0}
          step={1}
          defaultValue={options.max_tokens}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-logprobs`}>
          {t(`model.logprobs`)}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={`model-logprobs`}
            name={'logprobs'}
            defaultChecked={options.logprobs}
            disabled
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-top_logprobs`}>
          {t(`model.top_logprobs`)}
        </FieldLabel>
        <Input
          id={`model-top_logprobs`}
          name={'top_logprobs'}
          type={'number'}
          max={20}
          min={0}
          step={0.1}
          disabled
          defaultValue={options.top_logprobs}
        />
      </Field>
      <Field className={thinking ? '' : 'hidden'}>
        <FieldLabel htmlFor={`model-reasoning_effort`}>
          {t(`model.reasoning_effort`)}
        </FieldLabel>
        <Selector
          name={'reasoning_effort'}
          id={`model-reasoning_effort`}
          value={options.reasoning_effort}
          items={deepseeks.reasoningEfforts}
        />
      </Field>
      <Field className={thinking ? 'hidden' : ''}>
        <FieldLabel htmlFor={`model-temperature`}>
          {t(`model.temperature`)}
        </FieldLabel>
        <Input
          id={`model-temperature`}
          name={'temperature'}
          type={'number'}
          max={2}
          min={0}
          step={0.05}
          defaultValue={options.temperature}
        />
      </Field>
      <Field className={thinking ? 'hidden' : ''}>
        <FieldLabel htmlFor={`model-top_p`}>{t(`model.top_p`)}</FieldLabel>
        <Input
          id={`model-top_p`}
          name={'top_p'}
          type={'number'}
          max={2}
          min={0}
          step={0.05}
          defaultValue={options.top_p}
        />
      </Field>
    </>
  );
}

export const engine: ModelEngine = {
  id: deepseeks.name,
  configComponent: Content,
  configureObject(data, model) {
    const options: DeepseekOptions = {
      model: data.get('model') as string,
      thinking: {
        type: data.get('thinking') ? 'enabled' : 'disabled',
      },
      reasoning_effort: data.get('reasoning_effort') as string,
      temperature: Number(data.get('temperature')),
      max_tokens: Math.trunc(Number(data.get('max_tokens'))),
      top_p: Number(data.get('top_p')),
      logprobs: !!data.get('logprobs'),
      top_logprobs: Number(data.get('top_logprobs')),
    };
    const config: DeepseekConfig = {};
    utils.setProperty(model, models.names.config, config);
    utils.setProperty(model, models.names.options, options);
    return model;
  },
  prompt: openais.engine.prompt,
  result: openais.engine.result,
};
