'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  Checkbox,
  combobox,
  Field,
  FieldContent,
  FieldLabel,
  forms,
  Input,
  rowQuat,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { NameValue, utils } from '@/database';
import { BusinessError, checker } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { JsonSchema, jsonUtils } from '@/utils';

import {
  AutoPaintConfig,
  ComfyUIParam,
  ComfyUIWorkflow,
  ComfyUIWorkflowInput,
  comfyuis as main,
} from '..';

import { comfyuis, ComfyUIWorkflowNameValueField } from '.';

export function Editor({
  entry: { entryId, data },
}: ToolProps<AutoPaintConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge<AutoPaintConfig>(
    main.paint.default,
    data.config,
  );
  const { handler } = useHandler();
  const [workflow, setWorkflow] = useState<
    | (ComfyUIWorkflow & {
        params: ComfyUIParam[];
      })
    | null
    | undefined
  >(undefined);

  useEffect(() => {
    void (async () => {
      if (config.workflow && workflow === undefined) {
        const { value } = config.workflow;
        const workflow = await comfyuis.proxy.workflow.get(value);
        const params = await comfyuis.proxy.workflow.param.list(value);
        setWorkflow({
          ...workflow,
          params: params.items,
        });
      }
    })();
  }, []);

  return (
    <>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-description`}>
          {t('default.description')}
        </FieldLabel>
        <Textarea
          name="description"
          id={`${entryId}-description`}
          defaultValue={config.description}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-code`}>{t('default.code')}</FieldLabel>
        <FieldContent>
          <Input
            id={`${entryId}-code`}
            name={'code'}
            pattern={checker.code}
            defaultValue={config.code}
          />
        </FieldContent>
      </Field>
      <ComfyUIWorkflowNameValueField
        className={spanHalf}
        name={'workflow'}
        onValueChange={handler(async (item: NameValue) => {
          const workflow = await comfyuis.proxy.workflow.get(item.value);
          const params = await comfyuis.proxy.workflow.param.list(item.value);
          setWorkflow({
            ...workflow,
            params: params.items,
          });
        })}
      />
      {workflow &&
        workflow.params.map((u, i) => {
          const { description, disabled, code } = config.params.at(i) ?? {};
          return (
            <Field key={i}>
              <input hidden name={'param_id'} defaultValue={u.sequence} />
              <FieldLabel htmlFor={`${entryId}-${u.sequence}-enabled`}>
                {u.name}
              </FieldLabel>
              <FieldContent className="flex-row">
                <Input
                  className="flex-1"
                  id={`${entryId}-${u.sequence}-code`}
                  name={`param_code_${u.sequence}`}
                  pattern={checker.code}
                  defaultValue={code}
                />
                <Checkbox
                  className={'m-auto'}
                  defaultChecked={!disabled}
                  id={`${entryId}-${u.sequence}-enabled`}
                  name={`param_enabled_${u.sequence}`}
                />
              </FieldContent>
              <FieldLabel htmlFor={`${entryId}-${u.sequence}-description`}>
                {t('default.description')}
              </FieldLabel>
              <Textarea
                name={`param_description_${u.sequence}`}
                id={`${entryId}-${u.sequence}-description`}
                defaultValue={description}
                onKeyDown={submitTargetFormOnKey}
              />
            </Field>
          );
        })}
    </>
  );
}

export const tool: ToolProvider<AutoPaintConfig> = {
  id: main.name,
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      code: forms.str(data, 'code'),
      description: forms.str(data, 'description'),
      workflow: combobox.get(data, 'workflow'),
      params: forms.ints(data, 'param_id').map((u) => ({
        id: u,
        code: forms.str(data, `param_code_${u}`),
        description: forms.str(data, `param_description_${u}`),
        disabled: !forms.bool(data, `param_enabled_${u}`),
      })),
    };
  },
  async create(tool) {
    return [await painter(tool.config), modelFetcher()];
  },
};

function modelFetcher(): ToolItem {
  return {
    name: 'comfyui_model_fetcher',
    description: 'get model info',
    parameters: {
      type: 'object',
      properties: {
        size: {
          type: 'integer',
          description: 'the items count to fetch',
        },
        skip: {
          type: 'integer',
          description: 'the skip count to fetch',
        },
        fuzzy: {
          type: 'string',
          description: 'the fuzzy search field, empty default',
        },
        types: {
          type: 'array',
          items: {
            type: 'string',
            description: 'the type of model',
            enum: comfyuis.model.types,
          },
        },
      },
    },
    async invoke(args: any) {
      const data = await comfyuis.proxy.model.list({
        size: args.size,
        skip: args.skip,
        search: {
          fuzzy: args.fuzzy,
          types: args.types,
        },
      });

      const res = utils.mapData(data, (u) => ({
        name: u.path,
        type: u.type,
        base: u.model,
        desc: u.name,
      }));

      return JSON.stringify(res);
    },
  };
}

async function painter(config: AutoPaintConfig): Promise<ToolItem> {
  if (!config.workflow) {
    throw new BusinessError('workflow is not selected');
  }
  const workflow = await comfyuis.proxy.workflow.get(config.workflow.value);
  const params = await comfyuis.proxy.workflow.param.list(
    config.workflow.value,
  );
  const schema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  };
  for (const paintParam of config.params) {
    if (paintParam.disabled) continue;
    const param = params.items.find((u) => u.sequence === paintParam.id);
    const editor = comfyuis.configurators.registry.record(param?.type);
    if (!editor || !param?.type) continue;
    console.debug(param, editor);
    await editor.configureSchema?.(param, paintParam, schema);
  }

  console.debug(`[comfyui] schema:`, schema);

  return {
    name: config.code,
    description: config.description ?? '',
    parameters: schema,
    async invoke(args: any) {
      if (!workflow) throw new BusinessError('workflow is not configured');
      const input: ComfyUIWorkflowInput | null = jsonUtils.parse(
        workflow.content,
      );
      if (!input) throw new BusinessError('workflow is not serializable');

      for (const paintParam of config.params) {
        const param = params.items.find((u) => u.sequence === paintParam.id);
        const editor = comfyuis.configurators.registry.record(param?.type);
        if (!editor || !param) continue;
        await editor.generateCalling?.(param, paintParam, input, args);
      }
      try {
        const response = await comfyuis.proxy.generate(input);
        return JSON.stringify(response);
      } catch (err) {
        return JSON.stringify(err);
      }
    },
  };
}
