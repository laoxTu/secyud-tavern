import { eq } from 'drizzle-orm';

import {
  ComfyUIModel,
  ComfyUIModelSetting,
  ComfyUIParam,
  ComfyUIParamRequestParam,
  ComfyUIWorkflow,
  ComfyUIWorkflowInput,
} from '@/comfyui';
import { comfyuis } from '@/comfyui/server';
import { DataRequest, Entity, InDto } from '@/database';
import { databases } from '@/database/server';
import { settings } from '@/global/server';
import { BusinessError, checker } from '@/interceptors';
import { route } from '@/interceptors/server';
import { jsonUtils } from '@/utils';
import { fileUtils, response, task } from '@/utils/server';

import { LoraConfig } from '../select';

import { comfyuiModelSchema } from './schema';

export default {
  comfyuis: {
    models: {
      GET: route(async (_, records) => {
        const request = records.searchParams;
        const data = await comfyuis.repository.model.list(request);
        return response.json(data);
      }),
      POST: route(async (request) => {
        const model: ComfyUIModel = await request.json();
        const id = await comfyuis.repository.model.create(model);
        return response.json({ id });
      }),
      import: {
        POST: route(async (request) => {
          const models: ComfyUIModel[] = await request.json();
          const res: Entity[] = [];
          for (const model of models) {
            const exist = await databases.db
              .select({ id: comfyuiModelSchema.id })
              .from(comfyuiModelSchema)
              .where(eq(comfyuiModelSchema.code, model.code))
              .get();
            if (exist?.id) {
              await comfyuis.repository.model.update(exist.id, model);
              res.push(exist);
            } else {
              const id = await comfyuis.repository.model.create(model);
              res.push({ id });
            }
          }

          return response.json(res);
        }),
      },
      '[id]': {
        download: {
          POST: route(async (_, records) => {
            const { id } = await records.params;
            const model = await comfyuis.repository.model.get(id);

            const setting = await settings.repository.get<ComfyUIModelSetting>(
              comfyuis.model.setting,
            );
            checker.notNullOrWhitespace(
              'model.download',
              model.download,
              'comfyui',
            );
            const directory = checker.notNullOrWhitespace(
              'setting.directory',
              setting?.data?.directory,
              'comfyui',
            );
            const path = checker.notNullOrWhitespace(
              'model.path',
              model.path,
              'comfyui',
            );

            const filename = `${directory}/${
              {
                vae: 'vae',
                diffusion_model: 'diffusion_models',
                lora: 'loras',
                text_encoder: 'text_encoders',
                checkpoint: 'checkpoints',
              }[model.type] ?? 'loras'
            }/${path}`;

            if (await fileUtils.exists(filename)) {
              throw new BusinessError('file is exists.', 'comfyui.file_exists');
            }

            await task.create(`comfyui_model_download ${path}`, async () => {
              await comfyuis.importers.download(model, filename);
            });

            return response.null();
          }),
        },
        GET: route(async (_, record) => {
          const { id } = await record.params;
          const model = await comfyuis.repository.model.get(id);
          return response.json(model);
        }),
        PUT: route(async (request, record) => {
          const { id: originId } = await record.params;
          const model: InDto<ComfyUIModel> = await request.json();
          const id = await comfyuis.repository.model.update(originId, model);
          return response.json({ id });
        }),
        DELETE: route(async (_, record) => {
          const { id } = await record.params;
          await comfyuis.repository.model.delete(id);
          return response.json(null);
        }),
      },
    },
    workflows: {
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
          const buffer = await request.arrayBuffer();
          const input = JSON.parse(new TextDecoder().decode(buffer));
          const params = input.params;

          const id = await comfyuis.repository.workflow.create({
            ...input,
            params: undefined,
            id: undefined,
          });

          await comfyuis.repository.workflow.param.make(id, params);

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
          const id = await comfyuis.repository.workflow.update(
            originId,
            workflow,
          );
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
            const source = await comfyuis.repository.workflow.get(id);
            const params = await comfyuis.repository.workflow.param.list(id);
            const stream = fileUtils.createOnceStream(async (controller) => {
              // 将 JSON 字符串编码为 Uint8Array 并加入流
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    ...source,
                    params: params.items.map((u) => ({
                      ...u,
                      masterId: undefined,
                      sequence: undefined,
                    })),
                  }),
                ),
              );
            });
            return response.download(`workflow_${source.name}.json`, stream);
          }),
        },
        params: {
          generate: {
            POST: route(async (_, records) => {
              const { id } = await records.params;
              const model = await comfyuis.repository.workflow.get(id);

              if (model) {
                const params =
                  await comfyuis.repository.workflow.param.list(id);

                const workflow: ComfyUIWorkflowInput = jsonUtils.parse(
                  model.content,
                );
                for (const node of Object.keys(workflow)) {
                  const nodeValue = workflow[node];
                  // 生成参数，positive，power lora， diffusion model 是必须的。回调也检测一下。
                  if (nodeValue.inputs['unet_name']) {
                    const name = nodeValue.inputs['unet_name'];
                    await push('model_selector', `diffusion_model_${node}`, {
                      type: 'diffusion_model',
                      node,
                      key: 'unet_name',
                      value: {
                        name,
                        value: name,
                      },
                    });
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
                    await push('power_lora_selector', `power_lora_${node}`, {
                      node,
                      value: loras,
                    });
                  }
                  if (nodeValue.class_type === 'Form Post Request Node') {
                    await push('image_callback', `callback_${node}`, {
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
                    param.sequence =
                      await comfyuis.repository.workflow.param.add(id, param);
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
            const result = await comfyuis.repository.workflow.param.list(
              id,
              param,
            );
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
                const source = await comfyuis.repository.workflow.param.get(
                  id,
                  s,
                );
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
    },
  },
};
