import {ComfyUIModelImporter} from "@/modules/comfyui/client/impoter-models";
import {ComfyUIModelContentModel, ComfyUIModelModel} from "@/modules/comfyui/models";

import {BusinessError} from "@/handler/models";
import {importerName} from "../models";
import {Component} from "@/modules/comfyui/importers/civitai/client/component";

const civitaiUrl = 'https://civitai.com';
const typeMap: Record<string, string> = {
    "Checkpoint": "checkpoint",
    "Diffusion Model": "diffusion_model",
    "LORA": "lora",
    "TextEncoder": "text_encoder",
    "Text Encoder": "text_encoder",
    "VAE": "vae",
}

export const civitaiModelImporter: ComfyUIModelImporter = {
    id: importerName,
    component: Component,
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
     * @param data
     */
    async generate(data: FormData) {
        const modelVersionId = data.get("modelVersionId");
        const modelId = data.get("modelId");
        const res: ComfyUIModelModel[] = [];
        if (modelVersionId) {
            try {
                const response = await fetch(`${civitaiUrl}/api/v1/model-versions/${modelVersionId}`);
                const modelVersionMeta = await response.json();
                extractFromModelVersionMeta(modelVersionMeta, modelVersionMeta.model ?? {});
            } catch (err) {
                throw new BusinessError("api fetch failed", "default.fetch_failed", err);
            }
        } else if (modelId) {
            try {
                const response = await fetch(`${civitaiUrl}/api/v1/models/${modelId}`);
                const modelMeta = await response.json();
                for (const modelVersionMeta of modelMeta.modelVersions) {
                    extractFromModelVersionMeta(modelVersionMeta, modelMeta);
                }
            } catch (err) {
                throw new BusinessError("api fetch failed", "default.fetch_failed", err);
            }
        } else {
            throw new BusinessError("model id or model version id needed", "");
        }

        return res;

        function extractFromModelVersionMeta(meta: any, modelMeta: any) {
            console.debug(`meta model version ${modelVersionId}: `, meta);

            const imageSrc = meta.images.length > 0 ? meta.images[0].url : null;
            for (const fileInfo of meta.files) {
                const {name: fileName} = fileInfo;
                const type = typeMap[fileInfo.type === "Model" ? modelMeta.type : fileInfo.type];
                if (!type) continue;
                const content: ComfyUIModelContentModel = {
                    url: `${civitaiUrl}/model-versions/${modelVersionId}`,
                    path: fileName,
                    description: `${meta.name} - ${fileName}`,
                    html: meta.description,
                    downloadUrl: meta.downloadUrl,
                    coverSrc: imageSrc,
                    baseModel: meta.baseModel,
                    importer: importerName,
                };
                const model: ComfyUIModelModel = {
                    id: "",
                    code: fileName,
                    name: modelMeta.name,
                    type,
                    content
                };
                res.push(model);
            }
        }
    },
};