'use client';
import { useTranslations } from 'next-intl';

import { ComfyUIModel } from '@/comfyui';
import { ModelImporter } from '@/comfyui/client';
import { Field, FieldLabel, Input } from '@/components';
import { BusinessError } from '@/interceptors';

import { civitais as main } from '..';

export function Component() {
  const t = useTranslations();
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`civitai-import-model_id`}>
          {t('comfyui.civitai.model_id')}
        </FieldLabel>
        <Input id={`civitai-import-model_id`} name="model_id" type={'number'} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`civitai-import-model_version_id`}>
          {t('comfyui.civitai.model_version_id')}
        </FieldLabel>
        <Input
          id={`civitai-import-model_version_id`}
          name="model_version_id"
          type={'number'}
        />
      </Field>
    </>
  );
}

const importer: ModelImporter = {
  id: main.name,
  configComponent: Component,
  /**
   * civitai 的api有两种
   * 一种是model，另一种是model-version
   * 分别用于获取模型或模型版本
   * 模型下会有多个版本，我们针对版本进行解析
   * 每个版本中可能有多个文件，我们把它们作为
   * 多个模型进行存储。
   * code 就存储文件名作为逻辑主键
   * 我不清楚是否有相同文件名的情况
   * 不过应该够用了。
   */
  async configureObject(data: FormData, items) {
    const modelVersionId = data.get('modelVersionId');
    const modelId = data.get('modelId');
    if (modelVersionId) {
      try {
        const response = await fetch(
          `${civitais.url}/api/v1/model-versions/${modelVersionId}`,
        );
        const modelVersionMeta = await response.json();
        extract(modelVersionMeta, modelVersionMeta.model ?? {});
      } catch (err) {
        throw new BusinessError(
          'api fetch failed',
          'default.fetch_failed',
          err,
        );
      }
    } else if (modelId) {
      try {
        const response = await fetch(
          `${civitais.url}/api/v1/models/${modelId}`,
        );
        const modelMeta = await response.json();
        for (const modelVersionMeta of modelMeta.modelVersions) {
          extract(modelVersionMeta, modelMeta);
        }
      } catch (err) {
        throw new BusinessError(
          'api fetch failed',
          'default.fetch_failed',
          err,
        );
      }
    } else {
      throw new BusinessError('model id or model version id needed', '');
    }

    /**
     * 从civital的json信息中解析
     */
    function extract(meta: any, modelMeta: any) {
      const imageSrc = meta.images.length > 0 ? meta.images[0].url : null;
      for (const fileInfo of meta.files) {
        const { name: fileName } = fileInfo;
        const type =
          civitais.type.map[
            fileInfo.type === 'Model' ? modelMeta.type : fileInfo.type
          ];
        if (!type) continue;
        const model: ComfyUIModel = {
          id: '',
          code: fileName,
          name: modelMeta.name,
          type,
          url: `${civitais}/model-versions/${modelVersionId}`,
          path: fileName,
          html: meta.description,
          download: meta.downloadUrl,
          cover: imageSrc,
          model: meta.baseModel,
          importer: main.name,
        };
        items.push(model);
      }
    }
  },
};

export const civitais = {
  ...main,
  importer,
};
