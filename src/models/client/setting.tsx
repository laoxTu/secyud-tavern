'use client';
import { BrainCogIcon, CopyIcon, SquarePlusIcon, StarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Checkbox,
  DeleteDialog,
  dialogs,
  element,
  Field,
  FieldContent,
  FieldLabel,
  IconTooltip,
  Input,
  Selector,
  TooltipDialog,
  UpdateForm,
  useFormRef,
} from '@/components';
import { forms } from '@/global';
import { SettingTab } from '@/global/client';
import { BusinessError } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import {
  ModelNameValueField,
  models,
  useModelSettingState,
  useModelState,
} from '@/models/client';

import { ModelProperty } from '..';

function ModelPropertyContent() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { item, setItem } = useModelState();
  const [engine, setEngine] = useState(
    models.engines.registry.record(item?.engine),
  );
  const form = useFormRef();

  if (!item) return null;

  const properties: ModelProperty = item?.properties ?? {
    retry: { max: 3, interval: 5 },
  };
  const { max = 3, interval = 5 } = properties.retry ?? {};

  return (
    <UpdateForm
      form={form}
      onSubmit={handler(async (data) => {
        if (!engine)
          throw new BusinessError(
            'engine is required',
            'error.model.engine_required',
          );
        const key = forms.str(data, 'api_key');
        if (item) {
          await models.proxy.update(
            item.id,
            engine?.configureObject(data, {
              engine: engine.id,
              name: forms.str(data, 'name'),
              builder: forms.str(data, 'builder'),
              stream: forms.bool(data, 'stream'),
              key: item.key === key || !key ? undefined : key,
              iterations: forms.int(data, 'iterations'),
              properties: {
                ...properties,
                retry: {
                  max: forms.int(data, 'retry_max'),
                  interval: forms.int(data, 'interval'),
                },
              },
            }),
          );
          await setItem(item.id);
        }
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor={`model-name`}>{t('default.name')}</FieldLabel>
        <Input name="name" id={`model-name`} defaultValue={item.name} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-interval`}>
          {t('model.retry_interval')}
        </FieldLabel>
        <Input
          name={'interval'}
          min={1}
          max={10}
          step={0.5}
          id={`model-interval`}
          type={'number'}
          defaultValue={interval}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-retry`}>{t('model.retry_max')}</FieldLabel>
        <Input
          name={'retry_max'}
          id={`model-retry`}
          min={0}
          max={10}
          step={1}
          type={'number'}
          defaultValue={max}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-iterations`}>
          {t('model.iterations')}
        </FieldLabel>
        <Input
          name="iterations"
          id={`model-iterations`}
          type="number"
          min={2}
          max={100}
          step={1}
          defaultValue={item.iterations}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-stream`}>{t(`model.stream`)}</FieldLabel>
        <FieldContent>
          <Checkbox
            id={`model-stream`}
            name={'stream'}
            defaultChecked={item.stream}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-builder`}>{t(`model.builder`)}</FieldLabel>
        <Selector
          id={`model-builder`}
          name={'builder'}
          items={['default', 'layered']}
          value={item.builder}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-provider`}>
          {t(`model.provider`)}
        </FieldLabel>
        <Selector
          id={`model-provider`}
          items={models.engines.registry.sorted()}
          name={'provider'}
          value={engine}
          onValueChange={setEngine}
          valueAccessor={(u) => u.id}
          labelAccessor={(u) => t(`model.provider_${u.id}`)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`model-api_key`}>{t(`model.api_key`)}</FieldLabel>
        <Input
          id={`model-api_key`}
          name={'api_key'}
          type={'password'}
          autoComplete={'off'}
          defaultValue={item?.key}
        />
      </Field>
      {element(engine?.configComponent)}{' '}
    </UpdateForm>
  );
}

export function ModelSettingContent() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { item, setItem } = useModelState();
  const { model, setModel } = useModelSettingState();

  return (
    <>
      <div className={'flex flex-wrap p-1'}>
        <div className={'flex-1 min-w-64'}>
          <ModelNameValueField
            disableLabel
            orientation={'horizontal'}
            value={item ? models.toNameValue(item) : null}
            onValueChange={(v) => setItem(v?.value)}
          />
        </div>
        <TooltipDialog
          tooltip={<SquarePlusIcon />}
          onSubmit={handler(async (data) => {
            const { id } = await models.proxy.create({
              builder: 'default',
              name: forms.str(data, 'name'),
              stream: true,
              iterations: 20,
            });
            await setItem(id);
            success(t('message.create.success'));
          })}
          info={dialogs.info(t, `create`, `model.id`)}
        >
          <Field>
            <FieldLabel htmlFor={`model-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input id={`model-name`} name="name" required />
          </Field>
        </TooltipDialog>
        <DeleteDialog
          itemName={`model.id`}
          disabled={!item}
          onDelete={handler(async () => {
            if (!item) return;
            await models.proxy.delete(item.id);
            await setItem(undefined);
            success(t('message.delete.success'));
          })}
        />
        <TooltipDialog
          tooltip={<CopyIcon />}
          disabled={!item}
          onSubmit={handler(async (data) => {
            if (!item) return;
            const { id } = await models.proxy.clone(item.id, {
              name: forms.str(data, 'name'),
            });
            await setItem(id);
            success(t('message.clone.success'));
          })}
          info={dialogs.info(t, 'clone', 'model.id')}
        >
          <Field>
            <FieldLabel htmlFor={`model-clone-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input
              id={`model-clone-name`}
              defaultValue={item?.name}
              name="name"
              required
            />
          </Field>
        </TooltipDialog>
        <IconTooltip
          text={'model.default'}
          label={` (${model?.name ?? ''})`}
          onClick={handler(async () => {
            setModel(item ? models.toNameValue(item) : null);
          })}
        >
          {<StarIcon color={item?.id === model?.value ? 'green' : 'orange'} />}
        </IconTooltip>
      </div>
      <ModelPropertyContent key={item?.id ?? 'model'} />
    </>
  );
}

export const setting: SettingTab = {
  id: 'model',
  label: 'model.id',
  content: ModelSettingContent,
  icon: BrainCogIcon,
};
