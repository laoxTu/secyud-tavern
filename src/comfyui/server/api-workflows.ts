import {
  ComfyUIParam,
  ComfyUIParamRequestParam,
  ComfyUIWorkflow,
  ComfyUIWorkflowInput,
} from '@/comfyui';
import { comfyuis } from '@/comfyui/server';
import { DataRequest, InDto } from '@/database';
import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import { jsonUtils } from '@/utils';
import { Archive, archive } from '@/utils/archive';
import { fileUtils, response } from '@/utils/server';

import { callbacks } from '../callback';
import { LoraConfig, selects } from '../select';

interface PortModel {
  workflow: ComfyUIWorkflow;
  params: ComfyUIParam[];
}
async function exportProcess(model: PortModel): Promise<Buffer> {
  const nodes: Archive = {};
  archive.set.text(nodes, 'workflow.json', model.workflow.content);
  model.workflow.content = undefined;
  model.workflow.id = undefined!;
  archive.set.json(nodes, 'meta.json', model);
  return await archive.archiveToZip(nodes);
}
async function importProcess(buffer: Buffer): Promise<PortModel> {
  const nodes = await archive.zipToArchive(buffer);
  const res = await archive.get.json<PortModel>(nodes, 'meta.json');
  if (res) {
    res.workflow.content = await archive.get.fuzzy(nodes, 'workflow.');
    return res;
  }
  throw new BusinessError('import failed. invalid file');
}

export const workflows = {
  GET: route(async (_, records) => {
    const request = records.searchParams;
    const data = await comfyuis.repository.workflow.list(request);
    return response.json(data);
  }),
  POST: route(async (request) => {
    const workflow: ComfyUIWorkflow = await request.json();
    const id = await comfyuis.repository.workflow.create(workflow);
    return response.json({ id });
  }),
  import: {
    POST: route(async (request) => {
      const data = await request.formData();
      const file = data.get('file') as File;
      const buffer = await file.arrayBuffer();
      const model = await importProcess(Buffer.from(buffer));

      const id = await comfyuis.repository.workflow.create({
        ...model.workflow,
        id: '',
      });

      await comfyuis.repository.workflow.param.make(id, model.params);

      return response.json({ id });
    }),
  },
  '[id]': {
    clone: {
      POST: route(async (request, records) => {
        const workflow: Partial<ComfyUIWorkflow> = await request.json();
        const { id: sourceId } = await records.params;
        const source = await comfyuis.repository.workflow.get(sourceId);
        const target = { ...source, ...workflow, id: '' };
        const id = await comfyuis.repository.workflow.create(target);
        return response.json({ id });
      }),
    },
    GET: route(async (_, record) => {
      const { id } = await record.params;
      const workflow = await comfyuis.repository.workflow.get(id);
      return response.json(workflow);
    }),
    PUT: route(async (request, record) => {
      const { id: originId } = await record.params;
      const workflow: InDto<ComfyUIWorkflow> = await request.json();
      const id = await comfyuis.repository.workflow.update(originId, workflow);
      return response.json({ id });
    }),
    DELETE: route(async (_, record) => {
      const { id } = await record.params;
      await comfyuis.repository.workflow.delete(id);
      return response.json(null);
    }),
    export: {
      GET: route(async (_, records) => {
        const { id } = await records.params;
        const workflow = await comfyuis.repository.workflow.get(id);
        const params = await comfyuis.repository.workflow.param.list(id);

        const stream = fileUtils.createOnceStream(async (controller) => {
          const buffer = await exportProcess({
            workflow,
            params: params.items,
          });
          // 将 JSON 字符串编码为 Uint8Array 并加入流
          controller.enqueue(buffer);
        });
        return response.download(`workflow_${workflow.name}.zip`, stream);
      }),
    },
    params: {
      generate: {
        POST: route(async (_, records) => {
          const { id } = await records.params;
          const model = await comfyuis.repository.workflow.get(id);

          if (model) {
            const params = await comfyuis.repository.workflow.param.list(id);

            const workflow: ComfyUIWorkflowInput = jsonUtils.parse(
              model.content,
            );
            for (const node of Object.keys(workflow)) {
              const nodeValue = workflow[node];
              // 生成参数，positive，power lora， diffusion model 是必须的。回调也检测一下。
              if (nodeValue.inputs['unet_name']) {
                const name = nodeValue.inputs['unet_name'];
                await push(
                  selects.modelSelect.name,
                  `diffusion_model_${node}`,
                  {
                    type: 'diffusion_model',
                    node,
                    key: 'unet_name',
                    value: {
                      name,
                      value: name,
                    },
                  },
                );
              }
              if (
                nodeValue._meta.title
                  .toLocaleLowerCase()
                  .startsWith('positive') &&
                nodeValue.inputs['text']
              ) {
                await push('llm_text_editor', `positive_prompt_${node}`, {
                  node,
                  key: 'text',
                  prompt: '',
                });
              }
              if (nodeValue.class_type === 'Power Lora Loader (rgthree)') {
                const loras: LoraConfig[] = [];
                for (let i = 0; i < 10; i++) {
                  const key = `lora_${i + 1}`;
                  if (nodeValue.inputs[key]) {
                    const lora: {
                      on: boolean;
                      lora: string;
                      strength: number;
                    } = nodeValue.inputs[key];
                    loras.push({
                      ...lora,
                      lora: {
                        name: lora.lora,
                        value: lora.lora,
                      },
                    });
                  } else {
                    break;
                  }
                }
                await push(selects.powerLoraSelect.name, `power_lora_${node}`, {
                  node,
                  value: loras,
                });
              }
              if (nodeValue.class_type === 'Form Post Request Node') {
                await push(callbacks.name, `callback_${node}`, {
                  node,
                });
              }
            }

            async function push<T>(type: string, name: string, config: T) {
              const index = params.items.findIndex(
                (u) => u.name === name && u.type === type,
              );
              if (index < 0) {
                const param: ComfyUIParam<T> = {
                  masterId: model.id,
                  sequence: 0,
                  type,
                  name,
                  config,
                };
                params.items.push(param);
                param.sequence = await comfyuis.repository.workflow.param.add(
                  id,
                  param,
                );
              }
            }
          }
          return response.null();
        }),
      },
      GET: route(async (request, record) => {
        const { id } = await record.params;
        const param: DataRequest<ComfyUIParamRequestParam> =
          record.searchParams;
        const result = await comfyuis.repository.workflow.param.list(id, param);
        return response.json(result);
      }),
      POST: route(async (request, record) => {
        const { id } = await record.params;
        const param: ComfyUIParam = await request.json();
        const sequence = await comfyuis.repository.workflow.param.add(
          id,
          param,
        );
        return response.json({ sequence });
      }),
      '[sequence]': {
        clone: {
          POST: route(async (request, record) => {
            const { id, sequence: s } = await record.params;
            const param: Partial<ComfyUIParam> = await request.json();
            const source = await comfyuis.repository.workflow.param.get(id, s);
            const target: ComfyUIParam = { ...source!, ...(param ?? {}) };
            const sequence = await comfyuis.repository.workflow.param.add(
              id,
              target,
            );
            return response.json({ sequence });
          }),
        },
        GET: route(async (_, record) => {
          const { id, sequence } = await record.params;
          const param = await comfyuis.repository.workflow.param.get(
            id,
            sequence,
          );
          return response.json(param);
        }),
        PUT: route(async (request, record) => {
          const { id, sequence } = await record.params;
          const param: ComfyUIParam = await request.json();
          await comfyuis.repository.workflow.param.set(id, sequence, param);
          return response.json(null);
        }),
        DELETE: route(async (_, record) => {
          const { id, sequence } = await record.params;
          await comfyuis.repository.workflow.param.del(id, sequence);
          return response.json(null);
        }),
      },
    },
  },
};
