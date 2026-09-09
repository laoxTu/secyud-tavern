'use client';
import { Paintbrush2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  ComfyUIParam,
  ComfyUIWorkflow,
  ComfyUIWorkflowInput,
  comfyuis as main,
} from '@/comfyui';
import { comfyuis, ComfyUIWorkflowNameValueField } from '@/comfyui/client';
import {
  dialogs,
  element,
  FieldGroup,
  FieldSet,
  GridField,
  spanHalf,
  TooltipDialog,
  useFormRef,
} from '@/components';
import { NameValue } from '@/database';
import { BusinessError } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { Feature } from '@/stories/client';
import { jsonUtils } from '@/utils';

function Generator() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const [workflow, setWorkflow] = useState<
    | (ComfyUIWorkflow & {
        params: ComfyUIParam[];
      })
    | null
  >(null);
  const formRef = useFormRef();

  return (
    <TooltipDialog
      formRef={formRef}
      tooltip={<Paintbrush2Icon />}
      className={'flex flex-col overflow-hidden'}
      style={{ maxWidth: '86%', height: '86%' }}
      onSubmit={handler(async (data: FormData) => {
        if (!workflow)
          throw new BusinessError(
            'workflow is not selected',
            'comfyui.workflow_need',
          );
        const input: ComfyUIWorkflowInput | null = jsonUtils.parse(
          workflow.content,
        );
        if (!input)
          throw new BusinessError(
            'workflow is not serializable',
            'comfyui.workflow_invalid',
          );

        for (const param of workflow.params) {
          const editor = comfyuis.configurators.registry.record(param.type);
          if (!editor) continue;
          editor.configureInput?.(data, param, input);
        }
        const { prompt_id } = await comfyuis.proxy.generate(input);
        success(t('comfyui.prompt_sent', { target: prompt_id }));
      })}
      info={dialogs.info(t, 'comfyui.paint')}
    >
      <FieldSet className={'overflow-auto p-2 flex-1'}>
        <FieldGroup>
          <GridField>
            <ComfyUIWorkflowNameValueField
              className={spanHalf}
              name={'workflow'}
              onValueChange={handler(async (item: NameValue) => {
                const workflow = await comfyuis.proxy.workflow.get(item.value);
                const params = await comfyuis.proxy.workflow.param.list(
                  item.value,
                );
                setWorkflow({
                  ...workflow,
                  params: params.items,
                });
              })}
            />
            {workflow &&
              workflow.params.map((u) =>
                element(
                  comfyuis.configurators.registry.record(u.type)
                    ?.inputComponent,
                  {
                    formRef,
                    param: u,
                  },
                ),
              )}
          </GridField>
        </FieldGroup>
      </FieldSet>
    </TooltipDialog>
  );
}

export const feature: Feature = {
  id: main.name,
  component: Generator,
};
